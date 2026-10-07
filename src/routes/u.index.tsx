import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, BellButton } from "@/components/AppShell";
import { Sigillo } from "@/components/Sigillo";
import { ArcaneCircle, ErrorBox, Loading, ShieldDate, Tile, Wordmark } from "@/components/ui-kit";
import { useMyEvents, useProfile } from "@/lib/api";
import { timeRange, todayIso } from "@/lib/format";

export const Route = createFileRoute("/u/")({ component: UserHome });

function UserHome() {
  const profile = useProfile();
  const events = useMyEvents();
  const today = todayIso();
  const mine = (events.data?.events ?? []).filter((e) => e.data >= today && e.stato !== "annullato");
  const toAnswer = mine.filter((e) => e.mio_stato === "pending");
  const next = toAnswer[0] ?? mine.find((e) => e.mio_stato === "confirmed");
  const u = profile.data?.user;
  const full = u ? `${u.nome} ${u.cognome}`.trim() : "";
  const subtitle = u ? [u.qualifica, ...(u.competenze ?? [])].filter(Boolean).slice(0, 3).join(" · ") : "";

  return (
    <AppShell
      area="user"
      title="Home"
      plainHeader
      backdrop={<ArcaneCircle className="left-1/2 top-[150px] h-[540px] w-[540px] -translate-x-1/2" />}
    >
      <header className="relative flex items-center justify-between pb-2.5 pt-6">
        <Wordmark small />
        <BellButton area="user" />
      </header>

      {profile.isLoading ? (
        <Loading />
      ) : profile.isError || !u ? (
        <div className="mt-6">
          <ErrorBox error={profile.error} onRetry={() => void profile.refetch()} />
        </div>
      ) : (
        <>
          <section className="relative flex flex-col items-center pt-1.5 text-center">
            <div className="relative flex h-[168px] w-[168px] items-center justify-center">
              <svg viewBox="0 0 168 168" className="absolute inset-0" fill="none" aria-hidden="true">
                <polygon points="84,4 140,28 164,84 140,140 84,164 28,140 4,84 28,28" stroke="#A8874A" strokeWidth="1.5" />
                <polygon points="84,12 112,56 158,84 112,112 84,156 56,112 10,84 56,56" stroke="#1F5A5E" strokeWidth="1.2" fill="#E6DCC6" />
              </svg>
              <Sigillo name={full} size={118} className="relative" />
            </div>
            <p className="mt-2 text-[17px] italic text-muted-foreground">Bentornat{/a$/i.test(u.nome) ? "a" : "o"},</p>
            <h1 className="font-display text-[26px] font-bold tracking-[0.06em] text-primary">{full}</h1>
            {subtitle && <p className="text-base text-accent">{subtitle}</p>}
          </section>

          {events.isLoading ? (
            <Loading />
          ) : next ? (
            <Link
              to="/u/eventi/$code"
              params={{ code: next.code }}
              className="relative mt-[18px] flex items-center gap-3.5 border border-gold bg-card/90 px-4 py-3.5"
            >
              <ShieldDate date={next.data} tone={next.mio_stato === "pending" ? "primary" : "accent"} />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[10px] uppercase tracking-[0.2em] text-accent">
                  {next.mio_stato === "pending" ? "Ti attende una risposta" : "Il tuo prossimo evento"}
                </span>
                <span className="block truncate text-xl font-semibold leading-tight">{next.nome}</span>
                <span className="block truncate text-[15px] text-muted-foreground">
                  {[next.tipo, next.is_tl ? "team leader" : next.ruolo_evento, next.mio_stato === "pending" ? "" : timeRange(next.ora_inizio, next.ora_fine)].filter(Boolean).join(" · ")}
                </span>
              </span>
            </Link>
          ) : (
            <p className="relative mt-[18px] border border-dashed border-border bg-card/90 px-4 py-3 text-center italic text-muted-foreground">Nessun evento in programma per ora.</p>
          )}
          {toAnswer.length > 1 && (
            <p className="relative mt-2 text-center text-[15px] italic text-primary">
              Hai altre {toAnswer.length - 1} chiamate a cui rispondere.
            </p>
          )}

          <nav aria-label="Sezioni" className="relative mt-3.5 grid grid-cols-2 gap-3">
            <Tile
              to="/u/eventi"
              tall
              translucent
              label="I miei eventi"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="h-8 w-8" aria-hidden="true">
                  <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
                </svg>
              }
            />
            <Tile
              to="/u/profilo"
              tall
              translucent
              tone="accent"
              label="La mia scheda"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="h-8 w-8" aria-hidden="true">
                  <path d="M7 4h11a2 2 0 0 1 0 4H7M7 4a2 2 0 0 0 0 4v10a2 2 0 0 0 2 2h9a2 2 0 0 0 0-4H9" />
                </svg>
              }
            />
          </nav>
        </>
      )}
    </AppShell>
  );
}
