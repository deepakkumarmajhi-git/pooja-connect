"use client";

import * as React from "react";

interface TabsContextValue {
  value: string;
  onValueChange: (v: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function Tabs({
  value,
  onValueChange,
  children,
  className = "",
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800 ${className}`}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

function TabsTrigger({
  value,
  className = "",
  children,
  ...props
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  const isActive = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 ${
        isActive ? "bg-[var(--card)] text-[var(--foreground)] shadow" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      } ${className}`}
      onClick={() => ctx.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({
  value,
  className = "",
  children,
  ...props
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={`mt-2 focus-visible:outline-none ${className}`} {...props}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
