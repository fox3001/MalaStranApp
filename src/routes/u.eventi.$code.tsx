import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ClipboardCheck, Phone, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, ErrorBox, Field, Loading, ParticipantTag, SectionTitle, StatusTag } from "@/components/ui-kit";
import { useApiMutation, useMyEvent } from "@/lib/api";
import { formatDateLong, timeRange } from "@/lib/format";

export const Route = createFileRoute("/u/eventi/$code")({ component: EventoUser });

function EventoUser() {
  const { code } = Route.useParams();
  const q = useMyEvent(code);
  const [nota, setNota] = useState("");
  const answer = useApiMutation<"available" | "unavailable">("user", (stato) => ({ path: `/my/events/${code}/availability`, method: "POST", body: { stato, nota } }), {
    success: "Risposta inviata all'ufficio",
    invalidate: [["events"]],
  });

  return (
    <AppShell area="user" title="Evento" back="/u/eventi">
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
              <section className="pt-5">
                <p className="eyebrow text-accent">{e.code}</p>
                <h2 className="mt-1 font-serif text-2xl text-primary">{e.nome}</h2>
                <p className="mt-1 text-sm text-foreground">{formatDateLong(e.data)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {closed ? <StatusTag status={e.stato} /> : <ParticipantTag status={p.stato} />}
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
                    className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" disabled={answer.isPending || p.stato === "available"} onClick={() => answer.mutate("available")}>
                      <Check className="h-4 w-4" /> Disponibile
                    </Button>
                    <Button type="button" variant="outline" disabled={answer.isPending || p.stato === "unavailable"} onClick={() => answer.mutate("unavailable")}>
                      <X className="h-4 w-4" /> Non disponibile
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

                  <Card className="mt-5">
                    <SectionTitle>La mia bolla di carico</SectionTitle>
                    {load_rows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nessun oggetto assegnato a te per questo evento.</p>
                    ) : (
                      <>
                        <p className="text-sm text-foreground">
                          {load_rows.length} oggetti · {load_rows.filter((r) => r.present).length} presenti · {load_rows.filter((r) => r.returned).length} rientrati
                        </p>
                        <Link to="/u/bolla/$code" params={{ code: e.code }} className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold uppercase tracking-[0.08em] text-accent-foreground">
                          <ClipboardCheck className="h-4 w-4" /> Apri e compila la bolla
                        </Link>
                      </>
                    )}
                  </Card>
                </>
              )}
            </>
          );
        })()
      )}
    </AppShell>
  );
}
