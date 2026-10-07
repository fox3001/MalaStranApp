import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MonthCalendar } from "@/components/MonthCalendar";
import { ErrorBox, Loading, ShieldDate } from "@/components/ui-kit";
import { useMyEvents } from "@/lib/api";
import { formatDateLong } from "@/lib/format";

export const Route = createFileRoute("/u/calendario")({ component: CalendarioUser });

/** Calendario degli user: si vedono solo le date e la tipologia/tematica, senza aprire l'evento. */
function CalendarioUser() {
  const q = useMyEvents();
  return (
    <AppShell area="user" eyebrow="Le tue date" title="Calendario">
      <div className="mt-4">
        {q.isLoading ? (
          <Loading />
        ) : q.isError ? (
          <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
        ) : (
          <MonthCalendar
            legend={[
              { tone: "primary", label: "da rispondere" },
              { tone: "accent", label: "confermato" },
            ]}
            items={(q.data?.events ?? [])
              .filter((e) => e.mio_stato !== "rejected" && e.mio_stato !== "unavailable" && e.stato !== "annullato")
              .map((e) => {
                const tone = e.mio_stato === "confirmed" ? "accent" : "primary";
                return {
                  key: e.code,
                  date: e.data,
                  tone,
                  render: (
                    <div className="mb-2.5 flex items-center gap-3.5 border border-border bg-card px-3 py-2.5">
                      <ShieldDate date={e.data} tone={tone} />
                      <span className="min-w-0">
                        <span className="block text-[19px] font-semibold leading-tight">{e.tematica || e.tipo || "Evento"}</span>
                        <span className="block text-[15px] capitalize text-muted-foreground">{formatDateLong(e.data)}</span>
                      </span>
                    </div>
                  ),
                };
              })}
          />
        )}
      </div>
    </AppShell>
  );
}
