"use client";

import { useRef, useState, useTransition } from "react";

type Application = {
  id: string;
  candidate_name: string;
  candidate_email: string;
};

export default function LogInterviewForm({
  recordInterview,
  applications,
}: {
  recordInterview: (formData: FormData) => Promise<void>;
  applications: Application[];
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
        await recordInterview(formData);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save interview.");
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
        + Log interview
      </button>

      {open && (
        <div className="card" style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>Log interview</strong>
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
            <label>Application</label>
            <select name="application_id" required>
              {applications.length === 0 && <option value="">No applications yet</option>}
              {applications.map((a) => (
                <option key={a.id} value={a.id}>{a.candidate_name} — {a.candidate_email}</option>
              ))}
            </select>
            <label>Round</label>
            <input name="round" type="number" min={1} defaultValue={1} />
            <label>Interview date</label>
            <input name="interview_date" type="date" required />
            <label>Outcome</label>
            <select name="outcome" defaultValue="pending">
              <option value="pending">Pending</option>
              <option value="passed">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
            <label>Feedback</label>
            <textarea name="feedback" rows={3}></textarea>

            {error && (
              <p style={{ color: "#e2493d", fontSize: 12, marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="submit" disabled={isPending || applications.length === 0}>
                {isPending ? "Saving..." : "Save"}
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