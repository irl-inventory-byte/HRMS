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
        <Link className="navbtn" href="/">Dashboard</Link>
        <Link className="navbtn" href="/employees">Employee Directory</Link>
        <Link className="navbtn" href="/exit">Exit Form</Link>
        <Link className="navbtn" href="/transfer">Transfer Form</Link>
        <Link className="navbtn" href="/jobs">Job Applications</Link>
        <Link className="navbtn" href="/interviews">Interviews</Link>
        <Link className="navbtn" href="/walkin">Walk-in Queue</Link>
      </div>
      <SidebarFooter email={email ?? null} role={role ?? null} />
    </aside>
  );
}