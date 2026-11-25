import { createClient } from "@/lib/supabase/server";
import { submitApplication } from "../jobs/actions";
import CandidatesTable from "./CandidatesTable";
import NewApplicationForm from "./NewApplicationForm";

export default async function CandidatesPage() {
  const supabase = createClient();

  const [{ data: applications }, { data: openings }] = await Promise.all([
    supabase.from("job_applications").select("*, job_openings(title)").order("created_at", { ascending: false }),
    supabase.from("job_openings").select("id, title").order("title"),
  ]);

  const rows = (applications ?? []).map((a) => ({
    id: a.id,
    candidate_name: a.candidate_name,
    candidate_email: a.candidate_email,
    candidate_phone: a.candidate_phone,
    resume_url: a.resume_url,
    position: a.job_openings?.title ?? "—",
    status: a.status,
    created_at: a.created_at,
  }));

  const total = rows.length;
  const newCount = rows.filter((r) => r.status === "new").length;
  const duplicateRejected = rows.filter((r) => r.status === "duplicate_rejected").length;
  const hired = rows.filter((r) => r.status === "hired").length;

  return (
    <>
      <header className="top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Candidates</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>
            External candidates who've applied to open positions. A repeat application to the same opening is auto-rejected.
          </p>
        </div>
        <NewApplicationForm submitApplication={submitApplication} openings={openings ?? []} />
      </header>

      <div className="tiles">
        <div className="tile" style={{ borderTop: "3px solid var(--accent)" }}><div className="tile-value">{total}</div><div className="tile-label">Total candidates</div></div>
        <div className="tile" style={{ borderTop: "3px solid #e2a33d" }}><div className="tile-value">{newCount}</div><div className="tile-label">New</div></div>
        <div className="tile"><div className="tile-value">{duplicateRejected}</div><div className="tile-label">Auto-rejected (duplicate)</div></div>
        <div className="tile" style={{ borderTop: "3px solid #2ecc71" }}><div className="tile-value">{hired}</div><div className="tile-label">Hired</div></div>
      </div>

      <CandidatesTable rows={rows} />
    </>
  );
}