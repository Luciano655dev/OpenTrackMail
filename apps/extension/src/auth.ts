import type { ExtensionSession } from "@opentrackmail/shared";
import { getState, setSession } from "./storage";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

export async function signIn(): Promise<ExtensionSession> {
  if (!supabaseUrl) throw new Error("The extension is missing VITE_SUPABASE_URL");
  const redirectUrl = chrome.identity.getRedirectURL("supabase-auth");
  const verifier = createVerifier(); const challenge = await sha256Base64Url(verifier);
  const authorize = new URL(`${supabaseUrl}/auth/v1/authorize`);
  authorize.searchParams.set("provider", "google"); authorize.searchParams.set("redirect_to", redirectUrl);
  authorize.searchParams.set("code_challenge", challenge); authorize.searchParams.set("code_challenge_method", "s256");
  const resultUrl = await chrome.identity.launchWebAuthFlow({ url: authorize.toString(), interactive: true });
  if (!resultUrl) throw new Error("Google sign-in did not return to the extension");
  const callback = new URL(resultUrl); const error = callback.searchParams.get("error_description") || callback.searchParams.get("error"); if (error) throw new Error(error);
  const code = callback.searchParams.get("code"); if (!code) throw new Error("Sign-in response did not include an authorization code");
  const response = await fetch(`${apiUrl}/api/v1/extension/token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grantType: "pkce", authCode: code, codeVerifier: verifier }) });
  if (!response.ok) throw new Error("Could not complete extension sign-in");
  const session = await response.json() as ExtensionSession; await setSession(session); return session;
}

export async function getValidSession(): Promise<ExtensionSession | undefined> {
  const { session } = await getState(); if (!session) return undefined;
  if (session.expiresAt > Math.floor(Date.now()/1000) + 60) return session;
  const response = await fetch(`${apiUrl}/api/v1/extension/token`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({grantType:"refresh_token",refreshToken:session.refreshToken}) });
  if (!response.ok) { await setSession(undefined); return undefined; }
  const refreshed = await response.json() as ExtensionSession; await setSession(refreshed); return refreshed;
}

function createVerifier() { const bytes=crypto.getRandomValues(new Uint8Array(64)); return base64Url(bytes); }
async function sha256Base64Url(value:string){return base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))))}
function base64Url(bytes:Uint8Array){let value="";bytes.forEach((byte)=>value+=String.fromCharCode(byte));return btoa(value).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}
