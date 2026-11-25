"use client";

import { useMemo, useState } from "react";

type Row = {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  resume_url: string | null;
  position: string;
  status: string;
  created_at: string;
};

function statusLabel(s: string) {
  if (s === "duplicate_rejected") return "Duplicate (auto-rejected)";
  if (s === "in_review") return "In Review";
  if (s === "hired") return "Hired";
  if (s === "rejected") return "Rejected";
  return "New";
}

export default function CandidatesTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q && !(r.candidate_name + " " + r.candidate_email + " " + r.position).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, status]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center" }}>
        <input
          placeholder="Search candidate, position, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="in_review">In Review</option>
          <option value="rejected">Rejected</option>
          <option value="duplicate_rejected">Duplicate (auto-rejected)</option>
          <option value="hired">Hired</option>
        </select>
        <span style={{ color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>
          {filtered.length} of {rows.length} shown
        </span>
      </div>

      <div className="tablecard">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Position</th>
              <th>Resume</th><th>Status</th><th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.candidate_name}</strong></td>
                <td>{r.candidate_email}</td>
                <td>{r.candidate_phone ?? "—"}</td>
                <td>{r.position}</td>
                <td>{r.resume_url ? <a href={r.resume_url} target="_blank" rel="noreferrer">View</a> : "—"}</td>
                <td><span className="badge">{statusLabel(r.status)}</span></td>
                <td>{r.created_at?.slice(0, 10) ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}>No candidates match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}