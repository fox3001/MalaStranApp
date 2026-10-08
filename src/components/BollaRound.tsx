import { cn } from "@/lib/utils";

/** Pulsante tondo della bolla: petrolio con ✓ per Entrata/Uscita/Prep, bordeaux con ! per Danni. */
export function RoundCheck({ label, on, onClick, danger, lost, disabled }: { label: string; on: boolean; onClick: () => void; danger?: boolean; lost?: boolean; disabled?: boolean }) {
  if (lost) danger = true;
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-10 w-10 items-center justify-center justify-self-center rounded-full border-[1.5px] transition-transform active:scale-95 disabled:cursor-not-allowed",
        danger ? "border-primary" : "border-accent",
        on && (danger ? "bg-primary" : "bg-accent"),
        disabled && !on && "opacity-40",
      )}
    >
      {on && (
        <svg viewBox="0 0 24 24" fill="none" stroke="#F3ECDD" strokeWidth={2.4} className="h-4 w-4" aria-hidden="true">
          {lost ? <path d="M7 7l10 10M17 7L7 17" /> : danger ? <path d="M12 6v8M12 18h.01" /> : <path d="M5 12l5 5 9-10" />}
        </svg>
      )}
    </button>
  );
}

/** Intestazione del gruppo della bolla (fascia bordeaux) + nomi delle colonne. */
export function LedgerHead({ title, count, columns, col = 52 }: { title: string; count: number; columns: string[]; col?: number }) {
  return (
    <>
      <div className="flex items-center justify-between bg-primary px-3.5 py-2.5 text-primary-foreground">
        <span className="font-display text-[13px] uppercase tracking-[0.12em]">{title}</span>
        <span className="text-sm italic">{count} {count === 1 ? "voce" : "voci"}</span>
      </div>
      <div
        className="grid border-b border-border px-3.5 py-1.5 font-display text-[9px] uppercase tracking-[0.12em] text-muted-foreground"
        style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${columns.length}, ${col}px)` }}
      >
        <span>Voce</span>
        {columns.map((c) => (
          <span key={c} className="text-center">
            {c}
          </span>
        ))}
      </div>
    </>
  );
}
