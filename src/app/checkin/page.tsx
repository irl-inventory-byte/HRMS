import { createClient } from "@/lib/supabase/server";
import CheckInForm from "./CheckInForm";

export default async function CheckInPage() {
  const supabase = createClient();
  const { data: openings } = await supabase
    .from("job_openings")
    .select("id, title")
    .eq("status", "open")
    .order("title");

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: "0 20px" }}>
      <h1>Walk-in Check-In</h1>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 20 }}>
        Please fill this out and a member of our team will call you shortly.
      </p>
      <CheckInForm openings={openings ?? []} />
    </div>
  );
}