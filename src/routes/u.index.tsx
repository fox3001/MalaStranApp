import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, BellButton, useLogout } from "@/components/AppShell";
import { ShoutIcon } from "@/components/ShoutIcon";
import { Sigillo } from "@/components/Sigillo";
import { ArcaneCircle, ErrorBox, Loading, ShieldDate, Tile, Wordmark } from "@/components/ui-kit";
import { useMyEvents, useMyShouts, useProfile } from "@/lib/api";
import { cn } from "@/lib/utils";
import { timeRange, todayIso } from "@/lib/format";

export const Route = createFileRoute("/u/")({ component: UserHome });

function UserHome() {
  const profile = useProfile();
  const events = useMyEvents();
  const logout = useLogout("user");
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
      backdrop={<ArcaneCircle spin className="left-1/2 top-[150px] h-[540px] w-[540px] -translate-x-1/2" />}
    >
      <header className="relative flex items-center justify-between pb-2.5 pt-6">
        <Wordmark small />
        <span className="flex items-center gap-2">
          <button type="button" onClick={() => void logout()} className="min-h-11 border border-gold px-3 font-display text-[10px] uppercase tracking-[0.16em] text-primary">
            Esci
          </button>
          <BellButton area="user" />
        </span>
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
              className="relative mt-[18px] flex items-center gap-3.5 border border-gold bg-card px-4 py-3.5"
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
            <p className="relative mt-[18px] border border-dashed border-border bg-card px-4 py-3 text-center italic text-muted-foreground">Nessun evento in programma per ora.</p>
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

          <ShoutPreview />
        </>
      )}
    </AppShell>
  );
}

/** Anteprima dell'ultimo shout dell'admin, sotto ai due riquadri. */
function ShoutPreview() {
  const q = useMyShouts();
  const last = q.data?.shouts[0];
  const unread = q.data?.unread ?? 0;
  return (
    <Link
      to="/u/shout"
      className={cn("relative mt-3.5 block border bg-card px-4 py-3", unread ? "border-accent [box-shadow:inset_4px_0_0_var(--color-accent)]" : "border-gold")}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-accent">
          <ShoutIcon className="h-4 w-4" /> Shout dall'admin
        </span>
        {unread > 0 ? (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 font-sans text-[10px] font-bold text-white">{unread}</span>
        ) : (
          last && <span className="text-[13px] italic text-muted-foreground">{last.quando}</span>
        )}
      </span>
      {last ? (
        <>
          <span className="mt-1 line-clamp-3 block whitespace-pre-wrap break-words text-[17px] leading-snug">{last.testo}</span>
          <span className="mt-1 block text-right font-display text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{unread > 0 ? `${last.quando} · leggi` : "Tutti gli shout ›"}</span>
        </>
      ) : (
        <span className="mt-1 block italic text-muted-foreground">Nessun messaggio dall'admin per ora.</span>
      )}
    </Link>
  );
}
