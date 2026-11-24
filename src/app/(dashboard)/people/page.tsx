import { createClient } from "@/lib/supabase/server";
import { addPerson } from "./actions";
import PeopleTable from "./PeopleTable";

export default async function PeoplePage() {
  const supabase = createClient();
  const { data: people } = await supabase.from("people").select("*").order("full_name");

  return (
    <>
      <header className="top"><h1>People</h1></header>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 4 }}>
        A lighter-weight person registry — for assigning things to people across hubs/cities, separate from full employee records.
      </p>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 16 }}>
        {(people ?? []).length} people. Email and mobile number are required when adding a person.
        Use their Google login email to link their account. Deactivate instead of deleting so history stays intact.
      </p>

      <PeopleTable people={people ?? []} />

      <div className="card" style={{ marginTop: 24 }}>
        <h4>Add person</h4>
        <form action={addPerson} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div><label>Full name</label><input name="full_name" required /></div>
          <div>
            <label>Role</label>
            <select name="role">
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="manager">Manager</option>
              <option value="interviewer">Interviewer</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div><label>City</label><input name="city" /></div>
          <div><label>Email (required)</label><input name="email" type="email" required /></div>
          <div><label>Mobile (required)</label><input name="mobile" required /></div>
          <button type="submit">Add person</button>
        </form>
      </div>
    </>
  );
}