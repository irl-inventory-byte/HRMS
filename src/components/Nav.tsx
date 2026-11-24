"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarFooter from "./SidebarFooter";

export default function Nav({
  email,
  role,
}: {
  email: string | null;
  role: string | null;
}) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    pathname === href ? "navbtn active" : "navbtn";

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="mark">H</span>
        <span className="name">HRMS</span>
      </div>

      <nav>
        <div className="navgroup">
          <div className="navlabel">Overview</div>
          <Link href="/" className={linkClass("/")}>Dashboard</Link>
        </div>

        <div className="navgroup">
          <div className="navlabel">Workforce</div>
          <Link href="/employees" className={linkClass("/employees")}>Employee Directory</Link>
          <Link href="/leave" className={linkClass("/leave")}>Leave &amp; Attendance</Link>
          <Link href="/onboarding" className={linkClass("/onboarding")}>Onboarding</Link>
          <Link href="/exit" className={linkClass("/exit")}>Offboarding Form</Link>
          <Link href="/transfer" className={linkClass("/transfer")}>Transfer / Role Change</Link>
        </div>

        <div className="navgroup">
          <div className="navlabel">Hiring</div>
          <Link href="/jobs" className={linkClass("/jobs")}>Job Openings</Link>
          <Link href="/walkin" className={linkClass("/walkin")}>Walk-in Queue</Link>
          <Link href="/interviews" className={linkClass("/interviews")}>Interviews</Link>
        </div>

        {role === "admin" && (
          <div className="navgroup">
            <div className="navlabel">Administration</div>
            <Link href="/access" className={linkClass("/access")}>Access Control</Link>
          </div>
        )}
      </nav>

      <SidebarFooter email={email} role={role} />
    </aside>
  );
}