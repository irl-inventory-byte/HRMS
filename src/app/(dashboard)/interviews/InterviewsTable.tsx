"use client";

import { useMemo, useState, useTransition } from "react";
import { updateInterviewOutcome } from "./actions";

type Row = {
  id: string; candidate_name: string; candidate_email: string; candidate_phone: string | null;
  position: string; round: number; interview_date: string; interviewer: string;
  outcome: string; feedback: string | null; rejectionCount: number;
};

export default function InterviewsTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (outcome !== "all" && r.outcome !== outcome) return false;
      if (q && !(r.candidate_name + " " + r.candidate_email + " " + r.position).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, outcome]);

  function openEdit(r: Row) {
    setEditing(r);
    setError(null);
  }

  function handleSave(fd: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await updateInterviewOutcome(fd);
        setEditing(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save interview.");
      }
    });
  }

  const inputStyle = { width: "100%" };

  return (
    <>
      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center" }}>
        <input placeholder="Search candidate, position, email..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
        <select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          <option value="all">All outcomes</option>
          <option value="pending">Pending</option>
          <option value="passed">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
        <span style={{ color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>{filtered.length} of {rows.length} shown</span>
      </div>

      <div className="tablecard">
        <table>
          <thead>
            <tr>
              <th>Candidate</th><th>Email</th><th>Phone</th><th>Position</th><th>Round</th>
              <th>Interview Date</th><th>Interviewer</th><th>Outcome</th><th>Feedback</th><th>History</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.candidate_name}</strong></td>
                <td>{r.candidate_email}</td>
                <td>{r.candidate_phone ?? "—"}</td>
                <td>{r.position}</td>
                <td>Round {r.round}</td>
                <td>{r.interview_date}</td>
                <td>{r.interviewer}</td>
                <td>
                  <span className="badge">
                    {r.outcome === "passed" ? "Selected" : r.outcome === "rejected" ? "Rejected" : "Pending"}
                  </span>
                </td>
                <td>{r.feedback ?? "—"}</td>
                <td>
                  {r.rejectionCount >= 2 ? (
                    <span className="badge" style={{ color: "var(--crit)", background: "var(--crit-bg)" }}>
                      {r.rejectionCount} rejections
                    </span>
                  ) : "—"}
                </td>
                <td><button onClick={() => openEdit(r)}>Update</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={11}>No interview records match this filter.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => !isPending && setEditing(null)}
        >
          <div className="card" style={{ width: 560, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <h3 style={{ margin: 0 }}>Update Interview Record</h3>
              <button type="button" onClick={() => setEditing(null)} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-dim)" }}>×</button>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4, marginBottom: 16 }}>
              Candidates are matched by email across interview rounds. If this candidate has an earlier rejection on file, you&apos;ll see a warning before saving.
            </p>

            <form action={handleSave}>
              <input type="hidden" name="id" value={editing.id} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label>Candidate name</label>
                  <input value={editing.candidate_name} disabled style={inputStyle} />
                </div>
                <div>
                  <label>Candidate email</label>
                  <input value={editing.candidate_email} disabled style={inputStyle} />
                </div>
                <div>
                  <label>Phone</label>
                  <input value={editing.candidate_phone ?? "—"} disabled style={inputStyle} />
                </div>
                <div>
                  <label>Position</label>
                  <input value={editing.position} disabled style={inputStyle} />
                </div>
                <div>
                  <label>Round</label>
                  <input name="round" type="number" min={1} defaultValue={editing.round} style={inputStyle} />
                </div>
                <div>
                  <label>Interview date</label>
                  <input name="interview_date" type="date" defaultValue={editing.interview_date} style={inputStyle} />
                </div>
                <div>
                  <label>Interviewer</label>
                  <input value={editing.interviewer} disabled style={inputStyle} />
                </div>
                <div>
                  <label>Prior rounds on file</label>
                  <input value={`${editing.rejectionCount} rejection(s) on file`} disabled style={inputStyle} />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label>Outcome</label>
                <select name="outcome" defaultValue={editing.outcome} style={inputStyle}>
                  <option value="pending">Pending</option>
                  <option value="passed">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div style={{ marginTop: 12 }}>
                <label>Feedback</label>
                <textarea name="feedback" rows={3} defaultValue={editing.feedback ?? ""} style={inputStyle}></textarea>
              </div>

              {editing.rejectionCount >= 2 && (
                <p style={{ color: "var(--crit)", fontSize: 13, marginTop: 10 }}>
                  ⚠ This candidate already has {editing.rejectionCount} prior rejection(s) on file.
                </p>
              )}
              {error && <p style={{ color: "var(--crit)", fontSize: 13, marginTop: 10 }}>{error}</p>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <button type="button" onClick={() => setEditing(null)} disabled={isPending}>Cancel</button>
                <button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}