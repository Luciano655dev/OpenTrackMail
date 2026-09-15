import { GmailProvider } from "./providers/gmail/gmail";
import { getState } from "./storage";
import type { BackgroundMessage } from "./types";

async function message<T>(payload:BackgroundMessage):Promise<T>{const response=await chrome.runtime.sendMessage(payload) as {ok:boolean;value?:T;error?:string};if(!response.ok)throw new Error(response.error||"OpenTrackMail extension error");return response.value as T}
const provider=new GmailProvider(async(snapshot,clientMessageId)=>message({type:"CREATE_TRACKED_EMAIL",payload:{subject:snapshot.subject,recipients:snapshot.recipients,clientMessageId}}),async()=>(await getState()).defaultTracking,async(id,providerThreadId)=>{const result=await message<{email:Awaited<ReturnType<typeof getState>>["recent"][number]}>({type:"UPDATE_TRACKED_EMAIL",id,payload:{providerThreadId}});return result.email});
provider.start();
async function sync(force=false){try{const emails=await message<Awaited<ReturnType<typeof getState>>["recent"]>({type:"SYNC_STATUS",force});provider.renderStatuses(emails)}catch{/* Signed-out state remains visually quiet. */}}
void sync(true);let interval:number|undefined;
function schedule(){if(document.visibilityState==="visible"){void sync();if(!interval)interval=window.setInterval(()=>void sync(),60_000)}else if(interval){clearInterval(interval);interval=undefined}}
document.addEventListener("visibilitychange",schedule);window.addEventListener("hashchange",()=>void sync());chrome.storage.onChanged.addListener((changes,area)=>{if(area==="local"&&changes.recent)provider.renderStatuses((changes.recent.newValue||[]) as Awaited<ReturnType<typeof getState>>["recent"])});schedule();
