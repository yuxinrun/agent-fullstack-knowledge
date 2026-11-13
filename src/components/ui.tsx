import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ---------- Button ----------
type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  href?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  external?: boolean;
  onClick?: () => void;
}

const variantCls: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-bg font-semibold hover:brightness-110 shadow-[0_8px_24px_rgba(56,214,176,0.25)]",
  secondary: "bg-surface-2 text-ink hover:bg-surface border border-line",
  ghost: "text-ink-secondary hover:text-ink hover:bg-surface-2",
  outline: "border border-primary/50 text-primary hover:bg-primary/10",
};
const sizeCls: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2 rounded-xl",
  lg: "text-base px-6 py-3 rounded-xl",
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  external,
  onClick,
}: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 transition-all duration-200",
    variantCls[variant],
    sizeCls[size],
    className
  );
  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

// ---------- Badge / Tag ----------
export function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={
        color
          ? { backgroundColor: `${color}1f`, color, border: `1px solid ${color}55` }
          : { backgroundColor: "rgba(124,140,255,0.12)", color: "#a9b4ff" }
      }
    >
      {children}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pill border border-line bg-surface-2 px-2.5 py-0.5 text-xs text-ink-muted">
      #{children}
    </span>
  );
}

// ---------- Card ----------
export function Card({
  children,
  className,
  hover,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn("card", hover && "card-hover", className)}>{children}</div>
  );
}

// ---------- Section Heading ----------
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "text-center", "mb-10")}>
      {eyebrow && (
        <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-bold text-balance md:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 max-w-2xl text-ink-secondary">{description}</p>
      )}
    </div>
  );
}

// ---------- EmptyState ----------
export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
      {icon && <div className="text-ink-muted">{icon}</div>}
      <div className="text-lg font-semibold text-ink">{title}</div>
      {description && <div className="max-w-md text-sm text-ink-muted">{description}</div>}
    </div>
  );
}

// ---------- Callout ----------
export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "warning" | "tip" | "danger";
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: { border: "#7C8CFF", bg: "rgba(124,140,255,0.08)" },
    warning: { border: "#F0B86E", bg: "rgba(240,184,110,0.08)" },
    tip: { border: "#38D6B0", bg: "rgba(56,214,176,0.08)" },
    danger: { border: "#FC8181", bg: "rgba(252,129,129,0.08)" },
  }[variant];
  return (
    <div
      className="my-4 rounded-lg border-l-4 p-4"
      style={{ borderColor: styles.border, background: styles.bg }}
    >
      {title && <div className="mb-1 font-semibold text-ink">{title}</div>}
      <div className="text-sm text-ink-secondary">{children}</div>
    </div>
  );
}

// ---------- ProgressBar ----------
export function ProgressBar({ value, color = "#38D6B0" }: { value: number; color?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-2">
      <div
        className="h-full rounded-pill transition-all"
        style={{ width: `${v}%`, background: color }}
      />
    </div>
  );
}

// ---------- Breadcrumb ----------
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted" aria-label="breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {it.href ? (
            <Link href={it.href} className="hover:text-primary">
              {it.label}
            </Link>
          ) : (
            <span className="text-ink-secondary">{it.label}</span>
          )}
          {i < items.length - 1 && <span className="text-ink-muted/60">/</span>}
        </span>
      ))}
    </nav>
  );
}

// ---------- StatPill ----------
export function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface/60 px-5 py-4 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="mt-1 text-xs text-ink-muted">{label}</div>
    </div>
  );
}
