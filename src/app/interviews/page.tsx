import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { InterviewEntry, JobApplication } from "@/types/hrms";
import { recordInterview } from "./actions";

export default async function InterviewsPage() {
  const supabase = createClient();
  const { data: applications } = await supabase
    .from("job_applications")
    .select("*") as { data: JobApplication[] | null };

  const { data: interviews } = await supabase
    .from("interview_entries")
    .select("*")
    .order("created_at", { ascending: false }) as { data: InterviewEntry[] | null };

  const rejectionCounts = new Map<string, number>();
  for (const i of interviews ?? []) {
    if (i.outcome === "rejected") {
      rejectionCounts.set(i.candidate_email, (rejectionCounts.get(i.candidate_email) ?? 0) + 1);
    }
  }

  return (
    <div className="shell">
      <Nav />
      <main className="main">
        <div className="wrap">
          <header className="top"><h1>Interview Tracking</h1></header>

          <div className="tablecard">
            <table>
              <thead><tr><th>Candidate</th><th>Round</th><th>Outcome</th><th>Feedback</th></tr></thead>
              <tbody>
                {(interviews ?? []).map((i) => {
                  const count = rejectionCounts.get(i.candidate_email) ?? 0;
                  return (
                    <tr key={i.id}>
                      <td>
                        {i.candidate_email}
                        {count > 1 && (
                          <span className="badge" style={{ marginLeft: 8, color: "var(--crit)", background: "var(--crit-bg)" }}>
                            rejected {count}x before
                          </span>
                        )}
                      </td>
                      <td>{i.round}</td>
                      <td><span className="badge">{i.outcome}</span></td>
                      <td>{i.feedback ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h4>Record interview (interviewer/admin/HR)</h4>
            <form action={recordInterview}>
              <label>Application</label>
              <select name="application_id" required>
                {(applications ?? []).map((a) => (
                  <option key={a.id} value={a.id}>{a.candidate_name} — {a.candidate_email}</option>
                ))}
              </select>
              <input type="hidden" name="candidate_email" />
              <label>Round</label>
              <input name="round" type="number" min={1} defaultValue={1} />
              <label>Outcome</label>
              <select name="outcome">
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="rejected">Rejected</option>
              </select>
              <label>Feedback</label>
              <textarea name="feedback" rows={3}></textarea>
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}