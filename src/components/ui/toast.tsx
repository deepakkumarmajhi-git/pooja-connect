"use client";

import * as React from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { Button } from "./button";

export type ToastType = "success" | "error" | "info" | "default";

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  type?: ToastType;
  open: boolean;
  onClose: () => void;
  duration?: number;
}

const typeStyles: Record<ToastType, { icon: React.ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    className: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    className: "border-red-200 bg-red-50 dark:bg-red-950/30",
  },
  info: {
    icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
    className: "border-blue-200 bg-blue-50 dark:bg-blue-950/30",
  },
  default: {
    icon: null,
    className: "border-[var(--border)] bg-[var(--card)]",
  },
};

function Toast({
  title,
  description,
  type = "default",
  open,
  onClose,
  duration = 5000,
}: ToastProps) {
  React.useEffect(() => {
    if (!open || duration <= 0) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const style = typeStyles[type];
  return (
    <div
      role="alert"
      className={`fixed bottom-4 right-4 z-50 flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg ${style.className}`}
    >
      {style.icon && <span className="shrink-0">{style.icon}</span>}
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        {description && <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{description}</p>}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export { Toast };
