import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MonthCalendar } from "@/components/MonthCalendar";
import { ErrorBox, Loading, PageTitle, ParticipantTag, StatusTag } from "@/components/ui-kit";
import { useMyEvents } from "@/lib/api";
import { formatDate, timeRange } from "@/lib/format";

export const Route = createFileRoute("/u/calendario")({ component: CalendarioUser });

function CalendarioUser() {
  const q = useMyEvents();
  return (
    <AppShell area="user" title="Calendario">
      <PageTitle eyebrow="Agenda" title="Il mio calendario" subtitle="Verde: confermato · Petrolio: da rispondere o in attesa." />
      <div className="mt-5">
        {q.isLoading ? (
          <Loading />
        ) : q.isError ? (
          <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
        ) : (
          <MonthCalendar
            items={(q.data?.events ?? [])
              .filter((e) => e.mio_stato !== "rejected" && e.mio_stato !== "unavailable")
              .map((e) => ({
                key: e.code,
                date: e.data,
                tone: e.stato === "annullato" ? "muted" : e.mio_stato === "confirmed" ? "success" : "accent",
                render: (
                  <Link to="/u/eventi/$code" params={{ code: e.code }} className="block border-b border-border bg-card px-4 py-3 last:border-b-0 active:bg-muted">
                    <span className="block font-serif text-base text-foreground">{e.nome}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDate(e.data)} · {timeRange(e.ora_inizio, e.ora_fine)} · {e.luogo || "luogo da definire"}
                    </span>
                    <span className="mt-1.5 block">{e.stato === "annullato" ? <StatusTag status="annullato" /> : e.mio_stato && <ParticipantTag status={e.mio_stato} />}</span>
                  </Link>
                ),
              }))}
          />
        )}
      </div>
    </AppShell>
  );
}
