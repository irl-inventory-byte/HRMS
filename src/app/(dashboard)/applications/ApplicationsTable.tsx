"use client";

import { useMemo, useState, useTransition } from "react";
import { updateInternalApplicationStatus } from "./actions";

type Row = {
  id: string; emp_id: string; name: string; title: string;
  position: string; applied_date: string; status: string;
};

export default function ApplicationsTable({ rows, canDecide }: { rows: Row[]; canDecide: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q && !(r.name + " " + r.position).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, status]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center" }}>
        <input placeholder="Search applicant, position..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All results</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="duplicate_rejected">Auto-rejected (duplicate)</option>
        </select>
        <span style={{ color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>{filtered.length} of {rows.length} shown</span>
      </div>

      <div className="tablecard">
        <table>
          <thead>
            <tr>
              <th>Emp ID</th><th>Applicant</th><th>Current Title</th><th>Position Applied For</th>
              <th>Date Applied</th><th>Result</th>{canDecide && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.emp_id}</td>
                <td><strong>{r.name}</strong></td>
                <td>{r.title}</td>
                <td>{r.position}</td>
                <td>{r.applied_date}</td>
                <td>
                  <span className="badge">
                    {r.status === "duplicate_rejected" ? "auto-rejected (duplicate)" : r.status === "accepted" ? "Accepted" : r.status === "rejected" ? "Rejected" : "Pending"}
                  </span>
                </td>
                {canDecide && (
                  <td>
                    {r.status === "pending" ? (
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <form action={(fd) => startTransition(() => updateInternalApplicationStatus(fd))} style={{ margin: 0 }}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="accepted" />
                          <button type="submit" disabled={isPending}>Accept</button>
                        </form>
                        <form action={(fd) => startTransition(() => updateInternalApplicationStatus(fd))} style={{ margin: 0 }}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button type="submit" disabled={isPending} style={{ background: "var(--crit-bg)", color: "var(--crit)", border: "1px solid var(--crit)" }}>Reject</button>
                        </form>
                      </div>
                    ) : "—"}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={canDecide ? 7 : 6}>No applications match this filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}