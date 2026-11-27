"use client";

import { useRef, useState, useTransition } from "react";
import { selfCheckIn } from "./actions";

export default function CheckInForm({ openings }: { openings: { id: string; title: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ success: boolean; error: string | null } | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await selfCheckIn(formData);
      setStatus(result);
      if (result.success) {
        formRef.current?.reset();
      }
    });
  }

  if (status?.success) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <h3 style={{ marginBottom: 8 }}>Thank you for walk-in interview!</h3>
        <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
          A member of our team will call you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <form ref={formRef} action={handleSubmit}>
        <label>Full name</label>
        <input name="name" required />

        <label>Email</label>
        <input name="email" type="email" required />

        <label>Phone</label>
        <input name="phone" />

        <label>Position applying for</label>
        <select name="position_applied" required defaultValue="">
          <option value="" disabled>Select a position</option>
          {openings.map((o) => (
            <option key={o.id} value={o.title}>{o.title}</option>
          ))}
        </select>

        <label>Source</label>
        <input name="source" placeholder="e.g. Walk-in, Referral, Naukri" />

        {status?.error && (
          <p style={{ color: "var(--crit)", fontSize: 13, marginBottom: 10 }}>
            {status.error}
          </p>
        )}

        <button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}