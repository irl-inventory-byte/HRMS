import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentUserAndRole } from "@/lib/current-user";
import { submitApplication } from "../(dashboard)/jobs/actions";

export default async function ApplyPage() {
  const { user, email } = await getCurrentUserAndRole();

  if (!user) {
    redirect("/login");
  }

  const supabase = createClient();
  const { data: openings } = await supabase
    .from("job_openings")
    .select("id, title")
    .eq("status", "open")
    .order("title");

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 20px" }}>
      <h1 style={{ marginBottom: 8 }}>Job Application</h1>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 24 }}>
        Signed in as {email}. Submit your application for an open position below.
      </p>

      <div className="card">
        <form action={submitApplication}>
          <label>Job opening</label>
          <select name="job_opening_id" required>
            {(openings ?? []).map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>

          <label>Candidate name</label>
          <input name="candidate_name" required />

          <label>Candidate email</label>
          <input name="candidate_email" type="email" defaultValue={email ?? ""} required />

          <label>Phone</label>
          <input name="candidate_phone" />

          <label>Resume URL</label>
          <input name="resume_url" />

          <button type="submit">Submit application</button>
        </form>
      </div>
    </div>
  );
}