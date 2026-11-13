"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------- Accordion ----------------
export function Accordion({
  items,
}: {
  items: { title: string; content: ReactNode }[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-ink hover:bg-surface-2"
              aria-expanded={isOpen}
            >
              <span className="font-medium">{it.title}</span>
              <ChevronDown
                size={18}
                className={cn("text-ink-muted transition-transform", isOpen && "rotate-180")}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 text-sm text-ink-secondary">{it.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------- Tabs ----------------
export function Tabs({
  tabs,
}: {
  tabs: { label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-line">
        {tabs.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active === i
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{tabs[active].content}</div>
    </div>
  );
}
