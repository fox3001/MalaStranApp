import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { MONTHS, todayIso } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CalendarItem {
  key: string;
  date: string;
  tone: "accent" | "primary" | "muted" | "success";
  render: ReactNode;
}

/** Calendario mensile: puntini sui giorni con eventi, elenco del mese sotto. */
export function MonthCalendar({ items }: { items: CalendarItem[] }) {
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

  return (
    <div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => move(-1)} aria-label="Mese precedente" className="rounded-lg p-2 text-primary active:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-serif text-lg capitalize text-primary">
            {MONTHS[cursor.m]} {cursor.y}
          </p>
          <button type="button" onClick={() => move(1)} aria-label="Mese successivo" className="rounded-lg p-2 text-primary active:bg-muted">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
            <span key={i} className="eyebrow py-1 text-muted-foreground">
              {d}
            </span>
          ))}
          {cells.map((date, i) =>
            date ? (
              <button
                key={date}
                type="button"
                onClick={() => setSelected((s) => (s === date ? null : date))}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-lg text-sm",
                  selected === date ? "bg-accent text-accent-foreground" : date === today ? "border border-accent text-accent" : "text-foreground active:bg-muted",
                )}
              >
                {Number(date.slice(8))}
                <span className="mt-0.5 flex h-1.5 gap-0.5">
                  {(byDay.get(date) ?? []).slice(0, 3).map((it) => (
                    <span
                      key={it.key}
                      className={cn("h-1.5 w-1.5 rounded-full", selected === date ? "bg-white" : it.tone === "success" ? "bg-success" : it.tone === "accent" ? "bg-accent" : it.tone === "muted" ? "bg-muted-foreground/50" : "bg-primary")}
                    />
                  ))}
                </span>
              </button>
            ) : (
              <span key={`e${i}`} />
            ),
          )}
        </div>
      </div>
      <div className="mt-5">
        <p className="eyebrow mb-2 text-muted-foreground">{selected ? `Giorno ${Number(selected.slice(8))}` : "Questo mese"}</p>
        {visible.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Nessun evento.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)]">{visible.map((v) => <div key={v.key}>{v.render}</div>)}</div>
        )}
      </div>
    </div>
  );
}
