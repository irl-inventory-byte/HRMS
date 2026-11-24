"use client";

import { useMemo, useState, useTransition } from "react";
import { deactivatePerson } from "./actions";

type Person = { id: string; full_name: string; role: string | null; city: string | null; email: string; mobile: string; status: string };

export default function PeopleTable({ people }: { people: Person[] }) {
  const [role, setRole] = useState("all");
  const [city, setCity] = useState("all");
  const [isPending, startTransition] = useTransition();

  const roles = useMemo(() => Array.from(new Set(people.map((p) => p.role).filter(Boolean))), [people]);
  const cities = useMemo(() => Array.from(new Set(people.map((p) => p.city).filter(Boolean))), [people]);

  const filtered = useMemo(() => {
    return people.filter((p) => {
      if (role !== "all" && p.role !== role) return false;
      if (city !== "all" && p.city !== city) return false;
      return true;
    });
  }, [people, role, city]);

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <h4>Filter people</h4>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div>
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">All roles</option>
              {roles.map((r) => <option key={r} value={r!}>{r}</option>)}
            </select>
          </div>
          <div>
            <label>City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="all">All cities</option>
              {cities.map((c) => <option key={c} value={c!}>{c}</option>)}
            </select>
          </div>
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 8 }}>Showing {filtered.length} of {people.length} people.</p>
      </div>

      <div className="tablecard">
        <table>
          <thead>
            <tr><th>Name</th><th>Role</th><th>City</th><th>Email</th><th>Mobile</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.full_name}</strong></td>
                <td>{p.role ?? "—"}</td>
                <td>{p.city ?? "—"}</td>
                <td>{p.email}</td>
                <td>{p.mobile}</td>
                <td><span className="badge">{p.status}</span></td>
                <td>
                  {p.status === "active" && (
                    <form action={(fd) => startTransition(() => deactivatePerson(fd))} style={{ margin: 0 }}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" disabled={isPending}>Deactivate</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7}>No people match this filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}