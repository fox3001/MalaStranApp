import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Empty, ErrorBox, Loading, PageTitle, SectionTitle } from "@/components/ui-kit";
import { api, useApiMutation, useMyFogli, useProfile, type FoglioRigaApi } from "@/lib/api";
import { MONTHS, formatDate } from "@/lib/format";
import { foglioDocx } from "@/lib/foglioDocx";

export const Route = createFileRoute("/u/presenze")({ component: FogliPresenza });

const meseNome = (m: string) => `${MONTHS[Number(m.slice(5, 7)) - 1] ?? ""} ${m.slice(0, 4)}`;

/** I fogli presenza dello user: quelli da completare e chiudere, e l'archivio personale (3 mesi). */
function FogliPresenza() {
  const q = useMyFogli();
  const me = useProfile();
  const chiudi = useApiMutation<string>("user", (mese) => ({ path: `/my/fogli/${mese}/chiudi`, method: "POST" }), {
    success: "Foglio chiuso e salvato nel tuo archivio",
    invalidate: [["fogli"], ["presenze"]],
  });
  const [busy, setBusy] = useState<number | null>(null);

  async function scarica(id: number) {
    setBusy(id);
    try {
      const d = await api<{ mese: string; nome: string; cognome: string; righe: FoglioRigaApi[] }>("user", `/my/fogli/chiusi/${id}`);
      await foglioDocx(d.mese, d.nome, d.cognome, d.righe);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell area="user" eyebrow="Il mio mese" title="Fogli presenza" back="/u/profilo">
      <PageTitle
        eyebrow="Foglio Presenze 3.0"
        title="Fogli presenza"
        subtitle="Ruolo, tariffa e rimborsi si scrivono nella scheda di ogni evento. A fine mese controlli qui e chiudi il foglio: lo scarichi in Word e puoi aggiungere dettagli a mano."
      />
      {q.isLoading ? (
        <Loading />
      ) : q.isError ? (
        <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          {q.data!.aperti.length === 0 ? (
            <div className="mt-5">
              <Empty>Nessun foglio da compilare: compare quando vieni confermato per un evento.</Empty>
            </div>
          ) : (
            q.data!.aperti.map((f) => {
              const mancanti = f.righe.filter((r) => !r.ruolo || !r.tariffa).length;
              return (
                <Card key={f.mese} className="mt-5 grid gap-3">
                  <SectionTitle>{meseNome(f.mese)}</SectionTitle>
                  <ul>
                    {f.righe.map((r) => (
                      <li key={r.event_id} className="border-b border-line py-2 last:border-b-0">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="min-w-0">
                            <strong className="font-display text-[13px] tracking-[0.06em] text-primary">{Number(r.data.slice(8, 10))}</strong>{" "}
                            <span className="text-[16px]">{r.tipologia}</span>
                            {r.location && <span className="text-[14px] text-muted-foreground"> · {r.location}</span>}
                          </span>
                        </span>
                        <span className="block text-[14px] text-muted-foreground">
                          {r.ruolo || r.tariffa ? (
                            <>
                              {r.ruolo || "ruolo ?"} · {r.tariffa ? `${r.tariffa} €` : "tariffa ?"}
                              {[r.diaria && `diaria ${r.diaria}`, r.pernotti && `pernotti ${r.pernotti}`, r.viaggi && `viaggi ${r.viaggi}`].filter(Boolean).map((x) => ` · ${x}`)}
                            </>
                          ) : (
                            <span className="italic text-primary">da compilare nella scheda dell'evento</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {mancanti > 0 && <p className="text-[14px] italic text-primary">{mancanti === 1 ? "1 evento senza ruolo o tariffa." : `${mancanti} eventi senza ruolo o tariffa.`}</p>}
                  <Button
                    type="button"
                    disabled={!f.chiudibile || chiudi.isPending}
                    onClick={() => {
                      if (window.confirm(`Chiudere il foglio di ${meseNome(f.mese)}? Dopo non potrai più modificarlo.`)) chiudi.mutate(f.mese);
                    }}
                  >
                    <Lock className="h-4 w-4" /> Chiudi il foglio di {meseNome(f.mese)}
                  </Button>
                  {!f.chiudibile && <p className="-mt-1 text-center text-[13px] italic text-muted-foreground">Si può chiudere dal {formatDate(f.chiudibile_dal)}, a mese finito.</p>}
                </Card>
              );
            })
          )}

          <section className="mt-6">
            <SectionTitle>Il mio archivio</SectionTitle>
            <p className="mb-2 text-[14px] italic text-muted-foreground">I fogli chiusi si scaricano in Word (.docx) e restano qui 3 mesi, poi si cancellano. Se in un giorno hai fatto due eventi, nel foglio c'è il primo: il secondo aggiungilo a mano.</p>
            {q.data!.chiusi.length === 0 ? (
              <Empty>Ancora nessun foglio chiuso.</Empty>
            ) : (
              <ul className="border border-gold bg-card">
                {q.data!.chiusi.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2.5 last:border-b-0">
                    <span className="min-w-0">
                      <span className="block font-display text-[13px] uppercase tracking-[0.1em] text-primary">{meseNome(c.mese)}</span>
                      <span className="block text-[13px] italic text-muted-foreground">
                        chiuso il {c.quando.slice(0, 10)} · si cancella il {formatDate(c.scade_il)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => void scarica(c.id)}
                      disabled={busy === c.id}
                      className="inline-flex min-h-10 shrink-0 items-center gap-1 border border-accent px-3 text-xs font-semibold text-accent disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" /> Word
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {me.data && <p className="mt-4 text-center text-[13px] italic text-muted-foreground">Nome e cognome nel foglio: {me.data.user.nome} {me.data.user.cognome}</p>}
          <p className="mt-2 text-center">
            <Link to="/u/eventi" className="font-display text-[10px] uppercase tracking-[0.14em] text-accent">
              Vai ai miei eventi ›
            </Link>
          </p>
        </>
      )}
    </AppShell>
  );
}
