import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { EventStatus, ParticipantStatus } from "@/lib/api";
import { EVENT_STATUS_LABEL, PARTICIPANT_LABEL, dayNumber, monthShort } from "@/lib/format";
import { Sigillo } from "@/components/Sigillo";
import { ARCANE_PARTS } from "@/components/arcane-circle";

/* ------------------------------------------------------------------ */
/* Marchio                                                             */
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
  return <img src="/malastrana-logo.png" alt="MalaStranApp" className={cn("h-auto w-56", className)} />;
}

export function Wordmark({ small }: { small?: boolean }) {
  return (
    <div>
      <p className={cn("font-display font-bold tracking-[0.18em] text-primary", small ? "text-lg" : "text-3xl")}>MALÂSTRANA</p>
      <p className={cn("font-display uppercase tracking-[0.34em] text-accent", small ? "text-[9px]" : "text-[11px] mt-1")}>Eventi senza tempo</p>
    </div>
  );
}

/**
 * Cerchio alchemico chiaro con "Eventi senza tempo" che gira attorno. Va dentro un contenitore "relative".
 * spin = gli anelli girano piano, uno in un senso e il successivo nell'altro; la clessidra al centro resta ferma.
 */
const SPIN: Record<string, string> = { ring: "arcane-cw-240", star: "arcane-ccw-180", inner: "arcane-cw-150", square: "arcane-ccw-120", center: "" };

export function ArcaneCircle({ className, spin }: { className?: string; spin?: boolean }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute opacity-[0.17]", className)}>
      <svg viewBox="0 0 400 400" fill="none" stroke="#5B1A1E" className="h-full w-full">
        {Object.entries(ARCANE_PARTS).map(([k, markup]) => (
          <g key={k} className={spin ? SPIN[k] : undefined} dangerouslySetInnerHTML={{ __html: markup }} />
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card — riquadro avorio squadrato con filo sottile                    */
/* ------------------------------------------------------------------ */

export function Card({ children, className, as: As = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" }) {
  return <As className={cn("border border-border bg-card p-4", className)}>{children}</As>;
}

export function CardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Etichette e stati — piccoli cartigli squadrati in maiuscoletto      */
/* ------------------------------------------------------------------ */

const tagBase = "inline-flex items-center px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.12em] border";

const statusStyle: Record<EventStatus, string> = {
  richiesta: "border-gold text-gold",
  confermato: "border-accent bg-accent text-white",
  da_definire: "border-muted-foreground text-muted-foreground",
  annullato: "border-primary bg-primary text-primary-foreground",
  chiuso: "border-foreground text-foreground",
};

export function StatusTag({ status, className }: { status: EventStatus; className?: string }) {
  return <span className={cn(tagBase, statusStyle[status], className)}>{EVENT_STATUS_LABEL[status]}</span>;
}

const participantStyle: Record<ParticipantStatus, string> = {
  pending: "border-gold text-gold",
  available: "border-accent text-accent",
  unavailable: "border-muted-foreground text-muted-foreground",
  confirmed: "border-accent bg-accent text-white",
  rejected: "border-primary text-primary",
};

export function ParticipantTag({ status, className }: { status: ParticipantStatus; className?: string }) {
  return <span className={cn(tagBase, participantStyle[status], className)}>{PARTICIPANT_LABEL[status]}</span>;
}

export function Tag({ children, tone = "accent", filled }: { children: ReactNode; tone?: "accent" | "primary" | "gold" | "muted"; filled?: boolean }) {
  const c = { accent: "border-accent text-accent", primary: "border-primary text-primary", gold: "border-gold text-gold", muted: "border-muted-foreground text-muted-foreground" }[tone];
  const fill = { accent: "bg-accent text-white", primary: "bg-primary text-primary-foreground", gold: "bg-gold text-primary-foreground", muted: "bg-muted-foreground text-white" }[tone];
  return <span className={cn(tagBase, c, filled && fill)}>{children}</span>;
}

export function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="inline-block border border-accent bg-card px-2.5 py-0.5 text-[15px] text-accent">
          {t}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Struttura                                                           */
/* ------------------------------------------------------------------ */

/** Titoletto in maiuscoletto verde petrolio con il filo d'oro che prosegue. */
export function SectionTitle({ children, action, opaque }: { children: ReactNode; action?: ReactNode; opaque?: boolean }) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <h2 className={cn("relative shrink-0 pr-1 font-display text-[12px] uppercase tracking-[0.24em] text-accent", opaque && "bg-background")}>{children}</h2>
      <span className="h-px flex-1 bg-gold" aria-hidden="true" />
      {action}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3 border-b border-line py-2.5 last:border-b-0">
      <span className="eyebrow pt-1 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-[17px] leading-snug text-foreground">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pulsanti — maiuscoletto, pieni con cornice d'oro oppure a filo     */
/* ------------------------------------------------------------------ */

const btnBase =
  "inline-flex min-h-12 items-center justify-center gap-2 border px-4 font-display text-[13px] uppercase tracking-[0.16em] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const btnStyles = {
  primary: "border-accent bg-accent text-white [box-shadow:inset_0_0_0_4px_var(--color-accent),inset_0_0_0_5px_var(--color-gold-light)]",
  accent: "border-primary bg-primary text-primary-foreground [box-shadow:inset_0_0_0_4px_var(--color-primary),inset_0_0_0_5px_var(--color-gold-light)]",
  outline: "border-primary bg-transparent text-primary",
  ghost: "border-transparent bg-transparent text-accent",
  danger: "border-primary bg-transparent text-primary",
};

export function Button({
  children,
  variant = "primary",
  full,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof btnStyles; full?: boolean }) {
  return (
    <button {...rest} className={cn(btnBase, btnStyles[variant], full && "w-full", className)}>
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
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className={cn(btnBase, btnStyles[variant], full && "w-full")}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Data a scudo e riga evento                                          */
/* ------------------------------------------------------------------ */

export function ShieldDate({ date, tone = "primary", size = "md" }: { date: string; tone?: "primary" | "accent" | "muted"; size?: "sm" | "md" | "lg" }) {
  const bg = { primary: "bg-primary", accent: "bg-accent", muted: "bg-[#8C7F72]" }[tone];
  const dim = { sm: "h-[42px] w-9", md: "h-[54px] w-[46px]", lg: "h-[76px] w-16" }[size];
  const num = { sm: "text-[15px]", md: "text-xl", lg: "text-3xl" }[size];
  return (
    <span className={cn("shield-shape flex shrink-0 flex-col items-center justify-center text-primary-foreground", bg, dim)}>
      <span className={cn("font-display leading-none", num)}>{dayNumber(date)}</span>
      {size !== "sm" && <span className="font-display text-[9px] uppercase tracking-[0.12em]">{monthShort(date)}</span>}
    </span>
  );
}

export function EventRow({
  to,
  params,
  date,
  name,
  place,
  time,
  status,
  extra,
  tone,
}: {
  to: string;
  params: Record<string, string>;
  date: string;
  name: string;
  place: string;
  time: string;
  code?: string;
  status?: EventStatus;
  extra?: ReactNode;
  tone?: "primary" | "accent" | "muted";
}) {
  const t = tone ?? (status === "confermato" ? "accent" : status === "annullato" || status === "chiuso" ? "muted" : "primary");
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className="relative mb-2.5 flex items-center gap-3.5 border border-border bg-card px-3 py-2.5 active:bg-muted"
    >
      <ShieldDate date={date} tone={t} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[19px] font-semibold leading-tight text-foreground">{name}</span>
        <span className="block truncate text-[15px] text-muted-foreground">
          {place} · {time}
        </span>
        {(status || extra) && (
          <span className="mt-1 flex flex-wrap gap-1.5">
            {status && <StatusTag status={status} />}
            {extra}
          </span>
        )}
      </span>
    </Link>
  );
}

export function Shield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3l7 2.5v5.7c0 4.2-2.9 7.6-7 9.3-4.1-1.7-7-5.1-7-9.3V5.5L12 3z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sigillo con le iniziali (al posto della foto)                       */
/* ------------------------------------------------------------------ */

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const px = { sm: 40, md: 52, lg: 96, xl: 118 }[size];
  return <Sigillo name={name} size={px} />;
}

export function Thumb({ label }: { label: string }) {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-secondary font-display text-sm text-primary" aria-hidden="true">
      {label.slice(0, 2).toUpperCase()}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Numeri, piastrelle                                                   */
/* ------------------------------------------------------------------ */

export function Stat({ value, label, tone = "primary", to }: { value: ReactNode; label: string; tone?: "primary" | "accent"; to?: string }) {
  const inner = (
    <>
      <span className={cn("block font-display text-[30px] leading-tight", tone === "primary" ? "text-primary" : "text-accent")}>{value}</span>
      <span className="block font-display text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
    </>
  );
  const cls = "relative block border border-gold bg-card p-2.5 text-center";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return to ? <Link to={to as any} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

export function Tile({ to, icon, label, tone = "primary", tall, translucent }: { to: string; icon: ReactNode; label: string; tone?: "primary" | "accent"; tall?: boolean; translucent?: boolean }) {
  // translucent: il riquadro è al 90% e lascia intravedere lo sfondo; scritte e icona restano piene
  const solid = tone === "primary" ? "#5B1A1E" : "#1F5A5E";
  const fill = translucent ? (tone === "primary" ? "rgba(91,26,30,.9)" : "rgba(31,90,94,.9)") : solid;
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      style={{ background: fill, boxShadow: `inset 0 0 0 4px ${fill}, inset 0 0 0 5px #A8874A` }}
      className={cn("relative flex flex-col items-center justify-center gap-1.5 text-primary-foreground active:opacity-90", tall ? "h-[104px]" : "h-[84px]")}
    >
      <span className="text-gold-light">{icon}</span>
      <span className="font-display text-[11px] uppercase tracking-[0.14em]">{label}</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Stati di caricamento, errore e lista vuota                          */
/* ------------------------------------------------------------------ */

export function Loading({ label = "Caricamento…" }: { label?: string }) {
  return <p className="py-10 text-center italic text-muted-foreground">{label}</p>;
}

export function ErrorBox({ error, onRetry }: { error: { message: string } | null; onRetry?: () => void }) {
  return (
    <Card className="border-primary">
      <p className="text-primary">{error?.message || "Qualcosa è andato storto."}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 font-display text-[11px] uppercase tracking-[0.14em] text-accent underline">
          Riprova
        </button>
      )}
    </Card>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-border bg-card/60 px-4 py-3 italic text-muted-foreground">{children}</p>;
}

export function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <section className="flex items-start justify-between gap-3 pt-5">
      <div className="min-w-0">
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h2 className="mt-0.5 font-display text-[22px] font-bold text-primary">{title}</h2>
        {subtitle && <p className="mt-0.5 italic text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Campi dei moduli — riquadro avorio con filo d'oro sotto             */
/* ------------------------------------------------------------------ */

const inputClass =
  "mt-1 min-h-11 w-full border border-border border-b-[1.5px] border-b-gold bg-card px-3 text-[17px] text-foreground outline-none placeholder:italic placeholder:text-muted-foreground/80 focus:border-accent";

export function TextInput({ label, hint, className, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow text-accent">{label}</span>
      <input {...rest} className={inputClass} />
      {hint && <span className="mt-1 block text-[14px] italic text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow text-accent">{label}</span>
      <textarea rows={3} {...rest} className={cn(inputClass, "py-2")} />
    </label>
  );
}

export function SelectInput({ label, className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow text-accent">{label}</span>
      <select {...rest} className={inputClass}>
        {children}
      </select>
    </label>
  );
}

/** Interruttore a pillola petrolio. */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center justify-between gap-3 text-[17px]", disabled && "cursor-not-allowed opacity-50")}>
      <span>{label}</span>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden="true"
        className={cn("relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-accent", checked ? "bg-accent" : "bg-border")}
      >
        <span className={cn("absolute top-[3px] h-5 w-5 rounded-full bg-card transition-all", checked ? "right-[3px]" : "left-[3px]")} />
      </span>
    </label>
  );
}
