import { createClient } from "@/lib/supabase/server";
import { WalkInCandidate } from "@/types/hrms";
import { addWalkIn, advanceQueue } from "./actions";
import CheckInQR from "./CheckInQR";

export default async function WalkInPage() {
  const supabase = createClient();
  const { data: queue } = await supabase
    .from("walkin_candidates")
    .select("*")
    .order("created_at") as { data: WalkInCandidate[] | null };

  const emails = (queue ?? []).map((c) => c.email);
  const { data: priorHistory } = emails.length
    ? await supabase
        .from("job_applications")
        .select("candidate_email, status")
        .in("candidate_email", emails)
    : { data: [] };

  const historyByEmail = new Map<string, string[]>();
  for (const h of priorHistory ?? []) {
    const list = historyByEmail.get(h.candidate_email) ?? [];
    list.push(h.status);
    historyByEmail.set(h.candidate_email, list);
  }

  return (
    <>
      <header className="top"><h1>Walk-in Interview Queue</h1></header>

      <CheckInQR url="https://hrms-nine-pied.vercel.app/checkin" />

      <div className="card">
        <h4>Load candidate</h4>
        <form action={addWalkIn}>
          <label>Name</label><input name="name" required />
          <label>Email</label><input name="email" type="email" required />
          <label>Phone</label><input name="phone" />
          <label>Position applied for</label><input name="position_applied" required />
          <label>Source</label>
          <select name="source" defaultValue="Walk-in">
            <option value="Walk-in">Walk-in</option>
            <option value="Referral">Referral</option>
            <option value="Naukri">Naukri</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Newspaper">Newspaper</option>
            <option value="Other">Other</option>
          </select>
          <button type="submit">Add to queue</button>
        </form>
      </div>

      <div className="tablecard">
        <table>
          <thead><tr><th>Name</th><th>Position</th><th>Source</th><th>Status</th><th>Prior history</th><th>Actions</th></tr></thead>
          <tbody>
            {(queue ?? []).map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.position_applied}</td>
                <td>{(c as WalkInCandidate & { source?: string }).source ?? "—"}</td>
                <td><span className="badge">{c.queue_status}</span></td>
                <td>{(historyByEmail.get(c.email) ?? []).join(", ") || "none"}</td>
                <td>
                  <form action={advanceQueue.bind(null, c.id, "in_progress")} style={{ display: "inline" }}>
                    <button type="submit">Start</button>
                  </form>{" "}
                  <form action={advanceQueue.bind(null, c.id, "done")} style={{ display: "inline" }}>
                    <button type="submit">Done</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!queue || queue.length === 0) && (
              <tr><td colSpan={6}>Queue is empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}