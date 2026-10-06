import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MonthCalendar } from "@/components/MonthCalendar";
import { ErrorBox, EventRow, Loading, PageTitle } from "@/components/ui-kit";
import { useAdminEvents } from "@/lib/api";
import { timeRange } from "@/lib/format";

export const Route = createFileRoute("/admin/calendario")({ component: CalendarioAdmin });

function CalendarioAdmin() {
  const events = useAdminEvents();
  return (
    <AppShell area="admin" title="Calendario">
      <PageTitle eyebrow="Agenda" title="Calendario eventi" />
      <div className="mt-5">
        {events.isLoading ? (
          <Loading />
        ) : events.isError ? (
          <ErrorBox error={events.error} onRetry={() => void events.refetch()} />
        ) : (
          <MonthCalendar
            items={(events.data?.events ?? []).map((e) => ({
              key: e.code,
              date: e.data,
              tone: e.stato === "confermato" ? "success" : e.stato === "annullato" || e.stato === "chiuso" ? "muted" : "accent",
              render: (
                <EventRow to="/admin/eventi/$code" params={{ code: e.code }} date={e.data} name={e.nome} place={e.luogo || "Luogo da definire"} time={timeRange(e.ora_inizio, e.ora_fine)} code={e.code} status={e.stato} />
              ),
            }))}
          />
        )}
      </div>
    </AppShell>
  );
}
