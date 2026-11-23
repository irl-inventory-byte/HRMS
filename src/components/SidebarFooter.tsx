"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SidebarFooter({
  email,
  role,
}: {
  email: string | null;
  role: string | null;
}) {
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      setDark(true);
    } else if (saved === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      setDark(false);
    }
  }, []);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setDark(!dark);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="navfoot">
      <div className="role-box">
        Signed in as<br />
        <strong>{email ?? "—"}</strong>
        {role && <> · {role}</>}
      </div>
      <div className="navfoot-row">
        <button type="button" onClick={toggleTheme} className="theme-toggle-btn" title="Toggle theme" aria-label="Toggle theme">
          {dark ? "☀" : "☾"}
        </button>
        <button type="button" onClick={handleSignOut}>Sign out</button>
      </div>
    </div>
  );
}