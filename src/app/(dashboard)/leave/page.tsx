import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";
import { applyLeave, updateLeaveStatus } from "./actions";
import LeaveTable from "./LeaveTable";
import ApplyLeaveForm from "./ApplyLeaveForm";

const DEFAULTS: Record<string, number> = { casual: 12, sick: 10, earned: 15 };

export default async function LeavePage() {
  const supabase = createClient();

  const [{ role }, { data: employees }, { data: requests }, { data: balances }] = await Promise.all([
    getCurrentUserAndRole(),
    supabase.from("employees").select("id, emp_id, name").order("name"),
    supabase.from("leave_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("leave_balances").select("*"),
  ]);

  const canApprove = ["admin", "hr", "manager"].includes(role ?? "");

  const balanceMap = new Map((balances ?? []).map((b) => [b.employee_id, b]));
  const employeeMap = new Map((employees ?? []).map((e) => [e.id, e]));

  const approvedByEmployeeAndType = new Map<string, number>();
  for (const r of requests ?? []) {
    if (r.status === "approved") {
      const key = `${r.employee_id}:${r.leave_type}`;
      approvedByEmployeeAndType.set(key, (approvedByEmployeeAndType.get(key) ?? 0) + r.days);
    }
  }

  const rows = (requests ?? []).map((r) => {
    const emp = employeeMap.get(r.employee_id);
    const bal = balanceMap.get(r.employee_id);
    const total =
      bal?.[`${r.leave_type}_total` as keyof typeof bal] ?? DEFAULTS[r.leave_type] ?? 0;
    const used = approvedByEmployeeAndType.get(`${r.employee_id}:${r.leave_type}`) ?? 0;
    return {
      id: r.id,
      emp_id: emp?.emp_id ?? "—",
      name: emp?.name ?? "Unknown",
      leave_type: r.leave_type,
      from_date: r.from_date,
      to_date: r.to_date,
      days: r.days,
      reason: r.reason,
      status: r.status,
      balance_left: (total as number) - used,
      balance_total: total as number,
    };
  });

  const total = rows.length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const approved = rows.filter((r) => r.status === "approved").length;
  const today = new Date().toISOString().slice(0, 10);
  const onLeaveToday = rows.filter(
    (r) => r.status === "approved" && r.from_date <= today && r.to_date >= today
  ).length;

  return (
    <>
      <header className="top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Leave &amp; Attendance</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>
            Leave requests, approvals and balances across Casual, Sick and Earned leave.
          </p>
        </div>

        <ApplyLeaveForm applyLeave={applyLeave} employees={employees ?? []} />
      </header>

      <div className="tiles">
        <div className="tile" style={{ borderTop: "3px solid var(--accent)" }}>
          <div className="tile-value">{total}</div>
          <div className="tile-label">Total requests on file</div>
        </div>
        <div className="tile" style={{ borderTop: "3px solid #e2a33d" }}>
          <div className="tile-value">{pending}</div>
          <div className="tile-label">Pending approval</div>
        </div>
        <div className="tile" style={{ borderTop: "3px solid #2ecc71" }}>
          <div className="tile-value">{approved}</div>
          <div className="tile-label">Approved</div>
        </div>
        <div className="tile">
          <div className="tile-value">{onLeaveToday}</div>
          <div className="tile-label">On leave today</div>
        </div>
      </div>

      <LeaveTable rows={rows} canApprove={canApprove} updateLeaveStatus={updateLeaveStatus} />
    </>
  );
}