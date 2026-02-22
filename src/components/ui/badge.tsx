import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "destructive" | "warning";
}

const variantClasses: Record<BadgeProps["variant"] & string, string> = {
  default: "bg-[var(--accent)] text-[var(--accent-foreground)]",
  secondary: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
  outline: "border border-[var(--border)] bg-transparent",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  destructive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export { Badge };
