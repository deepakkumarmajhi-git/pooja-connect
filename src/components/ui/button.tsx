import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const variantClasses = {
  default:
    "bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 shadow-sm",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
  outline:
    "border border-[var(--border)] bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800",
  ghost: "hover:bg-slate-100 dark:hover:bg-slate-800",
  destructive:
    "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
  link: "text-[var(--accent)] underline-offset-4 hover:underline",
};

const sizeClasses = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-lg",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
