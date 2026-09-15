"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function signIn() {
    setLoading(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { access_type: "offline", prompt: "consent" } } });
    if (error) { setError(error.message); setLoading(false); }
  }
  return <div><button type="button" className="google-button" onClick={signIn} disabled={loading}><span className="google-g" aria-hidden="true">G</span>{loading ? "Opening Google…" : "Continue with Google"}</button>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
