import { createClient } from "@/lib/supabase/server";
import { Employee } from "@/types/hrms";
import { addEmployee } from "./actions";
import EmployeeTable from "./EmployeeTable";

export default async function EmployeesPage() {
  const supabase = createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .order("emp_id") as { data: Employee[] | null };

  const all = employees ?? [];
  const total = all.length;
  const active = all.filter((e) => String(e.status) === "active").length;
  const notice = all.filter((e) => String(e.status) === "notice_period").length;
  const exited = all.filter((e) => String(e.status) === "exited").length;
  const withContractEnd = all.filter((e) => e.contract_end).length;

  return (
    <>
      <header className="top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Employee Directory</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>
            Core employee records — lifecycle events (exit, internal move) update this list directly.
          </p>
        </div>

        <details style={{ position: "relative" }}>
          <summary style={{
            listStyle: "none", cursor: "pointer",
            background: "linear-gradient(135deg, var(--accent-mid), var(--accent))",
            color: "#fff", border: "1px solid var(--accent)", borderRadius: 7,
            padding: "10px 16px", fontSize: 13, fontWeight: 600, display: "inline-block",
          }}>
            + New joiner
          </summary>
          <div className="card" style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)", width: 360, zIndex: 10,
          }}>
            <form action={addEmployee}>
              <label>Emp ID</label>
              <input name="emp_id" required placeholder="EMP-1006" />

              <label>Name</label>
              <input name="name" required />

              <label>Title</label>
              <input name="title" required />

              <label>Org Unit</label>
              <input name="org_unit" required />

              <label>Manager</label>
              <input name="manager" />

              <label>Joining Date</label>
              <input name="joining_date" type="date" required />

              <label>Status</label>
              <select name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="notice_period">Notice Period</option>
                <option value="exited">Exited</option>
              </select>

              <label>Contract End</label>
              <input name="contract_end" type="date" />

              <label>Exit Reason</label>
              <input name="exit_reason" />

              <label>Office Email</label>
              <input name="office_email" type="email" />

              <label>Personal Email</label>
              <input name="personal_email" type="email" />

              <label>Phone</label>
              <input name="phone" />

              <button type="submit">Add joiner</button>
            </form>
          </div>
        </details>
      </header>

      <div className="tiles">
        <div className="tile" style={{ borderTop: "3px solid var(--accent)" }}>
          <div className="tile-value">{total}</div>
          <div className="tile-label">Total headcount</div>
        </div>
        <div className="tile" style={{ borderTop: "3px solid #2ecc71" }}>
          <div className="tile-value">{active}</div>
          <div className="tile-label">Active</div>
        </div>
        <div className="tile" style={{ borderTop: "3px solid #e2a33d" }}>
          <div className="tile-value">{notice}</div>
          <div className="tile-label">In notice period</div>
        </div>
        <div className="tile" style={{ borderTop: "3px solid #e2493d" }}>
          <div className="tile-value">{exited}</div>
          <div className="tile-label">Exited (all time)</div>
        </div>
        <div className="tile">
          <div className="tile-value">{withContractEnd}</div>
          <div className="tile-label">Contracts with end date</div>
        </div>
      </div>

      <EmployeeTable employees={all} />
    </>
  );
}