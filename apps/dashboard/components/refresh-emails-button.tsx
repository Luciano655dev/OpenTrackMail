"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RefreshEmailsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <button className="refresh-button" type="button" disabled={isPending} onClick={refresh}>
      <RefreshCw className={isPending ? "is-spinning" : undefined} size={15} aria-hidden="true" />
      {isPending ? "Refreshing…" : "Refresh"}
    </button>
  );
}
