import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { Employee } from "@/types/hrms";
import { fileExitForm } from "./actions";

export default async function ExitFormPage() {
  const supabase = createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, emp_id, name")
    .eq("status", "active") as { data: Pick<Employee, "id" | "emp_id" | "name">[] | null };

  return (
    <>
      <Nav />
      <div className="page">
        <h1>Exit Form</h1>
        <div className="card">
          <form action={fileExitForm}>
            <label>Employee</label>
            <select name="employee_id" required>
              {(employees ?? []).map((e) => (
                <option key={e.id} value={e.id}>{e.emp_id} — {e.name}</option>
              ))}
            </select>

            <label>Exit reason</label>
            <input name="exit_reason" required />

            <label>Last working day</label>
            <input type="date" name="last_working_day" required />

            <label>Notes</label>
            <textarea name="notes" rows={3}></textarea>

            <button type="submit">File exit form</button>
          </form>
        </div>
      </div>
    </>
  );
}
