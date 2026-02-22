"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
        <div className="relative z-50 w-full max-w-lg">{children}</div>
      </div>
    </DialogContext.Provider>
  );
}

function DialogContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(DialogContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={`rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col gap-1.5 text-center sm:text-left ${className}`} {...props} />;
}

function DialogFooter({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6 ${className}`} {...props} />;
}

function DialogTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-lg font-semibold`} {...props} />;
}

function DialogClose({ className = "" }: { className?: string }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`absolute right-4 top-4 ${className}`}
      onClick={() => ctx.onOpenChange(false)}
      aria-label="Close"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose };
