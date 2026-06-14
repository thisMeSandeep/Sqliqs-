"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SEEN_KEY = "sqliqs:playground-notice-seen";

// One-time heads-up shown the first time someone opens the Playground: the
// built-in free key is shared and can run dry. Dismissal is remembered per
// browser so we don't nag on every visit.
export function PlaygroundNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
  }, []);

  function dismiss() {
    localStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Heads up about the free key</AlertDialogTitle>
          <AlertDialogDescription>
            This playground uses a free, shared LLM key that can run out quickly.
            We&apos;re sorry if it&apos;s unavailable when you try it — you can
            always bring your own model key and database connection to keep
            chatting.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={dismiss}>Got it</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href="/dashboard" onClick={dismiss}>
              Connect your database
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
