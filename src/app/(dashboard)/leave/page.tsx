import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

const DEFAULTS: Record<string, number> = { casual: 12, sick: 10, earned: 15 };

export default async function LeavePage() {
  const supabase = createClient();
  async function applyLeave(formData: FormData) {
    "use server";

    const employeeId = String(formData.get("employee_id") ?? "").trim();
    const leaveType = String(formData.get("leave_type") ?? "");
    const fromDate = String(formData.get("from_date") ?? "");
    const toDate = String(formData.get("to_date") ?? "");
    const reason = String(formData.get("reason") ?? "").trim();
    const start = new Date(`${fromDate}T00:00:00Z`);
    const end = new Date(`${toDate}T00:00:00Z`);

    if (
      !employeeId ||
      !["casual", "sick", "earned"].includes(leaveType) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fromDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(toDate) ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return;
    }

    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    const { error } = await createClient().from("leave_requests").insert({
      employee_id: employeeId,
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      days,
      reason: reason || null,
      status: "pending",
    });

    if (!error) revalidatePath("/leave");
  }

  const { role } = await getCurrentUserAndRole();
  const canApprove = ["admin", "hr", "manager"].includes(role ?? "");

  const { data: employees } = await supabase
    .from("employees")
    .select("id, emp_id, name")
    .order("name");

  const { data: requests } = await supabase
    .from("leave_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: balances } = await supabase
    .from("leave_balances")
    .select("*");

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

        <details style={{ position: "relative" }}>
          <summary style={{
            listStyle: "none", cursor: "pointer",
            background: "linear-gradient(135deg, var(--accent-mid), var(--accent))",
            color: "#fff", border: "1px solid var(--accent)", borderRadius: 7,
            padding: "10px 16px", fontSize: 13, fontWeight: 600, display: "inline-block",
          }}>
            + Apply leave
          </summary>
          <div className="card" style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, zIndex: 10,
          }}>
            <form action={applyLeave}>
              <label>Employee</label>
              <select name="employee_id" required>
                {(employees ?? []).map((e) => (
                  <option key={e.id} value={e.id}>{e.emp_id} — {e.name}</option>
                ))}
              </select>

              <label>Leave type</label>
              <select name="leave_type" required>
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="earned">Earned</option>
              </select>

              <label>From</label>
              <input name="from_date" type="date" required />

              <label>To</label>
              <input name="to_date" type="date" required />

              <label>Reason</label>
              <input name="reason" />

              <button type="submit">Submit request</button>
            </form>
          </div>
        </details>
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

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Balance</th>
              {canApprove && <th>Review</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={canApprove ? 9 : 8} style={{ textAlign: "center" }}>
                  No leave requests found.
                </td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td>{row.emp_id} — {row.name}</td>
                <td>{row.leave_type}</td>
                <td>{row.from_date}</td>
                <td>{row.to_date}</td>
                <td>{row.days}</td>
                <td>{row.reason || "—"}</td>
                <td>{row.status}</td>
                <td>{row.balance_left} / {row.balance_total}</td>
                {canApprove && <td>{row.status === "pending" ? "Pending review" : "—"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}