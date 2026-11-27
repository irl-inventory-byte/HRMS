"use client";

import { useMemo, useState } from "react";
import { Employee } from "@/types/hrms";

export default function EmployeeTable({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");

  const roles = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.title).filter(Boolean))).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      if (status !== "all" && String(e.status) !== status) return false;
      if (role !== "all" && e.title !== role) return false;
      if (q) {
        const haystack = [
          e.emp_id, e.name, e.office_email, e.personal_email,
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [employees, query, status, role]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center" }}>
        <input
          placeholder="Search name, emp ID, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="notice_period">Notice Period</option>
          <option value="exited">Exited</option>
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span style={{ color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>
          {filtered.length} of {employees.length} shown
        </span>
      </div>

      <div className="tablecard">
        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Title</th>
              <th>Manager</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Contract End</th>
              <th>Exit Reason</th>
              <th>Office Email</th>
              <th>Personal Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td>{e.emp_id}</td>
                <td><strong>{e.name}</strong></td>
                <td>{e.title}</td>
                <td>{e.manager ?? "—"}</td>
                <td>{e.joining_date}</td>
                <td>
                  <span className="badge">
                    {String(e.status) === "notice_period" ? "Notice Period" : String(e.status) === "active" ? "Active" : "Exited"}
                  </span>
                </td>
                <td>{e.contract_end ?? "—"}</td>
                <td>{e.exit_reason ?? "—"}</td>
                <td>{e.office_email ?? "—"}</td>
                <td>{e.personal_email ?? "—"}</td>
                <td>{e.phone ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11}>No employees match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}