import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck, Phone } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, ErrorBox, Field, Loading, ParticipantTag, SectionTitle, ShieldDate, StatusTag } from "@/components/ui-kit";
import { useApiMutation, useMyEvent } from "@/lib/api";
import { formatDateLong, timeRange } from "@/lib/format";

export const Route = createFileRoute("/u/eventi/$code")({ component: EventoUser });

function EventoUser() {
  const { code } = Route.useParams();
  const q = useMyEvent(code);
  const [nota, setNota] = useState("");
  const close = useApiMutation<void>("user", () => ({ path: `/my/events/${code}/chiudi`, method: "POST" }), { success: "Evento chiuso: l'ufficio è stato avvisato", invalidate: [["events"]] });
  const answer = useApiMutation<"available" | "unavailable">("user", (stato) => ({ path: `/my/events/${code}/availability`, method: "POST", body: { stato, nota } }), {
    success: "Risposta inviata all'ufficio",
    invalidate: [["events"]],
  });

  return (
    <AppShell area="user" eyebrow={q.data ? `Evento${q.data.event.tipo ? " · " + q.data.event.tipo : ""}` : "Evento"} title={q.data?.event.nome ?? "Evento"} back="/u/eventi">
      {q.isLoading ? (
        <Loading />
      ) : q.isError || !q.data ? (
        <div className="mt-6">
          <ErrorBox error={q.error} />
        </div>
      ) : (
        (() => {
          const { event: e, partecipazione: p, team, load_rows } = q.data;
          const closed = e.stato === "annullato" || e.stato === "chiuso";
          const canAnswer = !closed && (p.stato === "pending" || p.stato === "available" || p.stato === "unavailable");
          return (
            <>
              <section className="flex items-center gap-4 pt-4">
                <ShieldDate date={e.data} tone={closed ? "muted" : p.stato === "confirmed" ? "accent" : "primary"} size="lg" />
                <div className="min-w-0">
                  <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent">{formatDateLong(e.data)}</p>
                  <p className="text-[22px] font-semibold leading-tight">{p.is_tl ? "Sei team leader" : p.ruolo_evento || e.nome}</p>
                  <div className="mt-1">{closed ? <StatusTag status={e.stato} /> : <ParticipantTag status={p.stato} />}</div>
                </div>
              </section>

              {e.stato === "annullato" && (
                <Card className="mt-5 border-destructive/40">
                  <p className="text-sm text-destructive">Evento annullato{e.motivo_annullamento ? `: ${e.motivo_annullamento}` : "."}</p>
                </Card>
              )}

              <Card className="mt-5">
                {e.ora_ritrovo && <Field label="Ritrovo">{e.ora_ritrovo}</Field>}
                <Field label="Orario">{timeRange(e.ora_inizio, e.ora_fine)}</Field>
                <Field label="Luogo">{e.luogo || "Da definire"}</Field>
                {e.tipo && <Field label="Tipo">{e.tipo}</Field>}
                {p.ruolo_evento && <Field label="Il tuo ruolo">{p.ruolo_evento}</Field>}
                {e.descrizione && <Field label="Descrizione">{e.descrizione}</Field>}
              </Card>

              {canAnswer && (
                <Card className="mt-5 grid gap-3">
                  <SectionTitle>{p.stato === "pending" ? "Sei disponibile?" : "Vuoi cambiare risposta?"}</SectionTitle>
                  <textarea
                    value={nota}
                    onChange={(ev) => setNota(ev.target.value)}
                    rows={2}
                    placeholder="Nota per l'ufficio (facoltativa), es. «arrivo alle 19»"
                    className="w-full border border-border border-b-[1.5px] border-b-gold bg-card px-3 py-2 text-base outline-none focus:border-accent"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" disabled={answer.isPending || p.stato === "available"} onClick={() => answer.mutate("available")}>
                      Ci sono
                    </Button>
                    <Button type="button" variant="outline" disabled={answer.isPending || p.stato === "unavailable"} onClick={() => answer.mutate("unavailable")}>
                      Non posso
                    </Button>
                  </div>
                  {p.stato === "available" && <p className="text-xs text-muted-foreground">Hai dato disponibilità: ora l'ufficio deciderà chi confermare.</p>}
                </Card>
              )}

              {p.stato === "rejected" && (
                <Card className="mt-5">
                  <p className="text-sm text-muted-foreground">Per questo evento l'ufficio ha scelto altre persone. Grazie per la disponibilità!</p>
                </Card>
              )}

              {p.stato === "confirmed" && (
                <>
                  <Card className="mt-5">
                    <SectionTitle>Informazioni per te</SectionTitle>
                    <Field label="Operative">{e.info_operative || "—"}</Field>
                    {e.referente_nome && (
                      <Field label="Referente">
                        {e.referente_nome}
                        {e.referente_telefono && (
                          <a href={`tel:${e.referente_telefono}`} className="ml-2 inline-flex items-center gap-1 text-accent underline">
                            <Phone className="h-3.5 w-3.5" /> {e.referente_telefono}
                          </a>
                        )}
                      </Field>
                    )}
                    {e.compenso && <Field label="Compenso">{e.compenso}</Field>}
                  </Card>

                  {team.length > 0 && (
                    <Card className="mt-5">
                      <SectionTitle>Squadra confermata</SectionTitle>
                      <ul>
                        {team.map((t, i) => (
                          <li key={i} className="border-b border-border py-2 text-sm last:border-b-0">
                            {t.nome} {t.cognome}
                            {t.ruolo_evento && <span className="text-muted-foreground"> · {t.ruolo_evento}</span>}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                </>
              )}

              {p.is_tl && e.stato !== "annullato" && (
                <Card className="mt-5 border-gold">
                  <SectionTitle>Team leader</SectionTitle>
                  {e.stato === "chiuso" ? (
                    <p className="mt-1 text-sm text-foreground">Evento chiuso: la bolla ora la può modificare solo l'ufficio.</p>
                  ) : (
                    <p className="mt-1 text-sm text-foreground">Tocca a te compilare la bolla di carico di tutto l'evento: entrata, uscita ed eventuali danni. A fine evento premi «Evento chiuso».</p>
                  )}
                  <p className="mt-2 flex justify-between">
                    <span>Bolla di carico</span>
                    <span className="text-accent">
                      {load_rows.filter((r) => r.present).length}/{load_rows.length} entrate · {load_rows.filter((r) => r.returned).length} uscite
                    </span>
                  </p>
                  <div className="mt-1.5 h-1.5 bg-line" aria-hidden="true">
                    <div className="h-full bg-accent" style={{ width: `${load_rows.length ? (load_rows.filter((r) => r.present).length / load_rows.length) * 100 : 0}%` }} />
                  </div>
                  <Link to="/u/bolla/$code" params={{ code: e.code }} className="mt-3 flex min-h-12 items-center justify-center gap-2 bg-primary font-display text-[13px] uppercase tracking-[0.16em] text-primary-foreground">
                    <ClipboardCheck className="h-4 w-4" /> {e.stato === "chiuso" ? "Vedi la bolla" : "Apri e compila la bolla"}
                  </Link>
                  {e.stato !== "chiuso" && (
                    <button
                      type="button"
                      disabled={close.isPending}
                      onClick={() => {
                        const missing = load_rows.filter((r) => r.present && !r.returned).length;
                        const msg = `Chiudere l'evento?${missing ? ` Attenzione: ${missing} voci risultano entrate ma non uscite.` : ""} Dopo non potrai più modificare la bolla.`;
                        if (window.confirm(msg)) close.mutate();
                      }}
                      className="mt-3 flex min-h-12 w-full items-center justify-center border border-primary font-display text-[13px] uppercase tracking-[0.16em] text-primary"
                    >
                      Evento chiuso
                    </button>
                  )}
                </Card>
              )}
            </>
          );
        })()
      )}
    </AppShell>
  );
}
