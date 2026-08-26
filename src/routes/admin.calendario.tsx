import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, EventRow } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { MONTHS } from "@/data/demo";

export const Route = createFileRoute("/admin/calendario")({
  head: () => ({
    meta: [
      { title: "Calendario admin — Malastrana" },
      {
        name: "description",
        content: "Calendario eventi amministratore del gestionale Malastrana.",
      },
    ],
  }),
  component: AdminCalendario,
});

function AdminCalendario() {
  const { events } = useDemo();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const byMonth = sorted.reduce<Record<string, typeof sorted>>((acc, e) => {
    const d = new Date(e.date + "T00:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <AppShell area="admin" title="Calendario">
      <div className="pt-5">
        <h2 className="font-serif text-2xl text-foreground">Calendario eventi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tutti gli eventi ordinati per mese.
        </p>
      </div>

      <div className="mt-5 space-y-6">
        {Object.entries(byMonth).map(([key, monthEvents]) => {
          const [y, m] = key.split("-").map(Number);
          return (
            <div key={key}>
              <p className="eyebrow mb-2 text-primary capitalize">
                {MONTHS[m]} {y}
              </p>
              <div className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)]">
                {monthEvents.map((e) => (
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
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
