"use client";

import Image from "next/image";
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
        <div className="brand-chip">
          <Image
            src="/instawork-logo-white.png"
            alt="Instawork"
            width={100}
            height={22}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
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
        </div>

        <div className="navgroup">
          <div className="navlabel">Hiring</div>
          <Link href="/jobs" className={linkClass("/jobs")}>Job Openings</Link>
          <Link href="/walkin" className={linkClass("/walkin")}>Walk-in Queue</Link>
          <Link href="/interviews" className={linkClass("/interviews")}>Interviews</Link>
          <Link href="/applications" className={linkClass("/applications")}>Applications</Link>
        </div>

        {role === "admin" && (
          <div className="navgroup">
            <div className="navlabel">Administration</div>
            <Link href="/people" className={linkClass("/people")}>People</Link>
            <Link href="/access" className={linkClass("/access")}>Access Control</Link>
          </div>
        )}
      </nav>

      <SidebarFooter email={email} role={role} />
    </aside>
  );
}