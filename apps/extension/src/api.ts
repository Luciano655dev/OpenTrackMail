import type { TrackedEmailSummary } from "@opentrackmail/shared";
import { getValidSession } from "./auth";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
export async function apiFetch<T>(path:string, init:RequestInit={}):Promise<T>{
  const session=await getValidSession(); if(!session) throw new Error("Sign in to OpenTrackMail first");
  const response=await fetch(`${apiUrl}${path}`,{...init,headers:{Authorization:`Bearer ${session.accessToken}`,"Content-Type":"application/json",...init.headers}});
  if(!response.ok){const body=await response.json().catch(()=>null) as {error?:{message?:string}}|null;throw new Error(body?.error?.message||`OpenTrackMail request failed (${response.status})`)}
  if(response.status===204)return undefined as T; return response.json() as Promise<T>;
}
export async function createTrackedEmail(payload:{subject:string;recipients:string[];clientMessageId:string}){return apiFetch<{email:TrackedEmailSummary;pixelUrl:string}>("/api/v1/tracked-emails",{method:"POST",body:JSON.stringify({...payload,provider:"gmail"})})}
export async function deleteTrackedEmail(id:string){return apiFetch<void>(`/api/v1/tracked-emails/${encodeURIComponent(id)}`,{method:"DELETE"})}
export async function updateTrackedEmail(id:string,payload:{providerMessageId?:string;providerThreadId?:string}){return apiFetch<{email:TrackedEmailSummary}>(`/api/v1/tracked-emails/${encodeURIComponent(id)}`,{method:"PATCH",body:JSON.stringify(payload)})}
export async function getTracked(){return apiFetch<{emails:TrackedEmailSummary[]}>("/api/v1/tracked-emails?limit=100")}
export async function getSettings(){return apiFetch<{settings:{defaultTracking:boolean;openNotifications:boolean}}>("/api/v1/settings")}
export async function updateSettings(settings:{defaultTracking?:boolean;openNotifications?:boolean}){return apiFetch<{settings:{defaultTracking:boolean;openNotifications:boolean}}>("/api/v1/settings",{method:"PATCH",body:JSON.stringify(settings)})}
