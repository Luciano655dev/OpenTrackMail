"use client";

import { FormEvent, useId, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTrackedEmail } from "@/app/app/actions";

export function DeleteEmailAction({ emailId, subject }: { emailId: string; subject: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    setError("");
    dialog.current?.close();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await deleteTrackedEmail(emailId);
        dialog.current?.close();
      } catch {
        setError("The email could not be deleted. Please try again.");
      }
    });
  }

  return <>
    <button className="delete-email-button" type="button" aria-label={`Delete ${subject}`} title="Delete tracked email" onClick={() => dialog.current?.showModal()}><Trash2 size={16}/></button>
    <dialog ref={dialog} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId} onClose={() => setError("")}>
      <form onSubmit={handleSubmit}>
        <h2 id={titleId}>Delete tracked email?</h2>
        <p id={descriptionId}>“{subject}” and all of its open activity will be permanently deleted.</p>
        {error && <p className="dialog-error" role="alert">{error}</p>}
        <div>
          <button className="secondary-button" type="button" disabled={isPending} onClick={closeDialog}>Cancel</button>
          <button className="danger-button" type="submit" disabled={isPending}>{isPending ? "Deleting…" : "Delete"}</button>
        </div>
      </form>
    </dialog>
  </>;
}
