import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, DemoNote, EventRow, SectionTitle, StatusTag } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { COLLABORATORS, NOTIFICATIONS } from "@/data/demo";
import {
  AlertTriangle,
  BellRing,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  PackageSearch,
  Search,
  Shirt,
  Users,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard admin — Malastrana" },
      {
        name: "description",
        content:
          "Quadro di regia operativo: priorita, eventi, disponibilita, collaboratori e controllo materiale nel gestionale Malastrana.",
      },
      { property: "og:title", content: "Dashboard admin — Malastrana" },
      {
        property: "og:description",
        content: "Area organizzazione dimostrativa del gestionale Malastrana.",
      },
      { property: "og:url", content: "/admin" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
  component: AdminHome,
});

const SHORTCUTS = [
  { to: "/admin/eventi", label: "Gestisci eventi", icon: CalendarDays },
  { to: "/admin/collaboratori", label: "Collaboratori", icon: Users },
  { to: "/admin/costumi", label: "Ricerca costumi", icon: Search },
  { to: "/admin/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/admin/altro", label: "Magazzino e moduli", icon: Boxes },
];

function AdminHome() {
  const { events, availability, costumes, gear, setAvailabilityResponse } = useDemo();
  const sorted = [...events]
    .filter((e) => e.status !== "annullato")
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextEvents = sorted.slice(0, 3);
  const requests = events.filter((e) => e.status === "richiesta");
  const daDefinire = events.filter((e) => e.status === "da_definire");
  const confirmed = events.filter((e) => e.status === "confermato");
  const unanswered = requests.filter((event) => availability[event.id] === undefined);
  const collaboratorsToCheck = COLLABORATORS.filter(
    (collaborator) => collaborator.state !== "disponibile",
  );
  const inventoryTotal = costumes.length + gear.length;
  const priorityCount = unanswered.length + daDefinire.length + collaboratorsToCheck.length;

  return (
    <AppShell area="admin" title="Regia" notifications={NOTIFICATIONS.length}>
      <section className="pt-6">
        <p className="eyebrow text-accent">Quadro di regia</p>
        <h2 className="mt-1 font-serif text-2xl text-primary">Organizzazione</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Priorita, convocazioni e controllo operativo in un solo punto.
        </p>
      </section>

      {/* Priority banner */}
      <section className="mt-6">
        <Card className="border-primary/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-primary">Azioni da gestire</p>
              <p className="mt-1 font-serif text-xl text-foreground">
                {priorityCount} priorita aperte
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {unanswered.length} disponibilita senza risposta · {daDefinire.length} eventi da definire · {collaboratorsToCheck.length} stati da verificare
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/admin/eventi"
              className="inline-flex min-h-9 items-center rounded-lg border border-accent bg-accent px-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent-foreground active:scale-[0.98]"
            >
              Apri eventi
            </Link>
            <Link
              to="/admin/collaboratori"
              className="inline-flex min-h-9 items-center rounded-lg border border-primary/40 bg-surface px-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary active:scale-[0.98]"
            >
              Verifica persone
            </Link>
          </div>
        </Card>
      </section>

      {/* Stats grid */}
      <section className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={CalendarDays} value={sorted.length} label="Eventi attivi" to="/admin/eventi" tone="primary" />
          <StatCard icon={BellRing} value={unanswered.length} label="Da rispondere" to="/admin/eventi" tone="accent" />
          <StatCard icon={CheckCircle2} value={confirmed.length} label="Confermati" to="/admin/eventi" tone="primary" />
          <StatCard icon={PackageSearch} value={inventoryTotal} label="Inventario" to="/admin/costumi" tone="primary" />
        </div>
      </section>

      {/* Upcoming events */}
      <section className="mt-8">
        <SectionTitle
          action={
            <Link to="/admin/eventi" className="eyebrow text-accent">
              Tutti
            </Link>
          }
        >
          Eventi imminenti
        </SectionTitle>
        {nextEvents.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">Nessun evento attivo in calendario.</p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)]">
            {nextEvents.map((e) => (
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
        )}
      </section>

      {/* Availability requests */}
      <section className="mt-8">
        <SectionTitle
          action={
            <Link to="/admin/eventi" className="eyebrow text-accent">
              Gestisci
            </Link>
          }
        >
          Disponibilita da sollecitare
        </SectionTitle>
        {unanswered.length === 0 ? (
          <Card>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Nessuna risposta in sospeso.
            </p>
          </Card>
        ) : (
          <Card>
            <ul>
              {unanswered.slice(0, 3).map((e) => {
                const response = availability[e.id];
                return (
                  <li key={e.id} className="border-b border-border py-3 last:border-b-0">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        to="/admin/eventi/$code"
                        params={{ code: e.code }}
                        className="flex min-w-0 flex-1 items-center gap-3 active:bg-muted"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-foreground">{e.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {e.place} · {e.timeStart}–{e.timeEnd}
                          </span>
                        </span>
                      </Link>
                      <StatusTag status={e.status} />
                      {response === undefined ? (
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => setAvailabilityResponse(e.id, "yes")}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-accent active:bg-muted"
                            aria-label="Conferma disponibilita"
                            title="Conferma"
                          >
                            <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                          <button
                            onClick={() => setAvailabilityResponse(e.id, "no")}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground active:bg-muted"
                            aria-label="Non confermare"
                            title="Non confermare"
                          >
                            <XCircle className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`eyebrow shrink-0 ${
                            response === "yes" ? "text-accent" : "text-muted-foreground"
                          }`}
                        >
                          {response === "yes" ? "Confermato" : "Non confermato"}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      {/* Collaborator status */}
      <section className="mt-8">
        <SectionTitle
          action={
            <Link to="/admin/collaboratori" className="eyebrow text-accent">
              Vedi tutti
            </Link>
          }
        >
          Stato collaboratori
        </SectionTitle>
        <Card>
          <ul>
            {COLLABORATORS.slice(0, 5).map((c) => (
              <li key={c.id} className="border-b border-border last:border-b-0">
                <Link
                  to="/admin/collaboratori/$id"
                  params={{ id: c.id }}
                  className="flex min-h-14 items-center justify-between gap-3 py-3 active:bg-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-foreground">{c.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{c.role}</span>
                  </span>
                  <span className="eyebrow shrink-0 text-accent">{c.state}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Material control */}
      <section className="mt-8">
        <SectionTitle>Controllo materiale</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/admin/costumi"
            className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] active:scale-[0.98] active:bg-muted"
          >
            <Shirt className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <p className="mt-3 font-serif text-2xl text-primary">{costumes.length}</p>
            <p className="eyebrow mt-1 text-muted-foreground">Costumi</p>
          </Link>
          <Link
            to="/admin/altro"
            className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] active:scale-[0.98] active:bg-muted"
          >
            <ClipboardList className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <p className="mt-3 font-serif text-2xl text-primary">{gear.length}</p>
            <p className="eyebrow mt-1 text-muted-foreground">Materiali</p>
          </Link>
        </div>
      </section>

      {/* Shortcuts */}
      <section className="mt-8">
        <SectionTitle>Accessi rapidi</SectionTitle>
        <Card>
          <ul>
            {SHORTCUTS.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.to} className="border-b border-border last:border-b-0">
                  <Link
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    to={s.to as any}
                    className="flex min-h-14 items-center gap-3 py-3 text-sm text-foreground active:bg-muted"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.4} />
                    <span className="min-w-0 truncate">{s.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <div className="mt-8">
        <DemoNote />
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  to,
  tone = "primary",
}: {
  icon: typeof CalendarDays;
  value: number;
  label: string;
  to: string;
  tone?: "primary" | "accent";
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      className="block rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] active:scale-[0.98] active:bg-muted"
    >
      <Icon
        className={`h-5 w-5 ${tone === "accent" ? "text-accent" : "text-primary"}`}
        strokeWidth={1.5}
      />
      <p className="mt-2 font-serif text-2xl text-primary">{value}</p>
      <p className="eyebrow mt-1 text-muted-foreground">{label}</p>
    </Link>
  );
}
