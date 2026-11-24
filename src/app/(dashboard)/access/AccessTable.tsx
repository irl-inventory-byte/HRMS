"use client";

import { useMemo, useState } from "react";
import { updateProfileRole } from "./actions";

type Profile = { id: string; email: string; role: string };

const ROLES = ["admin", "hr", "manager", "interviewer", "employee", "candidate"];

export default function AccessTable({ profiles }: { profiles: Profile[] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (role !== "all" && p.role !== role) return false;
      if (q && !p.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [profiles, query, role]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center" }}>
        <input placeholder="Search name or email..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span style={{ color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>{filtered.length} of {profiles.length} shown</span>
      </div>

      <div className="tablecard">
        <table style={{ textAlign: "center" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Email</th>
              <th style={{ textAlign: "center" }}>Role</th>
              <th style={{ textAlign: "center" }}>Change role</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.email}</td>
                <td><span className="badge">{p.role}</span></td>
                <td>
                  <form action={updateProfileRole} style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", margin: 0 }}>
                    <input type="hidden" name="id" value={p.id} />
                    <select name="role" defaultValue={p.role} style={{ margin: 0, width: 140 }}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button type="submit">Update</button>
                  </form>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={3}>No accounts match this filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}