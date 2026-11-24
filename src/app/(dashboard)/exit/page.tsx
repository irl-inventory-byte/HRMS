import { createClient } from "@/lib/supabase/server";
import { Employee } from "@/types/hrms";
import { fileExitForm } from "./actions";

export default async function OffboardingFormPage() {
  const supabase = createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, emp_id, name")
    .eq("status", "active") as { data: Pick<Employee, "id" | "emp_id" | "name">[] | null };

  return (
    <>
      <header className="top"><h1>Offboarding Form</h1></header>
      <div className="card">
        <form action={fileExitForm}>
          <label>Employee (link to record)</label>
          <select name="employee_id" required>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>{e.emp_id} — {e.name}</option>
            ))}
          </select>

          <label>Employee Full Name (as per company records)</label>
          <input name="employee_full_name_entered" required />

          <label>Employee ID</label>
          <input name="employee_id_entered" required />

          <label>Employee Official Email ID</label>
          <input
            name="employee_official_email"
            placeholder='If the employee does not have a work email, enter "N/A"'
            required
          />

          <label>Reporting Manager Full Name</label>
          <input name="reporting_manager_name" required />

          <label>Last Working Day (LWD)</label>
          <input type="date" name="last_working_day" required />

          <label>Can we delete the Gmail account on Last Working Day?</label>
          <select name="delete_gmail_on_lwd" required>
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="no_email_accounts">No Email Accounts</option>
          </select>

          <label>Where should the Laptop &amp; Charger be returned?</label>
          <select name="laptop_return_location" required>
            <option value="">Select...</option>
            <option value="it_team">IT Team</option>
            <option value="no_laptop_assigned">No Laptops Assigned</option>
          </select>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: -8, marginBottom: 12 }}>
            If the laptop is to be returned to the IT Team, the respective manager should submit
            the laptop (with its serial number) to the IT Team on the employee&apos;s last working day.
          </p>

          <label>Laptop Serial Number (S/N)</label>
          <input
            name="laptop_serial_number"
            placeholder='Enter in CAPITAL LETTERS. If no laptop is assigned, enter "N/A"'
            required
          />

          <label>Does the employee have a company-issued SIM card?</label>
          <select name="has_company_sim" required>
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <label>Mobile Number (for company-issued SIM card)</label>
          <input
            name="company_sim_mobile_number"
            placeholder='If Yes, provide the mobile number. If No, enter "N/A"'
            required
          />

          <label>Exit reason</label>
          <input name="exit_reason" required />

          <label>Additional Comments</label>
          <textarea name="notes" rows={3}></textarea>

          <button type="submit">File offboarding form</button>
        </form>
      </div>
    </>
  );
}