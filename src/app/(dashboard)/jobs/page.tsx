import { createClient } from "@/lib/supabase/server";
import { createJobOpening, submitApplication } from "./actions";
import JobsTable from "./JobsTable";

export default async function JobsPage() {
  const supabase = createClient();
  const { data: openings } = await supabase.from("job_openings").select("*").order("created_at", { ascending: false });
  const { data: applications } = await supabase.from("job_applications").select("*").order("created_at", { ascending: false });

  const appCountByOpening = new Map<string, number>();
  for (const a of applications ?? []) {
    appCountByOpening.set(a.job_opening_id, (appCountByOpening.get(a.job_opening_id) ?? 0) + 1);
  }

  const rows = (openings ?? []).map((o) => ({
    ...o,
    applicationCount: appCountByOpening.get(o.id) ?? 0,
  }));

  const total = rows.length;
  const open = rows.filter((r) => r.status === "open").length;
  const totalVacanciesOpen = rows.filter((r) => r.status === "open").reduce((sum, r) => sum + (r.vacancies ?? 0), 0);
  const onHold = rows.filter((r) => r.status === "on_hold").length;

  return (
    <>
      <header className="top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Job Openings</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>Every open position and how many vacancies are left on each.</p>
        </div>
        <details style={{ position: "relative" }}>
          <summary style={{ listStyle: "none", cursor: "pointer", background: "linear-gradient(135deg, var(--accent-mid), var(--accent))", color: "#fff", border: "1px solid var(--accent)", borderRadius: 7, padding: "10px 16px", fontSize: 13, fontWeight: 600, display: "inline-block" }}>
            + New opening
          </summary>
          <div className="card" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, zIndex: 10 }}>
            <form action={createJobOpening}>
              <label>Title</label><input name="title" required />
              <label>Vacancies</label><input name="vacancies" type="number" min={1} defaultValue={1} />
              <button type="submit">Create opening</button>
            </form>
          </div>
        </details>
      </header>

      <div className="tiles">
        <div className="tile" style={{ borderTop: "3px solid var(--accent)" }}><div className="tile-value">{total}</div><div className="tile-label">Total positions on file</div></div>
        <div className="tile" style={{ borderTop: "3px solid #2ecc71" }}><div className="tile-value">{open}</div><div className="tile-label">Open positions</div></div>
        <div className="tile" style={{ borderTop: "3px solid #2ecc71" }}><div className="tile-value">{totalVacanciesOpen}</div><div className="tile-label">Total vacancies (open)</div></div>
        <div className="tile" style={{ borderTop: "3px solid #e2a33d" }}><div className="tile-value">{onHold}</div><div className="tile-label">On hold</div></div>
      </div>

      <JobsTable rows={rows} />

      <div className="card" style={{ marginTop: 24 }}>
        <h3>New job application</h3>
        <form action={submitApplication}>
          <label>Job opening</label>
          <select name="job_opening_id" required>
            {(openings ?? []).map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
          <label>Candidate name</label><input name="candidate_name" required />
          <label>Candidate email</label><input name="candidate_email" type="email" required />
          <label>Phone</label><input name="candidate_phone" />
          <label>Resume URL</label><input name="resume_url" />
          <button type="submit">Submit application</button>
        </form>
      </div>
    </>
  );
}