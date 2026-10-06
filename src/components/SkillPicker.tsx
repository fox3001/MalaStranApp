import { Flag, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SKILL_SUGGESTIONS } from "@/lib/format";

/** Scelta delle competenze: suggerimenti + competenze libere; la bandierina segna quelle principali. */
export function SkillPicker({
  value,
  flags,
  onChange,
}: {
  value: string[];
  flags: string[];
  onChange: (value: string[], flags: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const has = (s: string) => value.some((v) => v.toLowerCase() === s.toLowerCase());

  function toggle(skill: string) {
    if (has(skill)) onChange(value.filter((v) => v.toLowerCase() !== skill.toLowerCase()), flags.filter((f) => f.toLowerCase() !== skill.toLowerCase()));
    else onChange([...value, skill], flags);
  }
  function toggleFlag(skill: string) {
    onChange(value, flags.includes(skill) ? flags.filter((f) => f !== skill) : [...flags, skill]);
  }
  function addCustom() {
    const s = custom.trim().replace(/^#/, "");
    if (!s) return;
    if (!has(s)) onChange([...value, s], flags);
    setCustom("");
  }

  const suggestions = SKILL_SUGGESTIONS.filter((s) => !has(s));

  return (
    <div>
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((skill) => {
            const flagged = flags.includes(skill);
            return (
              <li key={skill} className={cn("inline-flex items-center gap-1 rounded-full border py-1 pl-3 pr-1 text-sm", flagged ? "border-primary bg-primary/10 text-primary" : "border-accent/40 bg-accent/10 text-accent")}>
                {skill}
                <button type="button" onClick={() => toggleFlag(skill)} aria-label={flagged ? "Togli da principali" : "Segna come principale"} className="rounded-full p-1">
                  <Flag className={cn("h-3.5 w-3.5", flagged && "fill-current")} />
                </button>
                <button type="button" onClick={() => toggle(skill)} aria-label={`Togli ${skill}`} className="rounded-full p-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nessuna competenza selezionata.</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">La bandierina indica le competenze principali.</p>

      <div className="mt-3 flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Aggiungi una competenza…"
          className="min-h-11 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button type="button" onClick={addCustom} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-accent px-3 text-sm font-semibold text-accent">
          <Plus className="h-4 w-4" /> Aggiungi
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => toggle(s)} className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground active:bg-muted">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
