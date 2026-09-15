"use client";
import { useRef } from "react";

export function DangerAction({ label, title, description, action }: { label:string; title:string; description:string; action:()=>Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <><button className="danger-button" type="button" onClick={()=>dialog.current?.showModal()}>{label}</button><dialog ref={dialog} className="confirm-dialog"><form method="dialog"><h2>{title}</h2><p>{description}</p><div><button className="secondary-button" value="cancel">Cancel</button><button className="danger-button" value="confirm" formAction={action}>Confirm</button></div></form></dialog></>;
}
