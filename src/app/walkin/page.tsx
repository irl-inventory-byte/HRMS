import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { WalkInCandidate } from "@/types/hrms";
import { addWalkIn, advanceQueue } from "./actions";

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
    <div className="shell">
      <Nav />
      <main className="main">
        <div className="wrap">
          <header className="top"><h1>Walk-in Interview Queue</h1></header>

          <div className="card">
            <h4>Load candidate</h4>
            <form action={addWalkIn}>
              <label>Name</label><input name="name" required />
              <label>Email</label><input name="email" type="email" required />
              <label>Phone</label><input name="phone" />
              <label>Position applied for</label><input name="position_applied" required />
              <button type="submit">Add to queue</button>
            </form>
          </div>

          <div className="tablecard">
            <table>
              <thead><tr><th>Name</th><th>Position</th><th>Status</th><th>Prior history</th><th>Actions</th></tr></thead>
              <tbody>
                {(queue ?? []).map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.position_applied}</td>
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
                  <tr><td colSpan={5}>Queue is empty.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}