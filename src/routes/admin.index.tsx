import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, useLogout } from "@/components/AppShell";
import { Empty, ErrorBox, EventRow, Loading, SectionTitle, Stat, Tile } from "@/components/ui-kit";
import { useAdminEvents, useNotifications } from "@/lib/api";
import { timeAgo, timeRange, todayIso } from "@/lib/format";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

/** La torre disegnata a china: sta dietro a tutta la pagina, la punta resta in vista in alto. */
function TowerBackdrop() {
  return (
    <>
      <img
        src="/sfondi/torre-regia.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[80px] h-[700px] w-[620px] max-w-none -translate-x-1/2 select-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[320px] h-[700px]"
        style={{ background: "linear-gradient(to bottom, rgba(243,236,221,0) 0%, rgba(243,236,221,.6) 25%, rgba(243,236,221,.78) 100%)" }}
      />
    </>
  );
}

const ico = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="h-[26px] w-[26px]" aria-hidden="true">
    {d}
  </svg>
);

function AdminHome() {
  const events = useAdminEvents();
  const notes = useNotifications("admin");
  const logout = useLogout("admin");

  const list = events.data?.events ?? [];
  const today = todayIso();
  const upcoming = list.filter((e) => e.data >= today && e.stato !== "annullato" && e.stato !== "chiuso");
  const waiting = upcoming.reduce((n, e) => n + (e.conteggi?.in_attesa ?? 0), 0);
  const damages = list.reduce((n, e) => n + (e.conteggi?.danni ?? 0), 0);

  return (
    <AppShell area="admin" title="Torre di regia" backdrop={<TowerBackdrop />}>
      <div className="h-[262px]" aria-hidden="true" />

      {events.isLoading ? (
        <Loading />
      ) : events.isError ? (
        <div className="relative mt-4">
          <ErrorBox error={events.error} onRetry={() => void events.refetch()} />
        </div>
      ) : (
        <>
          <section className="relative grid grid-cols-3 gap-2.5">
            <Stat value={upcoming.length} label="Eventi" to="/admin/eventi" />
            <Stat value={waiting} label="In attesa" to="/admin/eventi" />
            <Stat value={damages} label="Danni" to="/admin/report" />
          </section>

          <section className="relative mt-[18px]">
            <SectionTitle
              opaque
              action={
                <Link to="/admin/eventi/nuovo" className="relative bg-background pl-1 font-display text-[10px] uppercase tracking-[0.14em] text-accent">
                  + Nuovo
                </Link>
              }
            >
              Prossimi eventi
            </SectionTitle>
            {upcoming.length === 0 ? (
              <Empty>Nessun evento in programma. Creane uno con «+ Nuovo».</Empty>
            ) : (
              upcoming.slice(0, 4).map((e) => (
                <EventRow
                  key={e.id}
                  to="/admin/eventi/$code"
                  params={{ code: e.code }}
                  date={e.data}
                  name={e.nome}
                  place={e.luogo || "Luogo da definire"}
                  time={
                    e.conteggi && e.conteggi.invitati > 0
                      ? `${e.conteggi.invitati} chiamati · ${e.conteggi.confermati} confermati`
                      : timeRange(e.ora_inizio, e.ora_fine)
                  }
                  tone={e.stato === "confermato" ? "accent" : "primary"}
                />
              ))
            )}
          </section>

          <section className="relative mt-[18px]">
            <SectionTitle
              opaque
              action={
                <Link to="/admin/notifiche" className="relative bg-background pl-1 font-display text-[10px] uppercase tracking-[0.14em] text-accent">
                  Tutte
                </Link>
              }
            >
              Dal campo
            </SectionTitle>
            {(notes.data?.notifications.length ?? 0) === 0 ? (
              <Empty>Qui compariranno le risposte degli user e le segnalazioni di danni.</Empty>
            ) : (
              <ul className="border border-line bg-card px-2.5">
                {notes.data!.notifications.slice(0, 4).map((n) => (
                  <li key={n.id} className="flex items-start justify-between gap-3 border-b border-line py-2 last:border-b-0">
                    <span className={n.is_read ? "text-muted-foreground" : "text-foreground"}>{n.message}</span>
                    <span className="shrink-0 pt-0.5 text-[13px] italic text-muted-foreground">{timeAgo(n.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="relative mt-[18px]">
            <SectionTitle opaque>Altre stanze</SectionTitle>
            <nav className="grid grid-cols-3 gap-2.5">
              <Tile to="/admin/report" label="Report" icon={ico(<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" />)} />
              <Tile
                to="/admin/archivio"
                tone="accent"
                label="Archivio"
                icon={ico(
                  <>
                    <rect x="3" y="9" width="18" height="11" />
                    <path d="M3 9c0-3 4-5 9-5s9 2 9 5M3 13h18M11 12h2v3h-2z" />
                  </>,
                )}
              />
              <Tile
                to="/admin/notifiche"
                label="Notifiche"
                icon={ico(
                  <>
                    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
                    <path d="M10 20a2 2 0 0 0 4 0" />
                  </>,
                )}
              />
            </nav>
            <button type="button" onClick={() => void logout()} className="mx-auto mt-5 block font-display text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline underline-offset-4">
              Esci
            </button>
          </section>
        </>
      )}
    </AppShell>
  );
}
