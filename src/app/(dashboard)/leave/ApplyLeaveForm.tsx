"use client";

import { useRef, useState, useTransition } from "react";

export default function ApplyLeaveForm({
  applyLeave,
  employees,
}: {
  applyLeave: (formData: FormData) => Promise<void>;
  employees: { id: string; emp_id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleClose() {
    setOpen(false);
    setError(null);
    formRef.current?.reset();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await applyLeave(formData);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit request.");
      }
    });
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          listStyle: "none", cursor: "pointer",
          background: "linear-gradient(135deg, var(--accent-mid), var(--accent))",
          color: "#fff", border: "1px solid var(--accent)", borderRadius: 7,
          padding: "10px 16px", fontSize: 13, fontWeight: 600, display: "inline-block",
        }}
      >
        + Apply leave
      </button>

      {open && (
        <div className="card" style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>Apply leave</strong>
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: "transparent", border: "1px solid var(--border, #444)",
                color: "var(--text-dim)", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit}>
            <label>Employee</label>
            <select name="employee_id" required>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.emp_id} — {e.name}</option>
              ))}
            </select>

            <label>Leave type</label>
            <select name="leave_type" required>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
            </select>

            <label>From</label>
            <input name="from_date" type="date" required />

            <label>To</label>
            <input name="to_date" type="date" required />

            <label>Reason</label>
            <input name="reason" />

            {error && (
              <p style={{ color: "#e2493d", fontSize: 12, marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit request"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                style={{
                  background: "transparent", border: "1px solid var(--border, #444)",
                  color: "var(--text-dim)",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}