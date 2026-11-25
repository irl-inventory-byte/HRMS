"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: 380, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <Image src="/instawork-logo.png" alt="Instawork" width={160} height={36} style={{ objectFit: "contain" }} priority />
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 24 }}>
          Hiring
        </p>
        <button onClick={handleGoogleSignIn} style={{ width: "100%" }}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}