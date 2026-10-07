import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AssenzeList } from "@/components/AssenzeList";
import { MonthCalendar } from "@/components/MonthCalendar";
import { ErrorBox, Loading, SectionTitle, ShieldDate } from "@/components/ui-kit";
import { api, useApiMutation, useMyAssenze, useMyEvents } from "@/lib/api";
import { formatDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/calendario")({ component: CalendarioUser });

/** Calendario degli user: si vedono solo le date e la tipologia/tematica, senza aprire l'evento. */
function CalendarioUser() {
  const q = useMyEvents();
  const qc = useQueryClient();
  const assenze = useMyAssenze();
  const [awayMode, setAwayMode] = useState(false);
  const delAssenza = useApiMutation<number>("user", (id) => ({ path: `/profile/assenze/${id}`, method: "DELETE" }), { invalidate: [["assenze"]] });
  // tutti i singoli giorni in cui non c'è, per colorarli nel calendario
  const away = useMemo(() => {
    const set = new Set<string>();
    for (const a of assenze.data?.assenze ?? []) {
      for (let d = new Date(a.dal + "T12:00:00"); d.toISOString().slice(0, 10) <= a.al; d.setDate(d.getDate() + 1)) set.add(d.toISOString().slice(0, 10));
    }
    return set;
  }, [assenze.data]);

  async function toggle(date: string) {
    // si colora subito, poi si salva
    qc.setQueryData<{ assenze: Array<{ id?: number; dal: string; al: string }> }>(["user", "assenze"], (old) => {
      const list = old?.assenze ?? [];
      return away.has(date)
        ? { assenze: list.flatMap((a) => (a.dal <= date && date <= a.al ? [] : [a])) }
        : { assenze: [...list, { dal: date, al: date }] };
    });
    try {
      await api("user", "/profile/assenze/giorno", { method: "POST", body: { data: date } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Non salvato");
    } finally {
      void qc.invalidateQueries({ queryKey: ["user", "assenze"] });
    }
  }

  return (
    <AppShell area="user" eyebrow="Le tue date" title="Calendario">
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setAwayMode((v) => !v)}
          aria-pressed={awayMode}
          className={cn(
            "mb-3 flex min-h-11 w-full items-center justify-center gap-2 border px-3 font-display text-[12px] uppercase tracking-[0.14em]",
            awayMode
              ? "border-primary bg-primary text-white [box-shadow:inset_0_0_0_3px_var(--color-primary),inset_0_0_0_4px_var(--color-gold-light)]"
              : "border-primary bg-card text-primary",
          )}
        >
          {awayMode ? "Fatto" : "Segna i giorni in cui non ci sei"}
        </button>
        {awayMode && (
          <p className="mb-3 border-l-2 border-primary pl-2 text-[15px] italic text-muted-foreground">
            Tocca i giorni in cui non puoi lavorare; toccali di nuovo per toglierli. L'admin non ti proporrà per gli eventi in quei giorni.
          </p>
        )}
        {q.isLoading ? (
          <Loading />
        ) : q.isError ? (
          <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
        ) : (
          <MonthCalendar
            away={away}
            awayMode={awayMode}
            onAwayToggle={(d) => void toggle(d)}
            awayLegend="non ci sei"
            legend={[
              { tone: "primary", label: "da rispondere" },
              { tone: "accent", label: "confermato" },
            ]}
            items={(q.data?.events ?? [])
              .filter((e) => e.mio_stato !== "rejected" && e.mio_stato !== "unavailable" && e.stato !== "annullato")
              .map((e) => {
                const tone = e.mio_stato === "confirmed" ? "accent" : "primary";
                return {
                  key: e.code,
                  date: e.data,
                  tone,
                  render: (
                    <div className="mb-2.5 flex items-center gap-3.5 border border-border bg-card px-3 py-2.5">
                      <ShieldDate date={e.data} tone={tone} />
                      <span className="min-w-0">
                        <span className="block text-[19px] font-semibold leading-tight">{e.tematica || e.tipo || "Evento"}</span>
                        <span className="block text-[15px] capitalize text-muted-foreground">{formatDateLong(e.data)}</span>
                      </span>
                    </div>
                  ),
                };
              })}
          />
        )}
        <div className="mt-6">
          <SectionTitle>I giorni in cui non ci sei</SectionTitle>
          <AssenzeList
            assenze={assenze.data?.assenze ?? []}
            hideAdd
            empty="Nessun giorno segnato. Usa il tasto qui sopra e tocca i giorni nel calendario."
            onDelete={(id) => delAssenza.mutate(id)}
          />
        </div>
      </div>
    </AppShell>
  );
}
