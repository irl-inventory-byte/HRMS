"use client";

import { useRef, useState, useTransition } from "react";

export default function NewJoinerForm({
  addEmployee,
}: {
  addEmployee: (formData: FormData) => Promise<void>;
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
        await addEmployee(formData);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save employee.");
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
        + New joiner
      </button>

      {open && (
        <div className="card" style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)", width: 360, zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>New joiner</strong>
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
            <label>Emp ID</label>
            <input name="emp_id" required placeholder="EMP-1006" />

            <label>Name</label>
            <input name="name" required />

            <label>Title</label>
            <input name="title" required />

            <label>Manager</label>
            <input name="manager" />

            <label>Joining Date</label>
            <input name="joining_date" type="date" required />

            <label>Status</label>
            <select name="status" defaultValue="active">
              <option value="active">Active</option>
              <option value="notice_period">Notice Period</option>
              <option value="exited">Exited</option>
            </select>

            <label>Contract End</label>
            <input name="contract_end" type="date" />

            <label>Exit Reason</label>
            <input name="exit_reason" />

            <label>Office Email</label>
            <input name="office_email" type="email" />

            <label>Personal Email</label>
            <input name="personal_email" type="email" />

            <label>Phone</label>
            <input name="phone" />

            {error && (
              <p style={{ color: "#e2493d", fontSize: 12, marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Add joiner"}
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