import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Tabs } from "@/components/AppShell";
import { Empty, ErrorBox, Loading, ParticipantTag, ShieldDate, StatusTag, Tag } from "@/components/ui-kit";
import { useMyEvents } from "@/lib/api";
import { timeRange, todayIso } from "@/lib/format";

export const Route = createFileRoute("/u/eventi/")({ component: MieiEventi });

function MieiEventi() {
  const q = useMyEvents();
  const [past, setPast] = useState(false);
  const today = todayIso();
  const list = (q.data?.events ?? []).filter((e) => (past ? e.data < today : e.data >= today));
  if (past) list.reverse();

  return (
    <AppShell
      area="user"
      eyebrow="Chiamate & repliche"
      title="I miei eventi"
      below={
        <Tabs
          tone="primary"
          value={past ? "passati" : "prossimi"}
          onChange={(v) => setPast(v === "passati")}
          items={[
            { value: "prossimi", label: "Prossimi" },
            { value: "passati", label: "Passati" },
          ]}
        />
      }
    >
      <section className="mt-4">
        {q.isLoading ? (
          <Loading />
        ) : q.isError ? (
          <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
        ) : list.length === 0 ? (
          <Empty>{past ? "Nessun evento passato." : "Nessun evento in programma. Quando l'ufficio ti invita, lo trovi qui."}</Empty>
        ) : (
          list.map((e) => {
            const tone = e.stato === "annullato" || e.mio_stato === "unavailable" || e.mio_stato === "rejected" ? "muted" : e.mio_stato === "pending" ? "primary" : "accent";
            return (
              <Link key={e.code} to="/u/eventi/$code" params={{ code: e.code }} className="mb-2.5 flex items-center gap-3.5 border border-border bg-card px-3 py-2.5 active:bg-muted">
                <ShieldDate date={e.data} tone={tone} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[19px] font-semibold leading-tight">{e.nome}</span>
                  <span className="block truncate text-[15px] text-muted-foreground">
                    {[e.tipo, e.is_tl ? "team leader" : e.ruolo_evento, e.luogo].filter(Boolean).join(" · ") || timeRange(e.ora_inizio, e.ora_fine)}
                  </span>
                </span>
                {e.stato === "annullato" ? <StatusTag status="annullato" /> : e.mio_stato === "pending" ? <Tag tone="primary" filled>Rispondi</Tag> : e.mio_stato && <ParticipantTag status={e.mio_stato} />}
              </Link>
            );
          })
        )}
      </section>
    </AppShell>
  );
}
