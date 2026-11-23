import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";
import { JobOpening, JobApplication } from "@/types/hrms";
import { submitApplication, createJobOpening, closeJobOpening, deleteJobOpening } from "./actions";

export default async function JobsPage() {
  const supabase = createClient();
  const { role } = await getCurrentUserAndRole();
  const isAdmin = role === "admin";

  const { data: openings } = await supabase
    .from("job_openings")
    .select("*")
    .order("created_at", { ascending: false }) as { data: JobOpening[] | null };

  const { data: applications } = await supabase
    .from("job_applications")
    .select("*")
    .order("created_at", { ascending: false }) as { data: JobApplication[] | null };

  return (
    <>
      <header className="top"><h1>Job Openings &amp; Applications</h1></header>

      <div className="card">
        <h3>Open positions ({(openings ?? []).filter(o => o.status === "open").length})</h3>
        <table style={{ textAlign: "center" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Title</th>
              <th style={{ textAlign: "center" }}>Org Unit</th>
              <th style={{ textAlign: "center" }}>Vacancies</th>
              <th style={{ textAlign: "center" }}>Status</th>
              {isAdmin && <th style={{ textAlign: "center" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {(openings ?? []).map((o) => (
              <tr key={o.id}>
                <td>{o.title}</td>
                <td>{o.org_unit}</td>
                <td>{o.vacancies}</td>
                <td><span className="badge">{o.status}</span></td>
                {isAdmin && (
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {o.status !== "closed" && (
                        <form action={closeJobOpening} style={{ margin: 0 }}>
                          <input type="hidden" name="id" value={o.id} />
                          <button type="submit">Close</button>
                        </form>
                      )}
                      <form action={deleteJobOpening} style={{ margin: 0 }}>
                        <input type="hidden" name="id" value={o.id} />
                        <button
                          type="submit"
                          style={{ background: "var(--crit-bg)", color: "var(--crit)", border: "1px solid var(--crit)" }}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {(!openings || openings.length === 0) && (
              <tr><td colSpan={isAdmin ? 5 : 4}>No openings yet.</td></tr>
            )}
          </tbody>
        </table>
        <h4>Post new opening</h4>
        <form action={createJobOpening}>
          <label>Title</label><input name="title" required />
          <label>Org unit</label><input name="org_unit" required />
          <label>Vacancies</label><input name="vacancies" type="number" min={1} defaultValue={1} />
          <button type="submit">Create opening</button>
        </form>
      </div>

      <div className="card">
        <h3>Applications</h3>
        <table style={{ textAlign: "center" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Candidate</th>
              <th style={{ textAlign: "center" }}>Email</th>
              <th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(applications ?? []).map((a) => (
              <tr key={a.id}>
                <td>{a.candidate_name}</td>
                <td>{a.candidate_email}</td>
                <td>
                  <span className="badge">
                    {a.status === "duplicate_rejected" ? "auto-rejected (duplicate)" : a.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!applications || applications.length === 0) && (
              <tr><td colSpan={3}>No applications yet.</td></tr>
            )}
          </tbody>
        </table>
        <h4>New application</h4>
        <form action={submitApplication}>
          <label>Job opening</label>
          <select name="job_opening_id" required>
            {(openings ?? []).map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
          <label>Candidate name</label><input name="candidate_name" required />
          <label>Candidate email</label><input name="candidate_email" type="email" required />
          <label>Phone</label><input name="candidate_phone" />
          <label>Resume URL</label><input name="resume_url" />
          <button type="submit">Submit application</button>
        </form>
        <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
          A second application from the same email to the same opening is auto-rejected.
        </p>
      </div>
    </>
  );
}