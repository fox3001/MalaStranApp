import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Empty, ErrorBox, EventRow, Loading, PageTitle } from "@/components/ui-kit";
import { useAdminEvents, type EventStatus } from "@/lib/api";
import { EVENT_STATUS_LABEL, timeRange, todayIso } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/eventi/")({ component: EventiAdmin });

type Filter = "prossimi" | "passati" | EventStatus;

function EventiAdmin() {
  const events = useAdminEvents();
  const [filter, setFilter] = useState<Filter>("prossimi");
  const today = todayIso();

  const list = useMemo(() => {
    const all = events.data?.events ?? [];
    if (filter === "prossimi") return all.filter((e) => e.data >= today);
    if (filter === "passati") return all.filter((e) => e.data < today).reverse();
    return all.filter((e) => e.stato === filter);
  }, [events.data, filter, today]);

  const filters: Array<[Filter, string]> = [
    ["prossimi", "Prossimi"],
    ["richiesta", EVENT_STATUS_LABEL.richiesta],
    ["da_definire", EVENT_STATUS_LABEL.da_definire],
    ["confermato", EVENT_STATUS_LABEL.confermato],
    ["passati", "Passati"],
    ["annullato", EVENT_STATUS_LABEL.annullato],
  ];

  return (
    <AppShell area="admin" title="Eventi">
      <PageTitle
        eyebrow="Gestione"
        title="Eventi"
        action={
          <Link to="/admin/eventi/nuovo" className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg bg-accent px-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent-foreground">
            <Plus className="h-4 w-4" /> Nuovo
          </Link>
        }
      />
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {filters.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.06em]", filter === key ? "border-accent bg-accent text-accent-foreground" : "border-border-strong bg-surface text-muted-foreground")}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="mt-4">
        {events.isLoading ? (
          <Loading />
        ) : events.isError ? (
          <ErrorBox error={events.error} onRetry={() => void events.refetch()} />
        ) : list.length === 0 ? (
          <Empty>{(events.data?.events.length ?? 0) === 0 ? "Nessun evento creato. Premi «Nuovo» per crearne uno." : "Nessun evento in questa vista."}</Empty>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)]">
            {list.map((e) => (
              <EventRow
                key={e.id}
                to="/admin/eventi/$code"
                params={{ code: e.code }}
                date={e.data}
                name={e.nome}
                place={e.luogo || "Luogo da definire"}
                time={timeRange(e.ora_inizio, e.ora_fine)}
                code={e.code}
                status={e.stato}
                extra={
                  e.conteggi && e.conteggi.invitati > 0 ? (
                    <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                      {e.conteggi.confermati} conf. · {e.conteggi.disponibili} disp. · {e.conteggi.in_attesa} in attesa
                    </span>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
