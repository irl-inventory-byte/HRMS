import Link from "next/link";
import SidebarFooter from "./SidebarFooter";

export default function Nav({
  email,
  role,
}: {
  email?: string | null;
  role?: string | null;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">OD</div>
        <div className="name">On<em>Deck</em></div>
      </div>

      <div className="navgroup">
        <div className="navlabel">Overview</div>
        <Link className="navbtn" href="/">Dashboard</Link>
      </div>

      <div className="navgroup">
        <div className="navlabel">Workforce</div>
        <Link className="navbtn" href="/employees">Employee Directory</Link>
        <Link className="navbtn" href="/exit">Exit Form</Link>
        <Link className="navbtn" href="/transfer">Transfer Form</Link>
      </div>

      <div className="navgroup">
        <div className="navlabel">Hiring</div>
        <Link className="navbtn" href="/jobs">Job Openings</Link>
        <Link className="navbtn" href="/walkin">Walk-in Queue</Link>
        <Link className="navbtn" href="/interviews">Interviews</Link>
      </div>

      {role === "admin" && (
        <div className="navgroup">
          <div className="navlabel">Administration</div>
          <Link className="navbtn" href="/access">Access Control</Link>
        </div>
      )}

      <SidebarFooter email={email ?? null} role={role ?? null} />
    </aside>
  );
}