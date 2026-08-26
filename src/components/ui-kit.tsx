import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  STATUS_LABEL,
  VERIFICATION_LABEL,
  dayNumber,
  monthShort,
  type Costume,
  type EventStatus,
} from "@/data/demo";

/* ------------------------------------------------------------------ */
/* Marchio e placeholder logo                                          */
/* ------------------------------------------------------------------ */

export function Hourglass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 3h10M7 21h10M8 3v3.2c0 1.4 1 2.3 2.2 3.2L12 11l1.8-1.6C15 8.5 16 7.6 16 6.2V3M8 21v-3.2c0-1.4 1-2.3 2.2-3.2L12 13l1.8 1.6c1.2.9 2.2 1.8 2.2 3.2V21"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      data-logo-placeholder="malastrana"
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-xl border border-primary/30 bg-surface text-primary shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <Hourglass className="h-8 w-8" />
    </div>
  );
}

export function Wordmark({ small }: { small?: boolean }) {
  return (
    <div className="text-center">
      <h1
        className={cn(
          "font-serif tracking-[0.16em] text-primary",
          small ? "text-lg" : "text-3xl sm:text-4xl",
        )}
      >
        MALASTRANA
      </h1>
      <p
        className={cn(
          "font-sans uppercase tracking-[0.28em] text-accent",
          small ? "text-[9px] mt-0.5" : "text-[11px] mt-1.5",
        )}
      >
        Eventi senza tempo
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card — bianca/avorio, angoli arrotondati, bordi sottili, ombre soffuse */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <As
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function CardGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Etichette e stati                                                   */
/* ------------------------------------------------------------------ */

export function DemoNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "eyebrow border-t border-border pt-3 text-muted-foreground/80",
        className,
      )}
    >
      Prototipo UI — dati dimostrativi
    </p>
  );
}

const statusStyle: Record<EventStatus, string> = {
  richiesta: "border-warning/40 bg-warning/10 text-warning-foreground",
  confermato: "border-success/40 bg-success/10 text-success",
  da_definire: "border-border-strong bg-muted text-muted-foreground",
  annullato: "border-destructive/40 bg-destructive/10 text-destructive",
  chiuso: "border-border-strong bg-muted text-muted-foreground",
};

export function StatusTag({
  status,
  className,
}: {
  status: EventStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        statusStyle[status],
        className,
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function VerificationTag({ value }: { value: Costume["verification"] }) {
  const tone =
    value === "verificato"
      ? "text-success border-success/40 bg-success/10"
      : value === "in_verifica"
        ? "text-warning border-warning/40 bg-warning/10"
        : "text-muted-foreground border-border-strong bg-muted";
  return (
    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]", tone)}>
      {VERIFICATION_LABEL[value]}
    </span>
  );
}

export function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-accent"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Struttura                                                           */
/* ------------------------------------------------------------------ */

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 border-b border-border pb-2">
      <h2 className="font-serif text-lg leading-none text-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-3 border-b border-border py-2.5 last:border-b-0">
      <span className="eyebrow pt-0.5 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-sm text-foreground">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Button — primario petrolio; secondario bianco con bordo bordeaux    */
/* ------------------------------------------------------------------ */

export function Button({
  children,
  variant = "primary",
  full,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "outline" | "ghost" | "danger";
  full?: boolean;
}) {
  const styles = {
    primary: "bg-accent text-accent-foreground border-accent hover:bg-accent/90",
    accent: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
    outline: "bg-surface text-primary border-primary/40 hover:bg-muted",
    ghost: "bg-transparent text-accent border-transparent hover:bg-muted",
    danger: "bg-surface text-destructive border-destructive/50 hover:bg-destructive/5",
  }[variant];
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-semibold uppercase tracking-[0.1em] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
        styles,
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  params,
  children,
  variant = "primary",
  full,
}: {
  to: string;
  params?: Record<string, string>;
  children: ReactNode;
  variant?: "primary" | "accent" | "outline";
  full?: boolean;
}) {
  const styles = {
    primary: "bg-accent text-accent-foreground border-accent hover:bg-accent/90",
    accent: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
    outline: "bg-surface text-primary border-primary/40 hover:bg-muted",
  }[variant];
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-semibold uppercase tracking-[0.1em] transition-all active:scale-[0.98]",
        styles,
        full && "w-full",
      )}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Riga evento (agenda) — data a sinistra, titolo al centro, scudo a destra */
/* ------------------------------------------------------------------ */

export function EventRow({
  to,
  params,
  date,
  name,
  place,
  time,
  code,
  status,
}: {
  to: string;
  params: Record<string, string>;
  date: string;
  name: string;
  place: string;
  time: string;
  code: string;
  status: EventStatus;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-start gap-3 border-b border-border bg-card px-4 py-4 transition-colors active:bg-muted"
    >
      <span className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-secondary px-2 py-1.5 text-center">
        <span className="block font-serif text-2xl leading-none text-primary">
          {dayNumber(date)}
        </span>
        <span className="eyebrow mt-1 text-muted-foreground">
          {monthShort(date)}
        </span>
      </span>
      <span className="min-w-0">
        <span className="block truncate font-serif text-base text-foreground">{name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {place} · {time}
        </span>
        <span className="mt-1.5 block font-sans text-[11px] tracking-wider text-muted-foreground/80">
          {code}
        </span>
        <span className="mt-2 block">
          <StatusTag status={status} />
        </span>
      </span>
      <Shield className="mt-1 h-5 w-5 shrink-0 text-border-strong" />
    </Link>
  );
}

export function Shield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3l7 2.5v5.7c0 4.2-2.9 7.6-7 9.3-4.1-1.7-7-5.1-7-9.3V5.5L12 3z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar — cornice fantasy minimale                                    */
/* ------------------------------------------------------------------ */

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  const dim = { sm: "h-10 w-10 text-xs", md: "h-14 w-14 text-sm", lg: "h-28 w-28 text-2xl" }[
    size
  ];
  return (
    <span
      data-avatar-placeholder="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-secondary font-serif text-primary",
        dim,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function Thumb({ label }: { label: string }) {
  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary font-serif text-sm text-primary"
      aria-hidden="true"
    >
      {label.slice(0, 2).toUpperCase()}
    </span>
  );
}
