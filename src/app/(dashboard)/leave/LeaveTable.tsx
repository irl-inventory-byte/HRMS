"use client";

import { useMemo, useState } from "react";

type LeaveRow = {
  id: string;
  emp_id: string;
  name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  days: number;
  reason: string | null;
  status: string;
  balance_left: number;
  balance_total: number;
};

export default function LeaveTable({
  rows,
  canApprove,
  updateLeaveStatus,
}: {
  rows: LeaveRow[];
  canApprove: boolean;
  updateLeaveStatus?: (formData: FormData) => void | Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q && !(r.name + " " + r.emp_id).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, status]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center" }}>
        <input
          placeholder="Search employee..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <span style={{ color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>
          {filtered.length} of {rows.length} shown
        </span>
      </div>

      <div className="tablecard">
        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Balance Left</th>
              {canApprove && updateLeaveStatus && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.emp_id}</td>
                <td><strong>{r.name}</strong></td>
                <td style={{ textTransform: "capitalize" }}>{r.leave_type}</td>
                <td>{r.from_date}</td>
                <td>{r.to_date}</td>
                <td>{r.days}</td>
                <td>{r.reason ?? "—"}</td>
                <td>
                  <span className="badge">
                    {r.status === "approved" ? "Approved" : r.status === "rejected" ? "Rejected" : "Pending"}
                  </span>
                </td>
                <td>{r.balance_left} / {r.balance_total}</td>
                {canApprove && updateLeaveStatus && (
                  <td>
                    {r.status === "pending" ? (
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <form action={updateLeaveStatus} style={{ margin: 0 }}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="approved" />
                          <button type="submit">Approve</button>
                        </form>
                        <form action={updateLeaveStatus} style={{ margin: 0 }}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button
                            type="submit"
                            style={{ background: "var(--crit-bg)", color: "var(--crit)", border: "1px solid var(--crit)" }}
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    ) : "—"}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={canApprove && updateLeaveStatus ? 10 : 9}>No leave requests match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}