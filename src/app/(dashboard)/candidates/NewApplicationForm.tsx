"use client";

import { useRef, useState, useTransition } from "react";

type Opening = { id: string; title: string };

export default function NewApplicationForm({
  submitApplication,
  openings,
}: {
  submitApplication: (formData: FormData) => Promise<void>;
  openings: Opening[];
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
        await submitApplication(formData);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit application.");
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
        + New application
      </button>

      {open && (
        <div className="card" style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>New application</strong>
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
            <label>Job opening</label>
            <select name="job_opening_id" required>
              {openings.length === 0 && <option value="">No openings yet</option>}
              {openings.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
            <label>Candidate name</label><input name="candidate_name" required />
            <label>Candidate email</label><input name="candidate_email" type="email" required />
            <label>Phone</label><input name="candidate_phone" />
            <label>Resume URL</label><input name="resume_url" />

            {error && (
              <p style={{ color: "#e2493d", fontSize: 12, marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="submit" disabled={isPending || openings.length === 0}>
                {isPending ? "Submitting..." : "Submit application"}
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