"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// If your project already has a shared Supabase client (e.g. in src/lib/supabase.ts
// or src/lib/supabaseClient.ts), delete this block and instead do:
//   import { supabase } from "@/lib/supabase";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Where to send someone once they're actually signed in — change this to
// wherever your real dashboard/home page lives (e.g. "/dashboard").
const SIGNED_IN_REDIRECT = "/";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Covers two cases: (1) someone who already has a session and lands on
    // /login directly, and (2) the moment right after Google redirects back
    // here with tokens in the URL — supabase-js reads those automatically,
    // fires this event, and we navigate away once it does.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace(SIGNED_IN_REDIRECT);
      } else {
        setCheckingSession(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace(SIGNED_IN_REDIRECT);
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  async function handleSignIn() {
    setError("");
    if (!email || !password) { setError("Please fill out email and password."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    // On success, Supabase sets the session; redirect/reload as your app expects.
  }

  async function handleGoogleSignIn() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) setError(error.message);
  }

  if (checkingSession) {
    // Avoids flashing the login form for a split second while we check for
    // an existing session (or process the tokens Google just redirected back).
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", color: "#9aa0ad" }}>
        Checking session…
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 36, marginBottom: 24 }}>
          HRMS Login
        </h1>

        <div
          style={{
            background: "#15151c",
            border: "1px solid #2a2a35",
            borderRadius: 14,
            padding: 28,
          }}
        >
          <label style={{ color: "#9aa0ad", fontSize: 14, display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 18,
              borderRadius: 8,
              border: "1px solid #2a2a35",
              background: "#0e0e14",
              color: "#fff",
              boxSizing: "border-box",
            }}
          />

          <label style={{ color: "#9aa0ad", fontSize: 14, display: "block", marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 18,
              borderRadius: 8,
              border: "1px solid #2a2a35",
              background: "#0e0e14",
              color: "#fff",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}

          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              disabled={loading}
              onClick={handleSignIn}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: "#6c8cf5",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#2a2a35" }} />
            <span style={{ color: "#9aa0ad", fontSize: 13 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#2a2a35" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #2a2a35",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 7 29.6 5 24 5c-7.8 0-14.5 4.4-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.4 39.6 16.1 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-2.9 5.2-5.4 6.9l6.6 5.5C40.3 37 44 31.3 44 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
            Sign in with Google
          </button>

          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 16 }}>
            Accounts are created by an admin, or automatically on first Google
            sign-in — accounts signing in with a @gmail.com address default to
            the Candidate role; everyone else defaults to Employee. An admin
            promotes roles from the Access Control page.
          </p>
        </div>
      </div>
    </div>
  );
}