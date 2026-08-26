import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, EventRow } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { EventStatus } from "@/lib/store";

export const Route = createFileRoute("/admin/eventi/")({
  head: () => ({
    meta: [
      { title: "Gestione eventi — Malastrana" },
      { name: "description", content: "Elenco eventi gestiti dall'admin." },
    ],
  }),
  component: AdminEventiIndex,
});

const FILTERS: { key: "tutti" | EventStatus; label: string }[] = [
  { key: "tutti", label: "Tutti" },
  { key: "richiesta", label: "Richiesta" },
  { key: "da_definire", label: "Da definire" },
  { key: "confermato", label: "Confermati" },
  { key: "annullato", label: "Annullati" },
];

function AdminEventiIndex() {
  const { events } = useDemo();
  const [filter, setFilter] = useState<"tutti" | EventStatus>("tutti");

  const sorted = [...events]
    .filter((e) => filter === "tutti" || e.status === filter)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppShell area="admin" title="Eventi">
      <div className="pt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">Gestione eventi</h2>
          <a
            href="/admin/eventi/nuovo"
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent bg-accent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent-foreground active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> Nuovo
          </a>
        </div>
      </div>

      {/* Filter pills */}
      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition-colors",
              filter === f.key
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border-strong bg-surface text-muted-foreground active:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)]">
        {sorted.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">Nessun evento in questa categoria.</p>
          </Card>
        ) : (
          sorted.map((e) => (
            <EventRow
              key={e.id}
              to="/admin/eventi/$code"
              params={{ code: e.code }}
              date={e.date}
              name={e.name}
              place={e.place}
              time={`${e.timeStart}–${e.timeEnd}`}
              code={e.code}
              status={e.status}
            />
          ))
        )}
      </div>
    </AppShell>
  );
}
