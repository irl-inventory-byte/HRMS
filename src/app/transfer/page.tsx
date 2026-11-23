import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { Employee } from "@/types/hrms";
import { fileTransferForm } from "./actions";
import { getCurrentUserAndRole } from "@/lib/current-user";

export default async function TransferFormPage() {
  const supabase = createClient();
  const { email, role } = await getCurrentUserAndRole();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, emp_id, name")
    .eq("status", "active") as { data: Pick<Employee, "id" | "emp_id" | "name">[] | null };

  return (
    <div className="shell">
      <Nav email={email} role={role} />
      <main className="main">
        <div className="wrap">
          <header className="top"><h1>Internal Transfer / Role Change</h1></header>
          <div className="card">
            <form action={fileTransferForm}>
              <label>Employee</label>
              <select name="employee_id" required>
                {(employees ?? []).map((e) => (
                  <option key={e.id} value={e.id}>{e.emp_id} — {e.name}</option>
                ))}
              </select>
              <label>New org unit (optional)</label>
              <input name="new_org_unit" />
              <label>New title (optional)</label>
              <input name="new_title" />
              <label>Reason</label>
              <input name="reason" required />
              <label>Feedback</label>
              <textarea name="feedback" rows={3}></textarea>
              <button type="submit">Submit transfer request</button>
            </form>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
            To convert a contract employee to full-time, use the "Convert to full-time"
            action on their row in the Employees directory (admin/HR only).
          </p>
        </div>
      </main>
    </div>
  );
}