import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";

export default async function DashboardPage() {
  const supabase = createClient();
  const { email, role } = await getCurrentUserAndRole();

  const [{ count: employeeCount }, { count: openJobs }, { count: waiting }] =
    await Promise.all([
      supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("job_openings").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("walkin_candidates").select("*", { count: "exact", head: true }).eq("queue_status", "waiting"),
    ]);

  return (
    <div className="shell">
      <Nav email={email} role={role} />
      <main className="main">
        <div className="wrap">
          <header className="top">
            <h1>Dashboard</h1>
          </header>
          <div className="tiles">
            <div className="tile">
              <div className="tile-label">Active employees</div>
              <div className="tile-value">{employeeCount ?? 0}</div>
            </div>
            <div className="tile">
              <div className="tile-label">Open positions</div>
              <div className="tile-value">{openJobs ?? 0}</div>
            </div>
            <div className="tile">
              <div className="tile-label">Walk-in candidates waiting</div>
              <div className="tile-value">{waiting ?? 0}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}