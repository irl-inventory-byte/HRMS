"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SidebarFooter({
  email,
  role,
}: {
  email: string | null;
  role: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Unknown";

  const namePart = email ? email.split("@")[0] : "User";
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="sidebar-footer">
      <div className="signedin-label">SIGNED IN AS</div>
      <div className="signedin-box">
        {displayName} · {roleLabel}
      </div>
      <button onClick={handleSignOut} disabled={isPending} className="signout-btn">
        {isPending ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}