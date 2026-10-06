import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, Check, MessageSquare, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { BollaImport, type ImportRow } from "@/components/BollaImport";
import { EventForm } from "@/components/EventForm";
import { Button, Card, ErrorBox, Field, Loading, ParticipantTag, SectionTitle, StatusTag } from "@/components/ui-kit";
import { downloadText, groupRows, useAdminEvent, useAdminUsers, useApiMutation, useResoconto, type LoadRow, type MalEvent, type Participant, type ParticipantStatus } from "@/lib/api";
import { PARTICIPANT_LABEL, formatDate, formatDateLong, timeRange } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/eventi/$code")({ component: EventoAdmin });

type Tab = "info" | "persone" | "bolla" | "resoconto";

function EventoAdmin() {
  const { code } = Route.useParams();
  const q = useAdminEvent(code);
  const [tab, setTab] = useState<Tab>("persone");

  return (
    <AppShell area="admin" title={q.data?.event.nome ?? "Evento"} back="/admin/eventi">
      {q.isLoading ? (
        <Loading />
      ) : q.isError || !q.data ? (
        <div className="mt-6">
          <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
        </div>
      ) : (
        <>
          <section className="pt-5">
            <p className="eyebrow text-accent">{q.data.event.code}</p>
            <h2 className="mt-1 font-serif text-2xl text-primary">{q.data.event.nome}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDateLong(q.data.event.data)} · {timeRange(q.data.event.ora_inizio, q.data.event.ora_fine)}
              {q.data.event.luogo && ` · ${q.data.event.luogo}`}
            </p>
            <div className="mt-2">
              <StatusTag status={q.data.event.stato} />
            </div>
          </section>

          <div className="mt-5 grid grid-cols-4 gap-1 rounded-lg border border-border bg-surface p-1">
            {(
              [
                ["persone", `Persone ${q.data.participants.length}`],
                ["bolla", `Bolla ${q.data.load_rows.length}`],
                ["resoconto", "Resoconto"],
                ["info", "Dettagli"],
              ] as Array<[Tab, string]>
            ).map(([k, label]) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={cn("min-h-10 rounded-md text-[11px] font-semibold uppercase tracking-[0.04em]", tab === k ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                {label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {tab === "info" && <InfoTab event={q.data.event} />}
            {tab === "persone" && <PeopleTab code={code} participants={q.data.participants} />}
            {tab === "resoconto" && <ResocontoTab code={code} />}
            {tab === "bolla" && <BollaTab code={code} rows={q.data.load_rows} participants={q.data.participants} />}
          </div>
        </>
      )}
    </AppShell>
  );
}

/* ----------------------------- Dettagli ----------------------------- */

function InfoTab({ event }: { event: MalEvent }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const save = useApiMutation<Partial<MalEvent>>("admin", (body) => ({ path: `/admin/events/${event.code}`, method: "PATCH", body }), {
    success: "Evento aggiornato: gli user coinvolti hanno ricevuto una notifica",
    invalidate: [["events"]],
  });
  const remove = useApiMutation<void>("admin", () => ({ path: `/admin/events/${event.code}`, method: "DELETE" }), { success: "Evento eliminato", invalidate: [["events"]] });

  if (editing)
    return (
      <EventForm
        initial={event}
        submitLabel="Salva modifiche"
        busy={save.isPending}
        onSubmit={(v) => save.mutate(v, { onSuccess: () => setEditing(false) })}
      />
    );

  return (
    <div className="grid gap-5">
      <Card>
        <Field label="Ritrovo">{event.ora_ritrovo || "—"}</Field>
        <Field label="Orario">{timeRange(event.ora_inizio, event.ora_fine)}</Field>
        <Field label="Luogo">{event.luogo || "—"}</Field>
        <Field label="Tipo">{event.tipo || "—"}</Field>
        <Field label="Descrizione">{event.descrizione || "—"}</Field>
      </Card>
      <Card>
        <SectionTitle>Per gli user confermati</SectionTitle>
        <Field label="Info operative">{event.info_operative || "—"}</Field>
        <Field label="Referente">{[event.referente_nome, event.referente_telefono].filter(Boolean).join(" · ") || "—"}</Field>
        <Field label="Compenso">
          {event.compenso || "—"} {event.compenso && <span className="text-xs text-muted-foreground">({event.compenso_visibile ? "visibile ai confermati" : "nascosto"})</span>}
        </Field>
      </Card>
      {event.note_admin && (
        <Card>
          <Field label="Note interne">{event.note_admin}</Field>
        </Card>
      )}
      {event.stato === "annullato" && event.motivo_annullamento && (
        <Card className="border-destructive/40">
          <Field label="Annullato">{event.motivo_annullamento}</Field>
        </Card>
      )}
      <Button type="button" variant="outline" onClick={() => setEditing(true)}>
        <Pencil className="h-4 w-4" /> Modifica evento
      </Button>
      <Button
        type="button"
        variant="danger"
        disabled={remove.isPending}
        onClick={() => {
          if (window.confirm(`Eliminare definitivamente "${event.nome}" con persone, bolla e notifiche collegate? Se vuoi solo avvisare che non si fa più, usa lo stato «Annullato».`))
            remove.mutate(undefined, { onSuccess: () => void router.navigate({ to: "/admin/eventi" }) });
        }}
      >
        <Trash2 className="h-4 w-4" /> Elimina evento
      </Button>
    </div>
  );
}

/* ------------------------------ Persone ----------------------------- */

const ORDER: ParticipantStatus[] = ["available", "confirmed", "pending", "unavailable", "rejected"];

function PeopleTab({ code, participants }: { code: string; participants: Participant[] }) {
  const users = useAdminUsers();
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [tlIds, setTlIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const invite = useApiMutation<number[]>("admin", (ids) => ({ path: `/admin/events/${code}/participants`, method: "POST", body: { user_ids: ids, tl_ids: tlIds.filter((t) => ids.includes(t)) } }), {
    success: "Richiesta di disponibilità inviata",
    invalidate: [["events"], ["users"]],
  });
  const decide = useApiMutation<{ userId: number; stato?: ParticipantStatus; ruolo_evento?: string; is_tl?: boolean }>(
    "admin",
    ({ userId, ...body }) => ({ path: `/admin/events/${code}/participants/${userId}`, method: "PATCH", body }),
    { invalidate: [["events"], ["users"]] },
  );
  const removeP = useApiMutation<number>("admin", (userId) => ({ path: `/admin/events/${code}/participants/${userId}`, method: "DELETE" }), { invalidate: [["events"], ["users"]] });

  const invited = new Set(participants.map((p) => p.user_id));
  const candidates = (users.data?.users ?? []).filter((u) => u.attivo && !invited.has(u.id)).filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [u.nome, u.cognome, u.username, u.qualifica, ...u.competenze, ...(u.costumi ?? [])].join(" ").toLowerCase().includes(q);
  });
  const sorted = useMemo(() => [...participants].sort((a, b) => ORDER.indexOf(a.stato) - ORDER.indexOf(b.stato)), [participants]);
  const counts = ORDER.map((s) => [s, participants.filter((p) => p.stato === s).length] as const).filter(([, n]) => n > 0);

  return (
    <div className="grid gap-5">
      {counts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {counts.map(([s, n]) => (
            <span key={s} className="flex items-center gap-1">
              <ParticipantTag status={s} /> <span className="text-xs text-muted-foreground">{n}</span>
            </span>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">Nessuno user coinvolto. Usa «Invita user» per chiedere la disponibilità.</p>
        </Card>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          {sorted.map((p) => (
            <li key={p.user_id} className="border-b border-border px-4 py-3 last:border-b-0">
              <div className="flex items-start justify-between gap-2">
                <Link to="/admin/collaboratori/$id" params={{ id: String(p.user_id) }} className="min-w-0">
                  <span className="block truncate font-serif text-base text-foreground">
                    {p.nome} {p.cognome}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{p.ruolo_evento || p.qualifica || `@${p.username}`}</span>
                </Link>
                <span className="flex flex-col items-end gap-1">
                  <ParticipantTag status={p.stato} />
                  {p.is_tl ? <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">Team leader</span> : null}
                </span>
              </div>
              {p.nota_user && (
                <p className="mt-2 flex items-start gap-1.5 rounded-md bg-muted px-2 py-1.5 text-xs text-foreground">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {p.nota_user}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {p.stato !== "confirmed" && (
                  <SmallBtn tone="ok" onClick={() => decide.mutate({ userId: p.user_id, stato: "confirmed" })}>
                    <Check className="h-3.5 w-3.5" /> Conferma
                  </SmallBtn>
                )}
                {p.stato !== "rejected" && (
                  <SmallBtn tone="no" onClick={() => decide.mutate({ userId: p.user_id, stato: "rejected" })}>
                    <X className="h-3.5 w-3.5" /> Non selezionare
                  </SmallBtn>
                )}
                {(p.stato === "confirmed" || p.stato === "rejected") && (
                  <SmallBtn onClick={() => decide.mutate({ userId: p.user_id, stato: "pending" })}>Riapri risposta</SmallBtn>
                )}
                <SmallBtn onClick={() => decide.mutate({ userId: p.user_id, is_tl: !p.is_tl })}>{p.is_tl ? "Togli team leader" : "Rendi team leader"}</SmallBtn>
                <SmallBtn
                  onClick={() => {
                    const r = window.prompt("Ruolo in questo evento (es. Capitano, Strega, Accoglienza):", p.ruolo_evento ?? "");
                    if (r !== null) decide.mutate({ userId: p.user_id, ruolo_evento: r });
                  }}
                >
                  Ruolo
                </SmallBtn>
                <SmallBtn
                  onClick={() => {
                    if (window.confirm(`Togliere ${p.nome} ${p.cognome} da questo evento?`)) removeP.mutate(p.user_id);
                  }}
                >
                  Togli
                </SmallBtn>
              </div>
            </li>
          ))}
        </ul>
      )}

      {picking ? (
        <Card className="grid gap-3">
          <SectionTitle>Invita user</SectionTitle>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtra per nome, competenza, costume…"
            className="min-h-11 rounded-lg border border-border-strong bg-surface px-3 text-sm outline-none focus:border-accent"
          />
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">{(users.data?.users.length ?? 0) === 0 ? "Non ci sono user: creali prima dalla rubrica." : "Nessun altro user da invitare."}</p>
          ) : (
            <ul className="max-h-72 overflow-auto">
              {candidates.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-b-0">
                  <label className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-sm">
                    <input type="checkbox" className="h-5 w-5" checked={selected.includes(u.id)} onChange={(e) => setSelected((s) => (e.target.checked ? [...s, u.id] : s.filter((x) => x !== u.id)))} />
                    <span className="min-w-0">
                      <span className="block">
                        {u.nome} {u.cognome}
                      </span>
                      {u.competenze.length > 0 && <span className="block truncate text-xs text-muted-foreground">{u.competenze.join(", ")}</span>}
                    </span>
                  </label>
                  {selected.includes(u.id) && (
                    <label className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      <input type="checkbox" checked={tlIds.includes(u.id)} onChange={(e) => setTlIds((s) => (e.target.checked ? [...s, u.id] : s.filter((x) => x !== u.id)))} />
                      Team leader
                    </label>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              disabled={!selected.length || invite.isPending}
              onClick={() =>
                invite.mutate(selected, {
                  onSuccess: () => {
                    setSelected([]);
                    setTlIds([]);
                    setPicking(false);
                  },
                })
              }
            >
              Invia richiesta ({selected.length})
            </Button>
            <Button type="button" variant="outline" onClick={() => setPicking(false)}>
              Chiudi
            </Button>
          </div>
        </Card>
      ) : (
        <Button type="button" onClick={() => setPicking(true)}>
          <UserPlus className="h-4 w-4" /> Invita user
        </Button>
      )}
    </div>
  );
}

function SmallBtn({ children, onClick, tone }: { children: React.ReactNode; onClick: () => void; tone?: "ok" | "no" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold",
        tone === "ok" ? "border-success/50 bg-success/10 text-success" : tone === "no" ? "border-destructive/40 text-destructive" : "border-border-strong text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------- Bolla ------------------------------ */

function BollaTab({ code, rows, participants }: { code: string; rows: LoadRow[]; participants: Participant[] }) {
  const [importKey, setImportKey] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const add = useApiMutation<Record<string, unknown>>("admin", (body) => ({ path: `/admin/events/${code}/load-rows`, method: "POST", body }), {
    success: "Bolla aggiornata",
    invalidate: [["events"], ["report"]],
  });
  const patch = useApiMutation<{ id: number } & Partial<Record<string, unknown>>>("admin", ({ id, ...body }) => ({ path: `/admin/load-rows/${id}`, method: "PATCH", body }), {
    invalidate: [["events"], ["report"]],
  });
  const assignGroup = useApiMutation<{ categoria: string; assigned_user_id: number | null }>("admin", (body) => ({ path: `/admin/events/${code}/load-rows/assign`, method: "POST", body }), {
    success: "Gruppo assegnato",
    invalidate: [["events"], ["report"]],
  });
  const del = useApiMutation<number>("admin", (id) => ({ path: `/admin/load-rows/${id}`, method: "DELETE" }), { invalidate: [["events"], ["report"]] });
  const assignable = participants.filter((p) => p.stato !== "rejected" && p.stato !== "unavailable");
  const groups = groupRows(rows);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    add.mutate(
      {
        item: String(f.get("item") || ""),
        categoria: String(f.get("categoria") || ""),
        note: String(f.get("note") || ""),
        quantita: Number(f.get("quantita") || 1),
      },
      { onSuccess: () => form.reset() },
    );
  }

  const issues = rows.filter((r) => r.damaged || r.comment).length;
  const input = "min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm outline-none focus:border-accent";

  return (
    <div className="grid gap-5">
      {rows.length > 0 && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <Counter label="Prep" value={`${rows.filter((r) => r.prep).length}/${rows.length}`} />
          <Counter label="Entrata" value={`${rows.filter((r) => r.present).length}/${rows.length}`} />
          <Counter label="Uscita" value={`${rows.filter((r) => r.returned).length}/${rows.length}`} />
          <Counter label="Segnal." value={String(issues)} warn={issues > 0} />
        </div>
      )}
      <p className="-mt-2 text-xs text-muted-foreground">
        <strong>Prep</strong> = preparato in magazzino (lo spunti tu). <strong>Entrata</strong> e <strong>Uscita</strong> = le spunte del team leader all'inizio e alla fine dell'evento.
      </p>

      {groups.length > 1 && (
        <div className="-mt-2 flex gap-2">
          <button type="button" onClick={() => setOpen(Object.fromEntries(groups.map(([g]) => [g, true])))} className="min-h-9 flex-1 rounded-lg border border-border-strong text-xs font-semibold text-muted-foreground">
            Apri tutti i gruppi
          </button>
          <button type="button" onClick={() => setOpen(Object.fromEntries(groups.map(([g]) => [g, false])))} className="min-h-9 flex-1 rounded-lg border border-border-strong text-xs font-semibold text-muted-foreground">
            Chiudi tutti i gruppi
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">La bolla è vuota. Aggiungi le voci qui sotto o importale da un file Excel.</p>
        </Card>
      ) : (
        groups.map(([cat, list]) => {
          const isOpen = open[cat] ?? true;
          const done = list.filter((r) => r.returned).length;
          const warn = list.some((r) => r.damaged || r.comment);
          return (
            <section key={cat} className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              <button type="button" onClick={() => setOpen((o) => ({ ...o, [cat]: !isOpen }))} className="flex w-full items-center justify-between gap-2 bg-secondary px-4 py-3 text-left">
                <span className="min-w-0">
                  <span className="block truncate font-serif text-base text-primary">{cat}</span>
                  <span className="block text-xs text-muted-foreground">
                    {list.length} voci · prep {list.filter((r) => r.prep).length} · entrata {list.filter((r) => r.present).length} · uscita {done}
                    {warn && <span className="font-semibold text-destructive"> · segnalazioni</span>}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-accent">{isOpen ? "Chiudi ▲" : "Apri ▼"}</span>
              </button>
              {isOpen && (
                <ul>
                  {list.map((r) => (
                    <li key={r.id} className={cn("border-b border-border px-4 py-3 last:border-b-0", r.damaged && "bg-destructive/5")}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">
                            {r.quantita > 1 && `${r.quantita}× `}
                            {r.item}
                          </span>
                          {r.note && <span className="block text-xs text-muted-foreground">{r.note}</span>}
                        </span>
                        <button type="button" aria-label="Elimina riga" onClick={() => window.confirm(`Togliere "${r.item}" dalla bolla?`) && del.mutate(r.id)} className="rounded p-1.5 text-muted-foreground">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1.5">
                        <BigCheck label="Prep" on={r.prep} onClick={() => patch.mutate({ id: r.id, prep: !r.prep })} />
                        <BigCheck label="Entrata" on={r.present} onClick={() => patch.mutate({ id: r.id, present: !r.present })} />
                        <BigCheck label="Uscita" on={r.returned} onClick={() => patch.mutate({ id: r.id, returned: !r.returned })} />
                        <BigCheck label="Danni" on={r.damaged} danger onClick={() => patch.mutate({ id: r.id, damaged: !r.damaged })} />
                      </div>
                      {r.comment && (
                        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-muted px-2 py-1.5 text-xs">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" /> {r.comment}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}

      <Card>
        <SectionTitle>Aggiungi voce</SectionTitle>
        <form onSubmit={submit} className="grid gap-2">
          <input name="item" required placeholder="Nome (oggetto, costume, kit…) *" className={input} />
          <input name="categoria" list="bolla-gruppi" placeholder="Sezione · gruppo (es. Costumi · Dr Harkin)" className={input} />
          <datalist id="bolla-gruppi">
            {groups.map(([g]) => (
              <option key={g} value={g} />
            ))}
          </datalist>
          <input name="note" placeholder="Note / destinazione (es. stanza figlio, nel kit)" className={input} />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Quantità <input name="quantita" type="number" min={1} defaultValue={1} className={cn(input, "w-24")} />
          </label>
          <Button type="submit" disabled={add.isPending}>
            Aggiungi alla bolla
          </Button>
        </form>
      </Card>

      <BollaImport
        key={importKey}
        participants={assignable}
        busy={add.isPending}
        onImport={(list: ImportRow[]) => add.mutate({ rows: list }, { onSuccess: () => setImportKey((k) => k + 1) })}
      />
    </div>
  );
}

function BigCheck({ label, on, onClick, danger }: { label: string; on: boolean; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg border text-[11px] font-semibold",
        on ? (danger ? "border-destructive bg-destructive text-white" : "border-success bg-success text-white") : "border-border-strong bg-surface text-muted-foreground",
      )}
    >
      <span className={cn("flex h-4 w-4 items-center justify-center rounded border", on ? "border-white" : "border-border-strong")}>{on && <Check className="h-3 w-3" />}</span>
      {label}
    </button>
  );
}

function Counter({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={cn("rounded-lg border bg-card p-2", warn ? "border-destructive/40" : "border-border")}>
      <p className={cn("font-serif text-xl", warn ? "text-destructive" : "text-primary")}>{value}</p>
      <p className="eyebrow text-muted-foreground">{label}</p>
    </div>
  );
}

function Flag({ label, on, onClick, danger }: { label: string; on: boolean; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex min-h-8 items-center gap-1.5", on ? (danger ? "text-destructive" : "text-success") : "text-muted-foreground")}>
      <span className={cn("flex h-4 w-4 items-center justify-center rounded border", on ? (danger ? "border-destructive bg-destructive text-white" : "border-success bg-success text-white") : "border-border-strong")}>
        {on && <Check className="h-3 w-3" />}
      </span>
      {label}
    </button>
  );
}

/* ----------------------------- Resoconto ---------------------------- */

function ResocontoTab({ code }: { code: string }) {
  const router = useRouter();
  const q = useResoconto(code);
  const [note, setNote] = useState<string | null>(null);
  const saveNote = useApiMutation<string>("admin", (note_finali) => ({ path: `/admin/events/${code}`, method: "PATCH", body: { note_finali, notify: false } }), {
    success: "Note salvate",
    invalidate: [["events"]],
  });
  const archive = useApiMutation<void>("admin", () => ({ path: `/admin/events/${code}/archivia`, method: "POST" }), { success: "Evento archiviato", invalidate: [["events"], ["archive"]] });

  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <ErrorBox error={q.error} onRetry={() => void q.refetch()} />;
  const { summary: s, people, problemi, event } = q.data;
  const noteValue = note ?? event.note_finali;

  return (
    <div className="grid gap-5">
      <Card>
        <SectionTitle>Com'è andata</SectionTitle>
        <textarea
          value={noteValue}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Le tue note finali: pubblico, cliente, cosa migliorare la prossima volta…"
          className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <Button type="button" variant="outline" full className="mt-2" disabled={saveNote.isPending || noteValue === event.note_finali} onClick={() => saveNote.mutate(noteValue)}>
          Salva note
        </Button>
      </Card>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Counter label="Confermati" value={`${s.persone.confermati}/${s.persone.invitati}`} />
        <Counter label="Uscite" value={`${s.bolla.rientrati}/${s.bolla.oggetti}`} warn={s.bolla.non_rientrati > 0} />
        <Counter label="Danni" value={String(s.bolla.danneggiati)} warn={s.bolla.danneggiati > 0} />
      </div>

      <Card>
        <SectionTitle>Da sistemare</SectionTitle>
        {problemi.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun danno, commento o oggetto mancante.</p>
        ) : (
          <ul>
            {problemi.map((r) => (
              <li key={r.id} className="border-b border-border py-2.5 text-sm last:border-b-0">
                <span className="font-medium">{r.item}</span> {r.note && <span className="text-muted-foreground">· {r.note}</span>}
                <span className="mt-0.5 block text-xs">
                  {r.damaged && <span className="mr-2 font-semibold text-destructive">Danneggiato</span>}
                  {r.present && !r.returned && <span className="mr-2 font-semibold text-warning-foreground">Entrata senza uscita</span>}
                  {r.comment && <span className="text-foreground">“{r.comment}”</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
        {s.bolla.mai_segnati_presenti > 0 && <p className="mt-2 text-xs text-muted-foreground">{s.bolla.mai_segnati_presenti} voci senza la spunta di entrata.</p>}
      </Card>

      <Card>
        <SectionTitle>Persone</SectionTitle>
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessuno invitato.</p>
        ) : (
          <ul>
            {people.map((p, i) => (
              <li key={i} className="border-b border-border py-2 text-sm last:border-b-0">
                {p.nome} {p.cognome} <span className="text-muted-foreground">· {PARTICIPANT_LABEL[p.stato]}</span>
                {p.ruolo_evento && <span className="text-muted-foreground"> · {p.ruolo_evento}</span>}
                {p.nota_user && <span className="block text-xs text-muted-foreground">“{p.nota_user}”</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Button type="button" onClick={() => downloadText(`${event.code}-resoconto.txt`, q.data!.testo)}>
        Scarica resoconto (.txt)
      </Button>

      <Card className="bg-muted/40">
        <p className="text-sm text-foreground">
          Il <strong>{formatDate(q.data.archivia_il)}</strong> (un mese dopo l'evento) questo evento verrà tolto dall'app in automatico e il resoconto finirà nell'
          <Link to="/admin/archivio" className="font-semibold text-accent underline">
            Archivio
          </Link>
          .
        </p>
        <Button
          type="button"
          variant="outline"
          full
          className="mt-3"
          disabled={archive.isPending}
          onClick={() => {
            if (window.confirm("Archiviare adesso? L'evento sparisce dall'app (anche per gli user) e resta solo il resoconto in Archivio."))
              archive.mutate(undefined, { onSuccess: () => void router.navigate({ to: "/admin/archivio" }) });
          }}
        >
          Archivia adesso
        </Button>
      </Card>
    </div>
  );
}
