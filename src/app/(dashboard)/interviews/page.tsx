import { createClient } from "@/lib/supabase/server";
import { recordInterview } from "./actions";
import InterviewsTable from "./InterviewsTable";

export default async function InterviewsPage() {
  const supabase = createClient();

  const { data: applications } = await supabase.from("job_applications").select("*, job_openings(title)");
  const { data: interviews } = await supabase.from("interview_entries").select("*").order("interview_date", { ascending: false });

  const interviewerIds = Array.from(new Set((interviews ?? []).map((i) => i.interviewer_id).filter(Boolean)));
  const { data: interviewerProfiles } = interviewerIds.length
    ? await supabase.from("profiles").select("id, email").in("id", interviewerIds)
    : { data: [] };
  const interviewerEmailMap = new Map((interviewerProfiles ?? []).map((p) => [p.id, p.email]));

  const appById = new Map((applications ?? []).map((a) => [a.id, a]));

  const rejectionCounts = new Map<string, number>();
  for (const i of interviews ?? []) {
    if (i.outcome === "rejected") {
      rejectionCounts.set(i.candidate_email, (rejectionCounts.get(i.candidate_email) ?? 0) + 1);
    }
  }

  const rows = (interviews ?? []).map((i) => {
    const app = appById.get(i.application_id);
    return {
      id: i.id,
      candidate_name: app?.candidate_name ?? "Unknown",
      candidate_email: i.candidate_email,
      candidate_phone: app?.candidate_phone ?? null,
      position: app?.job_openings?.title ?? "—",
      round: i.round,
      interview_date: i.interview_date,
      interviewer: interviewerEmailMap.get(i.interviewer_id) ?? "—",
      outcome: i.outcome,
      feedback: i.feedback,
      rejectionCount: rejectionCounts.get(i.candidate_email) ?? 0,
    };
  });

  const total = rows.length;
  const uniqueCandidates = new Set(rows.map((r) => r.candidate_email)).size;
  const selected = rows.filter((r) => r.outcome === "passed").length;

  const byEmail = new Map<string, string[]>();
  for (const r of rows) {
    byEmail.set(r.candidate_email, [...(byEmail.get(r.candidate_email) ?? []), r.outcome]);
  }
  const rejectedAllRounds = Array.from(byEmail.values()).filter((outcomes) => outcomes.every((o) => o === "rejected")).length;
  const with2PlusRejections = Array.from(rejectionCounts.values()).filter((c) => c >= 2).length;

  return (
    <>
      <header className="top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Interviews</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>
            Every round for every candidate, matched by email. Repeat rejections are flagged automatically.
          </p>
        </div>
        <details style={{ position: "relative" }}>
          <summary style={{ listStyle: "none", cursor: "pointer", background: "linear-gradient(135deg, var(--accent-mid), var(--accent))", color: "#fff", border: "1px solid var(--accent)", borderRadius: 7, padding: "10px 16px", fontSize: 13, fontWeight: 600, display: "inline-block" }}>
            + Log interview
          </summary>
          <div className="card" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, zIndex: 10 }}>
            <form action={recordInterview}>
              <label>Application</label>
              <select name="application_id" required>
                {(applications ?? []).map((a) => (
                  <option key={a.id} value={a.id}>{a.candidate_name} — {a.candidate_email}</option>
                ))}
              </select>
              <label>Round</label>
              <input name="round" type="number" min={1} defaultValue={1} />
              <label>Interview date</label>
              <input name="interview_date" type="date" required />
              <label>Outcome</label>
              <select name="outcome" defaultValue="pending">
                <option value="pending">Pending</option>
                <option value="passed">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
              <label>Feedback</label>
              <textarea name="feedback" rows={3}></textarea>
              <button type="submit">Save</button>
            </form>
          </div>
        </details>
      </header>

      <div className="tiles">
        <div className="tile" style={{ borderTop: "3px solid var(--accent)" }}><div className="tile-value">{total}</div><div className="tile-label">Total interview records</div></div>
        <div className="tile"><div className="tile-value">{uniqueCandidates}</div><div className="tile-label">Unique candidates</div></div>
        <div className="tile" style={{ borderTop: "3px solid #2ecc71" }}><div className="tile-value">{selected}</div><div className="tile-label">Selected</div></div>
        <div className="tile" style={{ borderTop: "3px solid #e2493d" }}><div className="tile-value">{rejectedAllRounds}</div><div className="tile-label">Rejected (all rounds)</div></div>
        <div className="tile" style={{ borderTop: "3px solid #e2a33d" }}><div className="tile-value">{with2PlusRejections}</div><div className="tile-label">Candidates with 2+ rejections</div></div>
      </div>

      <InterviewsTable rows={rows} />
    </>
  );
}