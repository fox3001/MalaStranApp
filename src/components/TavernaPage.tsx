import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { FlockButton, TowerBackdrop } from "@/components/TowerBackdrop";
import { ErrorBox, Loading } from "@/components/ui-kit";
import { api, useTaverna, useTavernaPeople, type Area } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { findTags, mentionAt, rankPeople, samePerson, type MentionPerson, type TagRange } from "@/lib/mentions";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

/** Colora nel testo i tag "@Nome" salvati con il messaggio. */
function renderTesto(testo: string, mentions: MentionPerson[], isMe: (p: MentionPerson) => boolean): ReactNode[] {
  if (!mentions.length) return [testo];
  const out: ReactNode[] = [];
  let last = 0;
  for (const t of findTags(testo, mentions)) {
    if (t.start > last) out.push(testo.slice(last, t.start));
    out.push(
      <span key={t.start} className={cn("font-bold", t.person.role === "admin" ? "text-accent" : "text-primary", isMe(t.person) && "bg-gold-light/70 px-0.5")}>
        {testo.slice(t.start, t.end)}
      </span>,
    );
    last = t.end;
  }
  if (last < testo.length) out.push(testo.slice(last));
  return out;
}

/** Il testo che si sta scrivendo, con i tag già scelti colorati (sta dietro al riquadro trasparente). */
function renderBozza(text: string, tags: TagRange[]): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const t of tags) {
    if (t.start > last) out.push(text.slice(last, t.start));
    out.push(
      <mark key={t.start} className={cn("text-white", t.person.role === "admin" ? "bg-accent" : "bg-primary")}>
        {text.slice(t.start, t.end)}
      </mark>,
    );
    last = t.end;
  }
  out.push(text.slice(last) + "​");
  return out;
}

/**
 * La Taverna: un'unica chat per tutti, user e admin, che si aggiorna da sola.
 * Lo sfondo è la torre della Regia; la chat parte dove in Regia ci sono i tre riquadri
 * e prosegue verso il basso. Ogni messaggio sparisce dopo 24 ore.
 */
export function TavernaPage({ area }: { area: Area }) {
  const q = useTaverna(area);
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const mirror = useRef<HTMLDivElement>(null);
  const peopleQ = useTavernaPeople(area);
  const meRole = q.data?.me_role;
  const meId = q.data?.me_id ?? null;
  const isMe = (p: MentionPerson) => (meRole === "admin" ? p.role === "admin" : p.role === "user" && p.id === meId);
  // si possono taggare tutti tranne se stessi
  const people = useMemo(
    () => (peopleQ.data?.people ?? []).filter((p) => (meRole === "admin" ? p.role !== "admin" : !(p.role === "user" && p.id === meId))),
    [peopleQ.data, meRole, meId],
  );

  const [chosen, setChosen] = useState<MentionPerson[]>([]); // persone scelte dal menù
  const [caret, setCaret] = useState(0);
  const [pick, setPick] = useState(0);
  const [closed, setClosed] = useState(false);
  const tags = useMemo(() => findTags(text, chosen), [text, chosen]);
  const mention = mentionAt(text, caret, tags);
  const ranked = mention && !closed ? rankPeople(mention.query, people) : null;
  const suggestions = ranked?.people ?? [];

  // dove rimettere il cursore dopo aver inserito o tolto un tag
  const pendingCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    // il riquadro cresce con il testo (fino a 4 righe circa)
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 132) + "px";
    if (mirror.current) mirror.current.scrollTop = el.scrollTop;
    const pos = pendingCaret.current;
    if (pos === null) return;
    pendingCaret.current = null;
    el.focus();
    el.setSelectionRange(pos, pos);
    setCaret(pos);
  }, [text]);

  const messages = q.data?.messages ?? [];
  const lastId = messages[messages.length - 1]?.id ?? 0;
  // un condor per ogni persona diversa che ha scritto nelle ultime 12 ore
  const since = Date.now() - 12 * 3600 * 1000;
  const writers = new Set(
    messages
      .filter((m) => new Date(m.created_at.replace(" ", "T") + "Z").getTime() >= since)
      .map((m) => (m.author_role === "admin" ? "admin" : `u${m.user_id}`))
      .concat("admin"), // l'admin si conta sempre: si parte da 1
  ).size;
  const [showWriters, setShowWriters] = useState(true);

  // quando arriva un messaggio nuovo si scende in fondo
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastId, q.isLoading]);

  function update(next: string, pos: number) {
    pendingCaret.current = pos;
    setText(next.slice(0, 600));
  }

  function addChosen(p: MentionPerson) {
    setChosen((c) => (c.some((x) => samePerson(x, p)) ? c : [...c, p]));
  }

  // mette "@Nome " al posto di quello che si stava scrivendo
  function choose(p: MentionPerson) {
    if (!mention || !ranked) return;
    addChosen(p);
    setPick(0);
    const tag = `@${p.name}`;
    // quello che si era già scritto dopo il nome resta ("@elena ciao" → "@Elena Rossi ciao")
    const rest = mention.query.slice(ranked.length).replace(/^\s+/, "");
    let after = text.slice(caret);
    if (!rest) after = after.replace(/^\S*/, "").replace(/^ /, ""); // si completa la parola che si stava scrivendo
    const before = text.slice(0, mention.start) + tag + " " + rest;
    update(before + after, before.length);
  }

  // toccando il nome di qualcuno si risponde direttamente a lui
  function replyTo(m: { author_role: "admin" | "user"; user_id: number | null; author_name: string }) {
    const p = people.find((x) => (m.author_role === "admin" ? x.role === "admin" : x.role === "user" && x.id === m.user_id));
    if (!p) return; // sono io, oppure non è più attivo
    const tag = `@${p.name} `;
    addChosen(p);
    setClosed(true);
    const next = text.startsWith(tag) ? text : tag + text;
    update(next, next.length);
  }

  // un tag si cancella tutto insieme, e non si può scrivere in mezzo al nome
  function guardTags(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const s = el.selectionStart;
    const end = el.selectionEnd;
    if (s !== end) return;
    if (e.key === "Backspace") {
      const t = tags.find((x) => s > x.start && s <= x.end);
      if (t) {
        e.preventDefault();
        update(text.slice(0, t.start) + text.slice(t.end), t.start);
      }
      return;
    }
    if (e.key === "Delete") {
      const t = tags.find((x) => s >= x.start && s < x.end);
      if (t) {
        e.preventDefault();
        update(text.slice(0, t.start) + text.slice(t.end), t.start);
      }
      return;
    }
    if (e.key.length === 1) {
      const t = tags.find((x) => s > x.start && s < x.end);
      if (t) el.setSelectionRange(t.end, t.end); // si scrive dopo il nome, non dentro
    }
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    // se il menù è aperto, prima si sceglie la persona più probabile
    const top = suggestions[Math.min(pick, suggestions.length - 1)];
    if (top) {
      choose(top);
      return;
    }
    const testo = text.trim();
    if (!testo || busy) return;
    setBusy(true);
    try {
      const mentions = tags
        .map((t) => t.person)
        .filter((p, i, all) => all.findIndex((x) => samePerson(x, p)) === i)
        .map((p) => ({ role: p.role, id: p.id }));
      await api(area, "/taverna", { method: "POST", body: { testo, mentions } });
      setText("");
      setChosen([]);
      await qc.invalidateQueries({ queryKey: [area, "taverna"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Messaggio non inviato");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell area={area} eyebrow="Per tutti · user e admin" title="Taverna" backdrop={<TowerBackdrop birds={showWriters ? writers : 20} />}
      headerExtra={
        <FlockButton
          on={showWriters}
          count={writers}
          light={area === "admin"}
          onToggle={() => setShowWriters((v) => !v)}
          label={showWriters ? `${writers} condor: chi ha scritto nelle ultime 12 ore, admin compreso. Tocca per vederne 20` : "Mostra un condor per chi ha scritto nelle ultime 12 ore"}
        />
      }>
      <div className="h-[262px]" aria-hidden="true" />
      <section className="relative flex h-[calc(100dvh-76px-262px-112px)] min-h-[360px] flex-col border border-gold bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-gold px-3 py-1.5">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-accent">Taverna</span>
          <span className="text-[13px] italic text-muted-foreground">i messaggi spariscono dopo 24 ore</span>
        </div>

        <div ref={list} className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
          {q.isLoading ? (
            <Loading />
          ) : q.isError ? (
            <div className="p-3">
              <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
            </div>
          ) : messages.length === 0 ? (
            <p className="px-4 py-6 text-center italic text-muted-foreground">La taverna è vuota. Scrivi il primo messaggio!</p>
          ) : (
            messages.map((m) => {
              const mentions = Array.isArray(m.mentions) ? m.mentions : [];
              const mine = m.author_role === "admin" ? meRole === "admin" : meRole === "user" && m.user_id === meId;
              const forMe = !mine && mentions.some(isMe);
              return (
                <article key={m.id} className={cn("border-b border-line px-3 py-2.5 last:border-b-0", forMe && "border-l-4 border-l-gold bg-gold-light/25")}>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => replyTo(m)}
                      title={mine ? undefined : `Rispondi a ${m.author_name}`}
                      className={cn(
                        "inline-block max-w-[75%] truncate px-2 py-0.5 font-display text-[12px] font-bold tracking-[0.04em] text-white",
                        m.author_role === "admin" ? "bg-accent" : "bg-primary",
                      )}
                    >
                      {m.author_name}
                    </button>
                    <span className="flex shrink-0 items-center gap-2 text-[12px] italic text-muted-foreground">
                      {forMe && <span className="font-display text-[10px] not-italic uppercase tracking-[0.12em] text-gold">ti ha taggato</span>}
                      {timeAgo(m.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-[17px] leading-snug">
                    {renderTesto(m.testo, mentions, isMe).map((part, k) => (
                      <Fragment key={k}>{part}</Fragment>
                    ))}
                  </p>
                </article>
              );
            })
          )}
        </div>

        {ranked && (
          <div className="border-t border-gold bg-card">
            <p className="px-3 pt-1.5 font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {suggestions.length ? "Chi vuoi taggare? Tocca un nome" : "Nessuno da taggare"}
            </p>
            {suggestions.length > 0 && (
              <ul role="listbox" aria-label="Chi vuoi taggare?">
                {suggestions.map((p, k) => (
                  <li key={`${p.role}-${p.id ?? "admin"}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={k === pick}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(p)}
                      className={cn("flex min-h-11 w-full items-center gap-2 border-b border-line px-3 text-left last:border-b-0", k === pick && "bg-gold-light/40")}
                    >
                      <span className={cn("px-2 py-0.5 font-display text-[12px] font-bold text-white", p.role === "admin" ? "bg-accent" : "bg-primary")}>@</span>
                      <span className="text-[17px]">{p.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <form onSubmit={send} className="flex items-end gap-2 border-t border-gold p-2.5">
          <label className="sr-only" htmlFor="taverna-testo">
            Messaggio
          </label>
          <div className="relative min-w-0 flex-1 border border-border border-b-[1.5px] border-b-gold bg-card focus-within:border-accent">
            {/* sotto: lo stesso testo, con i tag colorati */}
            <div
              ref={mirror}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-3 py-2.5 text-base leading-6 text-foreground"
            >
              {renderBozza(text, tags)}
            </div>
            <textarea
              id="taverna-testo"
              rows={1}
              maxLength={600}
              value={text}
              ref={input}
              onChange={(e) => {
                setText(e.target.value);
                setCaret(e.target.selectionStart ?? e.target.value.length);
                setClosed(false);
                setPick(0);
                // se un nome taggato è stato rotto, quel tag sparisce
                setChosen((c) => c.filter((p) => findTags(e.target.value, [p]).length > 0));
              }}
              onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
              onScroll={(e) => {
                if (mirror.current) mirror.current.scrollTop = e.currentTarget.scrollTop;
              }}
              onKeyDown={(e) => {
                if (suggestions.length > 0) {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const d = e.key === "ArrowDown" ? 1 : -1;
                    setPick((v) => (v + d + suggestions.length) % suggestions.length);
                    return;
                  }
                  if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault();
                    const sel = suggestions[Math.min(pick, suggestions.length - 1)];
                    if (sel) choose(sel);
                    return;
                  }
                }
                if (e.key === "Escape") {
                  setClosed(true);
                  return;
                }
                guardTags(e);
                if (e.defaultPrevented) return;
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(e);
                }
              }}
              placeholder={area === "admin" ? "Scrivi come Admin… (@ per taggare)" : "Scrivi… (@ per taggare)"}
              className="relative block min-h-11 w-full resize-none bg-transparent px-3 py-2.5 text-base leading-6 text-transparent caret-foreground outline-none selection:bg-gold-light/60 selection:text-transparent placeholder:italic placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={busy || (!text.trim() && !suggestions.length)}
            className={cn(
              "min-h-11 min-w-[76px] px-3 font-display text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50",
              area === "admin"
                ? "bg-accent [box-shadow:inset_0_0_0_3px_var(--color-accent),inset_0_0_0_4px_var(--color-gold-light)]"
                : "bg-primary [box-shadow:inset_0_0_0_3px_var(--color-primary),inset_0_0_0_4px_var(--color-gold-light)]",
            )}
          >
            {busy ? "…" : "Invia"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
