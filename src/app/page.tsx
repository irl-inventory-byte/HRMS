import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ count: employeeCount }, { count: openJobs }, { count: waiting }] =
    await Promise.all([
      supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("job_openings").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("walkin_candidates").select("*", { count: "exact", head: true }).eq("queue_status", "waiting"),
    ]);

  return (
    <>
      <Nav />
      <div className="page">
        <h1>HRMS Dashboard</h1>
        <div className="card">
          <p>Active employees: <strong>{employeeCount ?? 0}</strong></p>
          <p>Open positions: <strong>{openJobs ?? 0}</strong></p>
          <p>Walk-in candidates waiting: <strong>{waiting ?? 0}</strong></p>
        </div>
      </div>
    </>
  );
}
