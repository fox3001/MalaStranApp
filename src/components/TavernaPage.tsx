import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { FlockButton, TowerBackdrop } from "@/components/TowerBackdrop";
import { ErrorBox, Loading } from "@/components/ui-kit";
import { api, useTaverna, useTavernaPeople, type Area, type TavernaPerson } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

/** Trova la parola "@qualcosa" che si sta scrivendo proprio dove c'è il cursore. */
function mentionAt(text: string, caret: number): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const at = before.lastIndexOf("@");
  if (at < 0) return null;
  if (at > 0 && !/\s/.test(before[at - 1] ?? "")) return null; // la @ deve stare all'inizio di una parola
  const query = before.slice(at + 1);
  if (query.length > 30 || /\n/.test(query)) return null;
  return { start: at, query };
}

/** Spezza il testo e colora i "@Nome" delle persone conosciute. */
function renderTesto(testo: string, people: TavernaPerson[], meName: string | undefined): ReactNode[] {
  const names = [...people].sort((a, b) => b.name.length - a.name.length);
  const low = testo.toLowerCase();
  const out: ReactNode[] = [];
  let i = 0;
  let plain = "";
  while (i < testo.length) {
    if (testo[i] === "@" && (i === 0 || /\s/.test(testo[i - 1] ?? ""))) {
      const p = names.find((n) => low.startsWith("@" + n.name.toLowerCase(), i));
      if (p) {
        if (plain) out.push(plain);
        plain = "";
        const mine = meName && p.name.toLowerCase() === meName.toLowerCase();
        out.push(
          <span
            key={i}
            className={cn(
              "font-bold",
              p.role === "admin" ? "text-accent" : "text-primary",
              mine && "bg-gold-light/70 px-0.5",
            )}
          >
            @{p.name}
          </span>,
        );
        i += p.name.length + 1;
        continue;
      }
    }
    plain += testo[i];
    i++;
  }
  if (plain) out.push(plain);
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
  const peopleQ = useTavernaPeople(area);
  const people = useMemo(() => peopleQ.data?.people ?? [], [peopleQ.data]);
  const meName = q.data?.me_name;
  const [caret, setCaret] = useState(0);
  const [pick, setPick] = useState(0);
  const [closed, setClosed] = useState(false);
  // dove rimettere il cursore subito dopo aver inserito un "@Nome "
  const pendingCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const pos = pendingCaret.current;
    if (pos === null || !input.current) return;
    pendingCaret.current = null;
    input.current.focus();
    input.current.setSelectionRange(pos, pos);
  }, [text]);
  const mention = mentionAt(text, caret);
  const suggestions = mention && !closed
    ? people
        .filter((p) => p.name.toLowerCase() !== meName?.toLowerCase())
        .filter((p) => {
          const ql = mention.query.toLowerCase();
          const nl = p.name.toLowerCase();
          return nl.startsWith(ql) || nl.split(" ").some((w) => w.startsWith(ql));
        })
        .slice(0, 6)
    : [];
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
  const [showWriters, setShowWriters] = useState(false);

  // quando arriva un messaggio nuovo si scende in fondo
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastId, q.isLoading, people.length]);

  // mette "@Nome " al posto di quello che si stava scrivendo
  function choose(p: TavernaPerson) {
    if (!mention) return;
    const tag = `@${p.name} `;
    const next = text.slice(0, mention.start) + tag + text.slice(caret);
    const pos = mention.start + tag.length;
    pendingCaret.current = pos;
    setText(next.slice(0, 600));
    setCaret(pos);
    setPick(0);
  }

  // toccando il nome di qualcuno si risponde direttamente a lui
  function replyTo(name: string) {
    if (name.toLowerCase() === meName?.toLowerCase()) return;
    const tag = `@${name} `;
    const next = text.startsWith(tag) ? text : (tag + text).slice(0, 600);
    pendingCaret.current = next.length;
    setText(next);
    setCaret(next.length);
    setClosed(true);
    if (next === text) {
      input.current?.focus();
      input.current?.setSelectionRange(next.length, next.length);
    }
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    const testo = text.trim();
    if (!testo || busy) return;
    setBusy(true);
    try {
      await api(area, "/taverna", { method: "POST", body: { testo } });
      setText("");
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
          label={showWriters ? `${writers} condor: chi ha scritto nelle ultime 12 ore, admin compreso. Tocca per tornare a 20` : "Mostra un condor per chi ha scritto nelle ultime 12 ore"}
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
              const forMe = !!meName && m.author_name.toLowerCase() !== meName.toLowerCase() && m.testo.toLowerCase().includes("@" + meName.toLowerCase());
              return (
                <article key={m.id} className={cn("border-b border-line px-3 py-2.5 last:border-b-0", forMe && "border-l-4 border-l-gold bg-gold-light/25")}>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => replyTo(m.author_name)}
                      title={`Rispondi a ${m.author_name}`}
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
                    {renderTesto(m.testo, people, meName).map((part, k) => <Fragment key={k}>{part}</Fragment>)}
                  </p>
                </article>
              );
            })
          )}
        </div>

        {suggestions.length > 0 && (
          <ul role="listbox" aria-label="Chi vuoi taggare?" className="border-t border-gold bg-card">
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
        <form onSubmit={send} className="flex gap-2 border-t border-gold p-2.5">
          <label className="sr-only" htmlFor="taverna-testo">
            Messaggio
          </label>
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
            }}
            onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
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
                if (e.key === "Escape") {
                  setClosed(true);
                  return;
                }
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(e);
              }
            }}
            placeholder={area === "admin" ? "Scrivi come Admin… (@ per taggare)" : "Scrivi… (@ per taggare)"}
            className="min-h-11 flex-1 resize-none border border-border border-b-[1.5px] border-b-gold bg-card px-3 py-2.5 text-base outline-none placeholder:italic focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
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
