import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

/** Maschera teatrale: ruolo scenico (personaggio) */
export function MaskIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 5c3 1.3 6 1.3 8 0 2 1.3 5 1.3 8 0v6c0 5-3.6 8-8 9-4.4-1-8-4-8-9z" />
      <path d="M7.5 10c.8-.7 1.9-.7 2.6 0M13.9 10c.8-.7 1.9-.7 2.6 0M9 15c1.8 1.4 4.2 1.4 6 0" strokeLinecap="round" />
    </svg>
  );
}
/** Chiave inglese: ruolo tecnico (logistica) */
export function WrenchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14.5 4.2a4.5 4.5 0 0 0-5.3 5.9L4 15.3a1.9 1.9 0 0 0 2.7 2.7l5.2-5.2a4.5 4.5 0 0 0 5.9-5.3l-2.6 2.6-2.4-.6-.6-2.4z" />
    </svg>
  );
}

/** Suggerimenti per il ruolo: i personaggi dei costumi della bolla (es. "Costumi · Nelly Maudsley") + Logistica. */
export function ruoloSuggestions(categorie: string[]): string[] {
  const out: string[] = [];
  const skip = /^(allestiment|accoglienz|generico|kit|costumi det)/i;
  for (const c of categorie) {
    const parts = c.split("·").map((x) => x.trim()).filter(Boolean);
    if (parts.length >= 2 && /^costum/i.test(parts[0]!)) {
      const name = parts.slice(1).join(" · ");
      if (!skip.test(name) && !out.includes(name)) out.push(name);
    }
  }
  return [...out.sort((a, b) => a.localeCompare(b)), "Logistica"];
}

/**
 * Riquadrino del ruolo in un evento (personaggio o compito tecnico), con una maschera prima e una chiave dopo.
 * editable: admin o team leader possono scriverlo (suggerimenti dalla bolla, ma si può scrivere da zero).
 */
export function RuoloBox({
  value,
  editable,
  suggestions = [],
  onSave,
  saving,
  big,
}: {
  value: string;
  editable?: boolean;
  suggestions?: string[];
  onSave?: (v: string) => void;
  saving?: boolean;
  big?: boolean;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const listId = useId();
  const changed = v.trim() !== (value ?? "").trim();

  return (
    <div className={cn("flex items-center gap-2 border border-gold bg-gold-light/25 px-2.5", big ? "py-2.5" : "py-1.5")}>
      <MaskIcon className={cn("shrink-0 text-primary", big ? "h-6 w-6" : "h-5 w-5")} />
      <div className="min-w-0 flex-1 text-center">
        <span className="block font-display text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Ruolo</span>
        {editable ? (
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (changed) onSave?.(v.trim());
            }}
          >
            <input
              value={v}
              onChange={(e) => setV(e.target.value)}
              list={listId}
              maxLength={120}
              placeholder="Personaggio o compito (es. Logistica)"
              aria-label="Ruolo in questo evento"
              className="min-h-9 w-full min-w-0 border-b border-gold bg-transparent px-1 text-center font-display text-[15px] font-bold tracking-[0.04em] text-primary outline-none placeholder:font-serif placeholder:text-[14px] placeholder:font-normal placeholder:italic placeholder:tracking-normal placeholder:text-muted-foreground focus:border-accent"
            />
            <datalist id={listId}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {changed && (
              <button type="submit" disabled={saving} className="min-h-9 shrink-0 bg-accent px-2.5 font-display text-[10px] uppercase tracking-[0.12em] text-white disabled:opacity-50">
                Salva
              </button>
            )}
          </form>
        ) : (
          <span className={cn("block font-display font-bold tracking-[0.04em]", value ? "text-primary" : "font-serif font-normal italic text-muted-foreground", big ? "text-[19px]" : "text-[15px]")}>
            {value || "da assegnare"}
          </span>
        )}
      </div>
      <WrenchIcon className={cn("shrink-0 text-accent", big ? "h-6 w-6" : "h-5 w-5")} />
    </div>
  );
}
