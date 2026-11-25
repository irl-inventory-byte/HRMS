"use client";

export default function SidebarFooter({
  email,
  role,
}: {
  email: string | null;
  role: string | null;
}) {
  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Unknown";

  return (
    <div className="sidebar-footer">
      <div className="signedin-box">
        <div className="signedin-label">Signed in as</div>
        <div className="signedin-email">{email}</div>
        <div className="signedin-role">
          Role: <span className="role-badge">{roleLabel}</span>
        </div>
      </div>
      <form action="/auth/signout" method="post">
        <button type="submit" className="signout-btn">Sign out</button>
      </form>
    </div>
  );
}