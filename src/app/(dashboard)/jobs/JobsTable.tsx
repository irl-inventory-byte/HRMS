"use client";

import { useMemo, useState, useTransition } from "react";
import { updateJobOpening, deleteJobOpening } from "./actions";

type Row = {
  id: string; title: string; vacancies: number;
  status: string; created_at: string; applicationCount: number;
};

export default function JobsTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Row | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, status]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center" }}>
        <input placeholder="Search position..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="on_hold">On Hold</option>
          <option value="closed">Closed</option>
        </select>
        <span style={{ color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>{filtered.length} of {rows.length} shown</span>
      </div>

      <div className="tablecard">
        <table>
          <thead>
            <tr>
              <th>Position</th><th>Vacancies</th><th>Applications</th>
              <th>Posted</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.title}</strong></td>
                <td>{r.vacancies}</td>
                <td>{r.applicationCount}</td>
                <td>{r.created_at?.slice(0, 10)}</td>
                <td>
                  <span className="badge">
                    {r.status === "open" ? "Open" : r.status === "on_hold" ? "On Hold" : "Closed"}
                  </span>
                </td>
                <td><button onClick={() => setEditing(r)}>Edit</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6}>No openings match this filter.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setEditing(null)}>
          <div className="card" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Edit Opening</h3>
              <button onClick={() => setEditing(null)}>×</button>
            </div>
            <form action={(fd) => startTransition(async () => { await updateJobOpening(fd); setEditing(null); })}>
              <input type="hidden" name="id" value={editing.id} />
              <label>Title</label>
              <input name="title" defaultValue={editing.title} required />
              <label>Vacancies</label>
              <input name="vacancies" type="number" min={0} defaultValue={editing.vacancies} />
              <label>Status</label>
              <select name="status" defaultValue={editing.status}>
                <option value="open">Open</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <form action={deleteJobOpening}>
                  <input type="hidden" name="id" value={editing.id} />
                  <button type="submit" style={{ background: "var(--crit-bg)", color: "var(--crit)", border: "1px solid var(--crit)" }}>
                    Delete
                  </button>
                </form>
                <button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}