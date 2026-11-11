import { useEffect, useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Opts = { title?: string; message: string; confirmText?: string; cancelText?: string; destructive?: boolean };
type Req = Opts & { resolve: (ok: boolean) => void };
let push: ((r: Req) => void) | null = null;

/** Themed, centered replacement for window.confirm. Resolves true when confirmed. */
export function confirmDialog(opts: Opts | string): Promise<boolean> {
  const o = typeof opts === "string" ? { message: opts } : opts;
  return new Promise((resolve) => (push ? push({ ...o, resolve }) : resolve(window.confirm(o.message))));
}

export function ConfirmDialogHost() {
  const [req, setReq] = useState<Req | null>(null);
  useEffect(() => { push = setReq; return () => { push = null; }; }, []);
  const close = (ok: boolean) => { req?.resolve(ok); setReq(null); };
  return (
    <AlertDialog open={!!req} onOpenChange={(o) => !o && close(false)}>
      <AlertDialogContent className="border-border bg-card sm:rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">{req?.title ?? "Are you sure?"}</AlertDialogTitle>
          <AlertDialogDescription className="text-base">{req?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>{req?.cancelText ?? "Cancel"}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => close(true)}
            className={req?.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >{req?.confirmText ?? "Continue"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
