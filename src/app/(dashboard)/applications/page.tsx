import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";
import { submitInternalApplication } from "./actions";
import ApplicationsTable from "./ApplicationsTable";

export default async function ApplicationsPage() {
  const supabase = createClient();

  const [{ role }, { data: apps }, { data: employees }, { data: openings }] = await Promise.all([
    getCurrentUserAndRole(),
    supabase.from("internal_job_applications").select("*, employees(emp_id, name, title), job_openings(title)").order("applied_date", { ascending: false }),
    supabase.from("employees").select("id, emp_id, name").eq("status", "active"),
    supabase.from("job_openings").select("id, title").eq("status", "open"),
  ]);

  const canDecide = ["admin", "hr"].includes(role ?? "");

  const rows = (apps ?? []).map((a) => ({
    id: a.id,
    emp_id: a.employees?.emp_id ?? "—",
    name: a.employees?.name ?? "Unknown",
    title: a.employees?.title ?? "—",
    position: a.job_openings?.title ?? "—",
    applied_date: a.applied_date,
    status: a.status,
  }));

  const total = rows.length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const accepted = rows.filter((r) => r.status === "accepted").length;
  const duplicateRejected = rows.filter((r) => r.status === "duplicate_rejected").length;

  return (
    <>
      <header className="top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Applications</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>
            Every internal application on file. A repeat application for the same position is auto-rejected on submit.
          </p>
        </div>
        <details style={{ position: "relative" }}>
          <summary style={{ listStyle: "none", cursor: "pointer", background: "linear-gradient(135deg, var(--accent-mid), var(--accent))", color: "#fff", border: "1px solid var(--accent)", borderRadius: 7, padding: "10px 16px", fontSize: 13, fontWeight: 600, display: "inline-block" }}>
            + New job application
          </summary>
          <div className="card" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, zIndex: 10 }}>
            <form action={submitInternalApplication}>
              <label>Employee</label>
              <select name="employee_id" required>
                {(employees ?? []).map((e) => <option key={e.id} value={e.id}>{e.emp_id} — {e.name}</option>)}
              </select>
              <label>Position applied for</label>
              <select name="job_opening_id" required>
                {(openings ?? []).map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
              </select>
              <button type="submit">Submit application</button>
            </form>
          </div>
        </details>
      </header>

      <div className="tiles">
        <div className="tile" style={{ borderTop: "3px solid var(--accent)" }}><div className="tile-value">{total}</div><div className="tile-label">Total applications</div></div>
        <div className="tile" style={{ borderTop: "3px solid #e2a33d" }}><div className="tile-value">{pending}</div><div className="tile-label">Pending review</div></div>
        <div className="tile" style={{ borderTop: "3px solid #2ecc71" }}><div className="tile-value">{accepted}</div><div className="tile-label">Accepted</div></div>
        <div className="tile"><div className="tile-value">{duplicateRejected}</div><div className="tile-label">Auto-rejected (duplicate)</div></div>
      </div>

      <ApplicationsTable rows={rows} canDecide={canDecide} />
    </>
  );
}