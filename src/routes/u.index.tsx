import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Shirt, Ticket, UserRound, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar, Card, Empty, ErrorBox, Field, Loading, ParticipantTag, SectionTitle } from "@/components/ui-kit";
import { useMyEvents, useProfile } from "@/lib/api";
import { formatDateLong, timeRange, todayIso } from "@/lib/format";

export const Route = createFileRoute("/u/")({ component: UserHome });

function UserHome() {
  const profile = useProfile();
  const events = useMyEvents();
  const today = todayIso();
  const mine = (events.data?.events ?? []).filter((e) => e.data >= today && e.stato !== "annullato");
  const toAnswer = mine.filter((e) => e.mio_stato === "pending");
  const next = mine.find((e) => e.mio_stato === "confirmed");
  const u = profile.data?.user;

  return (
    <AppShell area="user" title={u ? `${u.nome} ${u.cognome}` : "La mia area"}>
      {profile.isLoading ? (
        <Loading />
      ) : profile.isError || !u ? (
        <div className="mt-6">
          <ErrorBox error={profile.error} onRetry={() => void profile.refetch()} />
        </div>
      ) : (
        <>
          <section className="flex items-center gap-4 pt-6">
            <Avatar name={`${u.nome} ${u.cognome}`} size="md" />
            <div className="min-w-0">
              <p className="eyebrow text-accent">Benvenuto</p>
              <h2 className="font-serif text-2xl text-primary">Ciao, {u.nome}</h2>
              {u.qualifica && <p className="text-sm text-muted-foreground">{u.qualifica}</p>}
            </div>
          </section>

          {toAnswer.length > 0 && (
            <section className="mt-6">
              <Card className="border-warning/50 bg-warning/5">
                <p className="eyebrow text-warning-foreground">Da fare</p>
                <p className="mt-1 text-sm text-foreground">
                  Hai <strong>{toAnswer.length}</strong> {toAnswer.length === 1 ? "richiesta" : "richieste"} di disponibilità a cui rispondere.
                </p>
                <ul className="mt-2">
                  {toAnswer.map((e) => (
                    <li key={e.code}>
                      <Link to="/u/eventi/$code" params={{ code: e.code }} className="block py-1.5 text-sm font-semibold text-accent underline">
                        {e.nome} — {formatDateLong(e.data)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          <section className="mt-6 grid grid-cols-2 gap-3">
            <Tile to="/u/eventi" icon={Ticket} label="I miei eventi" />
            <Tile to="/u/calendario" icon={CalendarDays} label="Calendario" />
            <Tile to="/u/profilo" icon={UserRound} label="Il mio profilo" />
            <Tile to="/u/profilo" icon={Shirt} label="I miei costumi" />
          </section>

          <section className="mt-8">
            <SectionTitle>Prossimo evento confermato</SectionTitle>
            {events.isLoading ? (
              <Loading />
            ) : !next ? (
              <Empty>Nessun evento confermato in programma.</Empty>
            ) : (
              <Link to="/u/eventi/$code" params={{ code: next.code }}>
                <Card>
                  <p className="font-serif text-xl text-primary">{next.nome}</p>
                  <p className="mt-1 text-sm text-foreground">{formatDateLong(next.data)}</p>
                  <div className="mt-3">
                    {next.ora_ritrovo && <Field label="Ritrovo">{next.ora_ritrovo}</Field>}
                    <Field label="Orario">{timeRange(next.ora_inizio, next.ora_fine)}</Field>
                    <Field label="Luogo">{next.luogo || "—"}</Field>
                    {next.ruolo_evento && <Field label="Ruolo">{next.ruolo_evento}</Field>}
                  </div>
                  <div className="mt-3">
                    <ParticipantTag status="confirmed" />
                  </div>
                </Card>
              </Link>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

function Tile({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-3 py-5 text-center shadow-[var(--shadow-card)] active:bg-muted">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-accent">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </Link>
  );
}
