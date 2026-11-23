import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";
import { updateProfileRole } from "./actions";

const ROLES = ["admin", "hr", "manager", "interviewer", "employee", "candidate"];

export default async function AccessControlPage() {
  const supabase = createClient();
  const { email, role } = await getCurrentUserAndRole();

  if (role !== "admin") {
    return (
      <div className="shell">
        <Nav email={email} role={role} />
        <main className="main">
          <div className="wrap">
            <header className="top"><h1>Access Control</h1></header>
            <div className="card">
              Only admins can view or change access. If you believe this is a
              mistake, ask an existing admin to grant your account the admin role.
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .order("email");

  return (
    <div className="shell">
      <Nav email={email} role={role} />
      <main className="main">
        <div className="wrap">
          <header className="top"><h1>Access Control</h1></header>
          <div className="tablecard">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Change role</th></tr>
              </thead>
              <tbody>
                {(profiles ?? []).map((p) => (
                  <tr key={p.id}>
                    <td>{p.full_name ?? "—"}</td>
                    <td>{p.email}</td>
                    <td><span className="badge">{p.role}</span></td>
                    <td>
                      <form action={updateProfileRole} style={{ display: "flex", gap: 8, alignItems: "center", margin: 0 }}>
                        <input type="hidden" name="id" value={p.id} />
                        <select name="role" defaultValue={p.role} style={{ margin: 0, width: 140 }}>
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <button type="submit">Update</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {(!profiles || profiles.length === 0) && (
                  <tr><td colSpan={4}>No accounts yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}