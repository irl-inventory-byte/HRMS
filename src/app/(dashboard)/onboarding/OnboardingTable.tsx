"use client";

import { useMemo, useState, useTransition } from "react";
import { CHECKLIST_ITEMS } from "./checklistItems";
import { updateOnboardingEntry } from "./actions";

type Entry = {
  id: string;
  name: string;
  position: string;
  org_unit: string;
  start_date: string;
  status: "completed" | "overdue" | "in_progress" | "not_started";
  checked: number;
  total: number;
} & Record<string, any>;

function statusLabel(s: Entry["status"]) {
  if (s === "completed") return "Completed";
  if (s === "overdue") return "Overdue";
  if (s === "in_progress") return "In Progress";
  return "Not Started";
}

export default function OnboardingTable({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [active, setActive] = useState<Entry | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, query, status]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center" }}>
        <input
          placeholder="Search new joiner..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <span style={{ color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>
          {filtered.length} of {entries.length} shown
        </span>
      </div>

      <div className="tablecard">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Position</th><th>Org Unit</th><th>Start Date</th>
              <th>Checklist</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td><strong>{e.name}</strong></td>
                <td>{e.position}</td>
                <td>{e.org_unit}</td>
                <td>{e.start_date}</td>
                <td>{e.checked} / {e.total}</td>
                <td><span className="badge">{statusLabel(e.status)}</span></td>
                <td>
                  <button onClick={() => setActive(e)}>Open checklist</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}>No new joiners match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
          }}
          onClick={() => setActive(null)}
        >
          <div
            className="card"
            style={{ width: 480, maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Onboarding Checklist</h3>
              <button onClick={() => setActive(null)}>×</button>
            </div>

            <form
              action={(formData) => {
                startTransition(async () => {
                  await updateOnboardingEntry(formData);
                  setActive(null);
                });
              }}
            >
              <input type="hidden" name="id" value={active.id} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label>Name</label>
                  <input name="name" defaultValue={active.name} required />
                </div>
                <div>
                  <label>Position</label>
                  <input name="position" defaultValue={active.position} required />
                </div>
                <div>
                  <label>Org unit</label>
                  <input name="org_unit" defaultValue={active.org_unit} required />
                </div>
                <div>
                  <label>Start date</label>
                  <input name="start_date" type="date" defaultValue={active.start_date} required />
                </div>
              </div>

              <label style={{ marginTop: 16, display: "block" }}>Onboarding checklist</label>
              {CHECKLIST_ITEMS.map((item) => (
                <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
                  <input type="checkbox" name={item.key} defaultChecked={!!active[item.key]} />
                  {item.label}
                </label>
              ))}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <button type="button" onClick={() => setActive(null)}>Close</button>
                <button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}