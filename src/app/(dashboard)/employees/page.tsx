import { createClient } from "@/lib/supabase/server";
import { Employee } from "@/types/hrms";

export default async function EmployeesPage() {
  const supabase = createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .order("name") as { data: Employee[] | null };

  return (
    <>
      <header className="top"><h1>Employee Directory</h1></header>
      <div className="tablecard">
        <table>
          <thead>
            <tr>
              <th>Emp ID</th><th>Name</th><th>Title</th><th>Org Unit</th>
              <th>Status</th><th>Joining Date</th><th>Contract End</th><th>Email</th>
            </tr>
          </thead>
          <tbody>
            {(employees ?? []).map((e) => (
              <tr key={e.id}>
                <td>{e.emp_id}</td>
                <td>{e.name}</td>
                <td>{e.title}</td>
                <td>{e.org_unit}</td>
                <td><span className="badge">{e.status}</span></td>
                <td>{e.joining_date}</td>
                <td>{e.contract_end ?? "—"}</td>
                <td>{e.office_email ?? e.personal_email ?? "—"}</td>
              </tr>
            ))}
            {(!employees || employees.length === 0) && (
              <tr><td colSpan={8}>No employees yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}