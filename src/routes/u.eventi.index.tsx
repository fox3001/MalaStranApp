import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Empty, ErrorBox, Loading, PageTitle, ParticipantTag, StatusTag } from "@/components/ui-kit";
import { useMyEvents } from "@/lib/api";
import { dayNumber, monthShort, timeRange, todayIso } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/eventi/")({ component: MieiEventi });

function MieiEventi() {
  const q = useMyEvents();
  const [past, setPast] = useState(false);
  const today = todayIso();
  const list = (q.data?.events ?? []).filter((e) => (past ? e.data < today : e.data >= today));
  if (past) list.reverse();

  return (
    <AppShell area="user" title="I miei eventi">
      <PageTitle eyebrow="Area personale" title="I miei eventi" subtitle="Gli eventi per cui l'ufficio ti ha chiesto la disponibilità." />
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface p-1">
        {[
          [false, "Prossimi"],
          [true, "Passati"],
        ].map(([v, label]) => (
          <button key={String(v)} type="button" onClick={() => setPast(v as boolean)} className={cn("min-h-10 rounded-md text-xs font-semibold uppercase tracking-[0.06em]", past === v ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
            {label as string}
          </button>
        ))}
      </div>
      <section className="mt-4">
        {q.isLoading ? (
          <Loading />
        ) : q.isError ? (
          <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
        ) : list.length === 0 ? (
          <Empty>{past ? "Nessun evento passato." : "Nessun evento in programma. Quando l'ufficio ti invita, lo trovi qui."}</Empty>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            {list.map((e) => (
              <li key={e.code} className="border-b border-border last:border-b-0">
                <Link to="/u/eventi/$code" params={{ code: e.code }} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 px-4 py-4 active:bg-muted">
                  <span className="flex flex-col items-center justify-center rounded-lg bg-secondary px-2 py-1.5">
                    <span className="font-serif text-2xl leading-none text-primary">{dayNumber(e.data)}</span>
                    <span className="eyebrow mt-1 text-muted-foreground">{monthShort(e.data)}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-base text-foreground">{e.nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {e.luogo || "Luogo da definire"} · {timeRange(e.ora_inizio, e.ora_fine)}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {e.stato === "annullato" ? <StatusTag status="annullato" /> : e.mio_stato && <ParticipantTag status={e.mio_stato} />}
                      {e.mio_stato === "pending" && e.stato !== "annullato" && <span className="self-center text-xs font-semibold text-accent">Rispondi →</span>}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
