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
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (outcome !== "all" && r.outcome !== outcome) return false;
      if (q && !(r.candidate_name + " " + r.candidate_email + " " + r.position).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, outcome]);

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
                <td><button onClick={() => setEditing(r)}>Update</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={11}>No interview records match this filter.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setEditing(null)}>
          <div className="card" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Update Interview — {editing.candidate_name}</h3>
            <form action={(fd) => startTransition(async () => { await updateInterviewOutcome(fd); setEditing(null); })}>
              <input type="hidden" name="id" value={editing.id} />
              <label>Outcome</label>
              <select name="outcome" defaultValue={editing.outcome}>
                <option value="pending">Pending</option>
                <option value="passed">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
              <label>Feedback</label>
              <textarea name="feedback" rows={3} defaultValue={editing.feedback ?? ""}></textarea>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" onClick={() => setEditing(null)}>Close</button>
                <button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}