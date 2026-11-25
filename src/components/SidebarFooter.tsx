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

  const namePart = email ? email.split("@")[0] : "User";
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  return (
    <div className="sidebar-footer">
      <div className="signedin-label">SIGNED IN AS</div>
      <div className="signedin-box">
        {displayName} · {roleLabel}
      </div>
      <form action="/auth/signout" method="post">
        <button type="submit" className="signout-btn">Sign out</button>
      </form>
    </div>
  );
}