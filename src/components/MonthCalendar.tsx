import { useMemo, useState, type ReactNode } from "react";
import { MONTHS, todayIso } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tone = "accent" | "primary" | "muted" | "success";
export interface CalendarItem {
  key: string;
  date: string;
  tone: Tone;
  render: ReactNode;
}

const BG: Record<Tone, string> = { primary: "bg-primary", accent: "bg-accent", success: "bg-accent", muted: "bg-[#8C7F72]" };

/** Calendario mensile: i giorni con eventi diventano piccoli scudi colorati, l'elenco del mese è sotto. */
export function MonthCalendar({ items, legend }: { items: CalendarItem[]; legend?: { tone: Tone; label: string }[] }) {
  const today = todayIso();
  const [cursor, setCursor] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [selected, setSelected] = useState<string | null>(null);

  const monthKey = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`;
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const it of items) map.set(it.date, [...(map.get(it.date) ?? []), it]);
    return map;
  }, [items]);

  const first = new Date(cursor.y, cursor.m, 1);
  const offset = (first.getDay() + 6) % 7; // lunedì come primo giorno
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: Array<string | null> = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, "0")}`)];

  const visible = items.filter((i) => (selected ? i.date === selected : i.date.startsWith(monthKey))).sort((a, b) => a.date.localeCompare(b.date));

  function move(delta: number) {
    setSelected(null);
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  const arrow = "flex h-11 w-11 items-center justify-center border border-gold text-xl text-primary";
  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label="Mese precedente" className={arrow}>
          ‹
        </button>
        <p className="font-display text-lg font-bold uppercase tracking-[0.14em] text-primary">
          {MONTHS[cursor.m]} {cursor.y}
        </p>
        <button type="button" onClick={() => move(1)} aria-label="Mese successivo" className={arrow}>
          ›
        </button>
      </div>
      <div className="mt-1.5 grid grid-cols-7 text-center">
        {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
          <span key={i} className="py-1 font-display text-[10px] text-muted-foreground">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`e${i}`} />;
          const its = byDay.get(date) ?? [];
          const n = Number(date.slice(8));
          const isSel = selected === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelected((s) => (s === date ? null : date))}
              aria-pressed={isSel}
              aria-label={`${n}${its.length ? `, ${its.length} eventi` : ""}`}
              className="flex h-11 items-center justify-center"
            >
              {its.length ? (
                <span className={cn("shield-shape flex h-[42px] w-9 items-center justify-center font-display text-[15px] text-primary-foreground", BG[its[0]!.tone], isSel && "outline outline-2 outline-gold")}>{n}</span>
              ) : (
                <span className={cn("flex h-9 w-9 items-center justify-center text-[17px]", date === today && "font-semibold text-accent underline", isSel && "border border-accent")}>{n}</span>
              )}
            </button>
          );
        })}
      </div>
      {legend && (
        <div className="mt-2.5 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5", BG[l.tone])} />
              {l.label}
            </span>
          ))}
        </div>
      )}
      <div className="mt-[18px]">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="shrink-0 font-display text-[12px] uppercase tracking-[0.24em] text-accent">{selected ? `Il giorno ${Number(selected.slice(8))}` : "In questo mese"}</h2>
          <span className="h-px flex-1 bg-gold" aria-hidden="true" />
        </div>
        {visible.length === 0 ? (
          <p className="border border-dashed border-border bg-card/60 px-4 py-3 italic text-muted-foreground">Nessun evento.</p>
        ) : (
          visible.map((v) => <div key={v.key}>{v.render}</div>)
        )}
      </div>
    </div>
  );
}
