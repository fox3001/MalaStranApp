import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MonthCalendar } from "@/components/MonthCalendar";
import { ErrorBox, EventRow, Loading } from "@/components/ui-kit";
import { useAdminEvents } from "@/lib/api";
import { timeRange } from "@/lib/format";

export const Route = createFileRoute("/admin/calendario")({ component: CalendarioAdmin });

function CalendarioAdmin() {
  const events = useAdminEvents();
  return (
    <AppShell area="admin" eyebrow="Tutti gli eventi" title="Calendario">
      <div className="mt-4">
        {events.isLoading ? (
          <Loading />
        ) : events.isError ? (
          <ErrorBox error={events.error} onRetry={() => void events.refetch()} />
        ) : (
          <MonthCalendar
            legend={[
              { tone: "primary", label: "aperto" },
              { tone: "accent", label: "confermato" },
              { tone: "muted", label: "chiuso / annullato" },
            ]}
            items={(events.data?.events ?? []).map((e) => ({
              key: e.code,
              date: e.data,
              tone: e.stato === "confermato" ? "accent" : e.stato === "annullato" || e.stato === "chiuso" ? "muted" : "primary",
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
