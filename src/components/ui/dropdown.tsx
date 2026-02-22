"use client";

import * as React from "react";

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function Dropdown({
  children,
  trigger,
}: {
  children: React.ReactNode;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        <div onClick={() => setOpen(!open)}>{trigger}</div>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function DropdownContent({
  className = "",
  children,
  align = "end",
}: {
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const { open } = React.useContext(DropdownContext)!;
  if (!open) return null;
  return (
    <div
      className={`absolute z-50 mt-1 min-w-[8rem] rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 shadow-md ${align === "end" ? "right-0" : "left-0"} ${className}`}
      role="menu"
    >
      {children}
    </div>
  );
}

function DropdownItem({
  className = "",
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(DropdownContext)!;
  return (
    <button
      type="button"
      role="menuitem"
      className={`flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export { Dropdown, DropdownContent, DropdownItem };
