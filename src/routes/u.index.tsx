import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Card,
  DemoNote,
  EventRow,
  LinkButton,
  SectionTitle,
  StatusTag,
} from "@/components/ui-kit";
import { CollaboratorAvatar } from "@/components/CollaboratorAvatar";
import { useDemo } from "@/lib/store";
import { CURRENT_USER, NOTIFICATIONS, formatDate } from "@/data/demo";
import { Boxes, CalendarDays, ClipboardList, Shirt } from "lucide-react";

export const Route = createFileRoute("/u/")({
  head: () => ({
    meta: [
      { title: "Home collaboratore — Malastrana" },
      {
        name: "description",
        content:
          "Prossimo evento, disponibilità da dare ed eventi confermati nel prototipo Malastrana.",
      },
      { property: "og:title", content: "Home collaboratore — Malastrana" },
      {
        property: "og:description",
        content: "Area collaboratore dimostrativa del gestionale Malastrana.",
      },
      { property: "og:url", content: "/u" },
    ],
    links: [{ rel: "canonical", href: "/u" }],
  }),
  component: HomeCollaboratore,
});

const QUICK = [
  { to: "/u/costumi", label: "I miei costumi", icon: Shirt },
  { to: "/u/materiale", label: "Materiale personale", icon: Boxes },
  { to: "/u/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/u/profilo", label: "Scheda personale", icon: ClipboardList },
];

function HomeCollaboratore() {
  const { events, availability } = useDemo();
  const upcoming = events
    .filter((e) => e.status !== "annullato")
    .sort((a, b) => a.date.localeCompare(b.date));
  const next = upcoming[0];
  const toAnswer = events.filter(
    (e) => e.status === "richiesta" && !availability[e.id],
  );
  const confirmed = events.filter((e) => e.status === "confermato");

  return (
    <AppShell area="user" title="" notifications={NOTIFICATIONS.length}>
      {/* Profile header */}
      <section className="flex items-center gap-4 pt-6">
        <CollaboratorAvatar
          name={CURRENT_USER.name}
          role={CURRENT_USER.role}
          size={72}
        />
        <div>
          <p className="eyebrow text-muted-foreground">Benvenuta</p>
          <h2 className="mt-1 font-serif text-2xl text-primary">
            Ciao, {CURRENT_USER.name.split(" ")[0]}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{CURRENT_USER.role}</p>
        </div>
      </section>

      {/* Quick actions — card colorate */}
      <section className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.to}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to={q.to as any}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-[var(--shadow-card)] transition-all active:scale-[0.98] active:bg-muted"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
                </span>
                <span className="text-xs font-semibold text-foreground">{q.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Next event */}
      {next && (
        <section className="mt-6">
          <Card className="border-primary/30">
            <p className="eyebrow text-primary">Prossimo evento</p>
            <p className="mt-3 font-serif text-2xl leading-tight text-foreground">
              {formatDate(next.date)}
            </p>
            <h3 className="mt-1 font-serif text-lg text-primary">{next.name}</h3>
            <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <dt className="eyebrow w-16 shrink-0 pt-0.5">Luogo</dt>
                <dd className="min-w-0 text-foreground">{next.place}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="eyebrow w-16 shrink-0 pt-0.5">Orario</dt>
                <dd className="text-foreground">
                  {next.timeStart}–{next.timeEnd}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="eyebrow w-16 shrink-0 pt-0.5">Codice</dt>
                <dd className="text-foreground">{next.code}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <StatusTag status={next.status} />
            </div>
            <div className="mt-5">
              <LinkButton to="/u/eventi/$code" params={{ code: next.code }} full>
                Apri evento
              </LinkButton>
            </div>
          </Card>
        </section>
      )}

      {/* Availability requests */}
      <section className="mt-8">
        <SectionTitle>Disponibilità da dare</SectionTitle>
        {toAnswer.length === 0 ? (
          <Card>
            <p className="py-1 text-sm text-muted-foreground">
              Nessuna disponibilità in attesa di risposta.
            </p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)]">
            {toAnswer.map((e) => (
              <EventRow
                key={e.id}
                to="/u/eventi/$code"
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

      {/* Confirmed events */}
      <section className="mt-8">
        <SectionTitle>Eventi confermati</SectionTitle>
        {confirmed.length === 0 ? (
          <Card>
            <p className="py-1 text-sm text-muted-foreground">Nessun evento confermato.</p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)]">
            {confirmed.map((e) => (
              <EventRow
                key={e.id}
                to="/u/eventi/$code"
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

      {/* Notifications */}
      <section className="mt-8">
        <SectionTitle
          action={
            <Link to="/u/notifiche" className="eyebrow text-accent">
              Tutte
            </Link>
          }
        >
          Notifiche recenti
        </SectionTitle>
        <Card>
          <ul>
            {NOTIFICATIONS.slice(0, 3).map((n) => (
              <li
                key={n.id}
                className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-b-0"
              >
                <span className="min-w-0 text-sm text-foreground">{n.text}</span>
                <span className="eyebrow shrink-0 pt-0.5 text-muted-foreground">
                  {n.when}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <div className="mt-8">
        <DemoNote />
      </div>
    </AppShell>
  );
}
