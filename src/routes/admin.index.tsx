import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BellRing, CalendarDays, CheckCircle2, ClipboardList, Plus, Users, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, ErrorBox, EventRow, Loading, PageTitle, SectionTitle } from "@/components/ui-kit";
import { useAdminEvents, useAdminUsers, useNotifications } from "@/lib/api";
import { timeAgo, timeRange, todayIso } from "@/lib/format";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  const events = useAdminEvents();
  const users = useAdminUsers();
  const notes = useNotifications("admin");

  const list = events.data?.events ?? [];
  const today = todayIso();
  const upcoming = list.filter((e) => e.data >= today && e.stato !== "annullato" && e.stato !== "chiuso");
  const waiting = upcoming.reduce((n, e) => n + (e.conteggi?.in_attesa ?? 0), 0);
  const toDecide = upcoming.reduce((n, e) => n + (e.conteggi?.disponibili ?? 0), 0);
  const damages = list.reduce((n, e) => n + (e.conteggi?.danni ?? 0), 0);
  const userCount = users.data?.users.filter((u) => u.attivo).length ?? 0;

  return (
    <AppShell area="admin" title="Regia">
      <PageTitle eyebrow="Quadro di regia" title="Organizzazione" subtitle="Eventi, risposte degli user e controllo materiale in un solo punto." />

      {events.isLoading ? (
        <Loading />
      ) : events.isError ? (
        <div className="mt-6">
          <ErrorBox error={events.error} onRetry={() => void events.refetch()} />
        </div>
      ) : (
        <>
          {(toDecide > 0 || damages > 0) && (
            <section className="mt-6">
              <Card className="border-primary/30">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-primary">Da gestire</p>
                    <p className="mt-1 text-sm text-foreground">
                      {toDecide > 0 && <>{toDecide} user disponibili da confermare. </>}
                      {damages > 0 && <>{damages} oggetti segnalati come danneggiati.</>}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link to="/admin/eventi" className="inline-flex min-h-9 items-center rounded-lg border border-accent bg-accent px-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent-foreground">
                        Apri eventi
                      </Link>
                      {damages > 0 && (
                        <Link to="/admin/report" className="inline-flex min-h-9 items-center rounded-lg border border-primary/40 bg-surface px-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                          Vedi report
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={CalendarDays} value={upcoming.length} label="Eventi in programma" to="/admin/eventi" />
            <Stat icon={BellRing} value={waiting} label="Risposte in attesa" to="/admin/eventi" />
            <Stat icon={CheckCircle2} value={toDecide} label="Da confermare" to="/admin/eventi" />
            <Stat icon={Users} value={userCount} label="User attivi" to="/admin/collaboratori" />
          </section>

          <section className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/admin/eventi/nuovo" className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent-foreground">
              <Plus className="h-4 w-4" /> Nuovo evento
            </Link>
            <Link to="/admin/report" className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary/40 bg-surface px-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              <ClipboardList className="h-4 w-4" /> Report bolle
            </Link>
          </section>

          <section className="mt-8">
            <SectionTitle action={<Link to="/admin/eventi" className="eyebrow text-accent">Tutti</Link>}>Prossimi eventi</SectionTitle>
            {upcoming.length === 0 ? (
              <Empty>Nessun evento in programma. Crea il primo con "Nuovo evento".</Empty>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)]">
                {upcoming.slice(0, 4).map((e) => (
                  <EventRow
                    key={e.id}
                    to="/admin/eventi/$code"
                    params={{ code: e.code }}
                    date={e.data}
                    name={e.nome}
                    place={e.luogo || "Luogo da definire"}
                    time={timeRange(e.ora_inizio, e.ora_fine)}
                    code={e.code}
                    status={e.stato}
                    extra={
                      e.conteggi && e.conteggi.invitati > 0 ? (
                        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                          {e.conteggi.confermati}/{e.conteggi.invitati} confermati
                        </span>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8">
            <SectionTitle action={<Link to="/admin/notifiche" className="eyebrow text-accent">Tutte</Link>}>Ultime notifiche</SectionTitle>
            {(notes.data?.notifications.length ?? 0) === 0 ? (
              <Empty>Nessuna notifica. Qui compariranno le risposte degli user e le segnalazioni di danni.</Empty>
            ) : (
              <Card className="p-0">
                <ul>
                  {notes.data!.notifications.slice(0, 5).map((n) => (
                    <li key={n.id} className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
                      <span className={n.is_read ? "text-sm text-muted-foreground" : "text-sm font-medium text-foreground"}>{n.message}</span>
                      <span className="eyebrow shrink-0 text-muted-foreground">{timeAgo(n.created_at)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

function Stat({ icon: Icon, value, label, to }: { icon: LucideIcon; value: number; label: string; to: string }) {
  return (
    <Link to={to} className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] active:bg-muted">
      <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
      <p className="mt-2 font-serif text-2xl text-primary">{value}</p>
      <p className="eyebrow mt-1 text-muted-foreground">{label}</p>
    </Link>
  );
}
