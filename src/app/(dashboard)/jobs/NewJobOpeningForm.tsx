"use client";

import { useRef, useState, useTransition } from "react";

export default function NewJobOpeningForm({
  createJobOpening,
}: {
  createJobOpening: (formData: FormData) => Promise<void>;
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
        await createJobOpening(formData);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create opening.");
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
        + New opening
      </button>

      {open && (
        <div className="card" style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>New opening</strong>
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
            <label>Title</label>
            <input name="title" required />
            <label>Vacancies</label>
            <input name="vacancies" type="number" min={1} defaultValue={1} />

            {error && (
              <p style={{ color: "#e2493d", fontSize: 12, marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create opening"}
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