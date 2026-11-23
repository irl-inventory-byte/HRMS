"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Cookie-based client — this is what lets middleware.ts see the session too.
const supabase = createClient();

// Where to send someone once they're actually signed in — change this to
// wherever your real dashboard/home page lives (e.g. "/dashboard").
const SIGNED_IN_REDIRECT = "/";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
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

  async function handleGoogleSignIn() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    if (error) setError(error.message);
  }

  if (checkingSession) {
    return (
      <div id="loginScreen" style={{ color: "var(--text-dim)" }}>
        <style jsx global>{loginStyles}</style>
        Checking session…
      </div>
    );
  }

  return (
    <div id="loginScreen">
      <style jsx global>{loginStyles}</style>
      <div className="tablecard">
        <div className="brand">
          <div className="mark">
            <span className="mark-initials">OD</span>
          </div>
          <div className="name">
            <span className="brand-wordmark">
              On<em>Deck</em>
            </span>
            <span className="sub">Sign in</span>
          </div>
        </div>

        <p className="section-note">
          Access is restricted to company accounts. Sign in with your work Google
          account — access is granted only to emails approved by an admin.
        </p>

        {error && (
          <div style={{ color: "var(--crit, #E8485F)", fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="button" className="btn google-btn" onClick={handleGoogleSignIn}>
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 7 29.6 5 24 5c-7.8 0-14.5 4.4-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.4 39.6 16.1 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-2.9 5.2-5.4 6.9l6.6 5.5C40.3 37 44 31.3 44 24c0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="section-note" style={{ marginTop: 14 }}>
          New accounts default to the <strong>Employee</strong> role. An admin
          grants access and sets a role from the in-app <strong>Access Control</strong> page.
        </p>
      </div>
    </div>
  );
}

const loginStyles = `
  :root {
    --bg: #F6F5FB;
    --surface: #ffffff;
    --surface-2: #F3F1FA;
    --border: #EAE8F3;
    --text: #1F2130;
    --text-dim: #7A7B91;
    --text-faint: #ACACC0;
    --accent: #2952EF;
    --accent-mid: #5C7DF7;
    --accent-hover: #1F3FC4;
    --accent-dim: #E8EAFB;
    --accent-ink: #ffffff;
    --accent-2: #7B3FE4;
    --accent-2-dim: #F1E9FD;
    --shadow: 0 2px 10px rgba(31,33,48,0.04), 0 12px 28px rgba(31,33,48,0.06);
    --font-display: 'Space Grotesk', 'Segoe UI', sans-serif;
    --font-body: 'Inter', 'Segoe UI', sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #1B1B22; --surface: #232329; --surface-2: #2A2A33; --border: #35353F;
      --text: #F2F2F6; --text-dim: #A7A7B8; --text-faint: #6E6E7E;
      --accent: #6D89F4; --accent-mid: #8CA4F7; --accent-hover: #7A98FF;
      --accent-dim: #262A43; --accent-ink: #0B1026; --accent-2: #B38FF0; --accent-2-dim: #2B2240;
      --shadow: 0 2px 10px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.4);
      color-scheme: dark;
    }
  }
  :root[data-theme="dark"] {
    --bg: #1B1B22; --surface: #232329; --surface-2: #2A2A33; --border: #35353F;
    --text: #F2F2F6; --text-dim: #A7A7B8; --text-faint: #6E6E7E;
    --accent: #6D89F4; --accent-mid: #8CA4F7; --accent-hover: #7A98FF;
    --accent-dim: #262A43; --accent-ink: #0B1026; --accent-2: #B38FF0; --accent-2-dim: #2B2240;
    --shadow: 0 2px 10px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.4);
    color-scheme: dark;
  }

  #loginScreen {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: var(--font-body);
    background:
      radial-gradient(900px 500px at 15% -10%, var(--accent-dim), transparent 60%),
      radial-gradient(800px 460px at 100% 110%, var(--accent-2-dim), transparent 62%),
      var(--bg);
  }
  #loginScreen::before {
    content: "";
    position: absolute; inset: 0;
    background-image: radial-gradient(var(--border) 1px, transparent 1px);
    background-size: 24px 24px;
    -webkit-mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 72%);
    mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 72%);
    opacity: 0.6;
    pointer-events: none;
  }
  .tablecard {
    position: relative; z-index: 1;
    max-width: 380px; width: 100%; padding: 28px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; box-shadow: var(--shadow); overflow: hidden;
  }
  .tablecard::before {
    content: "";
    position: absolute; inset: 0 0 auto 0; height: 5px;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
  }
  .brand {
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; gap: 14px; margin-bottom: 22px;
  }
  .mark {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, var(--accent), #6D89F4); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-weight: 700; font-size: 22px;
    box-shadow: 0 4px 14px rgba(41,82,239,0.45);
  }
  .mark-initials { font-size: 20px; }
  .name {
    font-size: 40px; display: flex; flex-direction: column; gap: 4px;
    font-family: 'Inter', var(--font-body), sans-serif; font-weight: 700;
    line-height: 1; color: var(--text);
  }
  .brand-wordmark em { font-style: normal; font-weight: 700; color: var(--accent); }
  .name .sub {
    font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em;
    color: var(--text-faint); font-family: var(--font-body);
  }
  .section-note { color: var(--text-dim); font-size: 12px; margin: 0 0 16px; }
  .btn {
    border: 1px solid var(--border); background: var(--surface); color: var(--text);
    border-radius: 7px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: var(--font-body); display: inline-flex; align-items: center; gap: 6px;
    width: 100%; justify-content: center;
  }
  .btn:hover { background: var(--surface-2); }
  .google-btn { border: 1.5px solid var(--border); padding: 11px 15px; font-size: 14px; }
  .google-btn:hover { background: var(--surface-2); border-color: #C7CEE8; }
`;