import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";
import { updateProfileRole, addAllowedUser, removeAllowedUser } from "./actions";

const ROLES = ["admin", "hr", "manager", "interviewer", "employee"];

export default async function AccessControlPage() {
  const supabase = createClient();
  const { role } = await getCurrentUserAndRole();

  if (role !== "admin") {
    return (
      <>
        <header className="top"><h1>Access Control</h1></header>
        <div className="card">
          Only admins can view or change access. If you believe this is a
          mistake, ask an existing admin to grant your account the admin role.
        </div>
      </>
    );
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, role")
    .order("email");

  const { data: pending } = await supabase
    .from("allowed_users")
    .select("email, full_name, role")
    .order("email");

  return (
    <>
      <header className="top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Access Control</h1>
        <details style={{ position: "relative" }}>
          <summary style={{
            listStyle: "none", cursor: "pointer",
            background: "linear-gradient(135deg, var(--accent-mid), var(--accent))",
            color: "#fff", border: "1px solid var(--accent)", borderRadius: 7,
            padding: "8px 14px", fontSize: 13, fontWeight: 600, display: "inline-block",
          }}>
            + Add user
          </summary>
          <div className="card" style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, zIndex: 10,
          }}>
            <form action={addAllowedUser}>
              <label>Full name</label>
              <input name="full_name" required />
              <label>Email</label>
              <input name="email" type="email" required />
              <label>Role</label>
              <select name="role" defaultValue="employee">
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button type="submit">Add user</button>
            </form>
          </div>
        </details>
      </header>

      <div className="tablecard" style={{ marginBottom: 24 }}>
        <h3 style={{ padding: "0 0 12px" }}>Pending access (not yet signed in)</h3>
        <table style={{ textAlign: "center" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Name</th>
              <th style={{ textAlign: "center" }}>Email</th>
              <th style={{ textAlign: "center" }}>Role</th>
              <th style={{ textAlign: "center" }}></th>
            </tr>
          </thead>
          <tbody>
            {(pending ?? []).map((p) => (
              <tr key={p.email}>
                <td>{p.full_name}</td>
                <td>{p.email}</td>
                <td><span className="badge">{p.role}</span></td>
                <td>
                  <form action={removeAllowedUser} style={{ margin: 0 }}>
                    <input type="hidden" name="email" value={p.email} />
                    <button type="submit">Revoke</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!pending || pending.length === 0) && (
              <tr><td colSpan={4}>No pending invites.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="tablecard">
        <h3 style={{ padding: "0 0 12px" }}>Active accounts</h3>
        <table style={{ textAlign: "center" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Email</th>
              <th style={{ textAlign: "center" }}>Role</th>
              <th style={{ textAlign: "center" }}>Change role</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id}>
                <td>{p.email}</td>
                <td><span className="badge">{p.role}</span></td>
                <td>
                  <form action={updateProfileRole} style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", margin: 0 }}>
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
              <tr><td colSpan={3}>No accounts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}