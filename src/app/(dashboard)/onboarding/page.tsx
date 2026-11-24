import { createClient } from "@/lib/supabase/server";
import { addOnboardingEntry } from "./actions";
import { CHECKLIST_ITEMS } from "./checklistItems";
import OnboardingTable from "./OnboardingTable";

export default async function OnboardingPage() {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("onboarding_entries")
    .select("*")
    .order("start_date");

  const today = new Date().toISOString().slice(0, 10);

  const entries = (rows ?? []).map((r) => {
    const checked = CHECKLIST_ITEMS.filter((item) => r[item.key]).length;
    const total = CHECKLIST_ITEMS.length;
    let status: "completed" | "overdue" | "in_progress" | "not_started" = "not_started";
    if (checked === total) status = "completed";
    else if (r.start_date <= today) status = "overdue";
    else if (checked > 0) status = "in_progress";

    return { ...r, checked, total, status };
  });

  const total = entries.length;
  const inProgress = entries.filter((e) => e.status === "in_progress").length;
  const completed = entries.filter((e) => e.status === "completed").length;
  const overdue = entries.filter((e) => e.status === "overdue").length;

  return (
    <>
      <header className="top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Onboarding</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>
            Every new joiner&apos;s checklist — documents, access, equipment, induction — tracked through to completion.
          </p>
        </div>

        <details style={{ position: "relative" }}>
          <summary style={{
            listStyle: "none", cursor: "pointer",
            background: "linear-gradient(135deg, var(--accent-mid), var(--accent))",
            color: "#fff", border: "1px solid var(--accent)", borderRadius: 7,
            padding: "10px 16px", fontSize: 13, fontWeight: 600, display: "inline-block",
          }}>
            + New joiner
          </summary>
          <div className="card" style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, zIndex: 10,
          }}>
            <form action={addOnboardingEntry}>
              <label>Name</label>
              <input name="name" required />
              <label>Position</label>
              <input name="position" required />
              <label>Start date</label>
              <input name="start_date" type="date" required />
              <button type="submit">Add joiner</button>
            </form>
          </div>
        </details>
      </header>

      <div className="tiles">
        <div className="tile" style={{ borderTop: "3px solid var(--accent)" }}>
          <div className="tile-value">{total}</div>
          <div className="tile-label">New joiners tracked</div>
        </div>
        <div className="tile" style={{ borderTop: "3px solid #e2a33d" }}>
          <div className="tile-value">{inProgress}</div>
          <div className="tile-label">In progress</div>
        </div>
        <div className="tile" style={{ borderTop: "3px solid #2ecc71" }}>
          <div className="tile-value">{completed}</div>
          <div className="tile-label">Completed</div>
        </div>
        <div className="tile" style={{ borderTop: "3px solid #e2493d" }}>
          <div className="tile-value">{overdue}</div>
          <div className="tile-label">Overdue</div>
        </div>
      </div>

      <OnboardingTable entries={entries} />
    </>
  );
}