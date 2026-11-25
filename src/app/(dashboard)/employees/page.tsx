import { createClient } from "@/lib/supabase/server";
import { Employee } from "@/types/hrms";
import { addEmployee } from "./actions";
import EmployeeTable from "./EmployeeTable";
import NewJoinerForm from "./NewJoinerForm";

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

        <NewJoinerForm addEmployee={addEmployee} />
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