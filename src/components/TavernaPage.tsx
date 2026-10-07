import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { TowerBackdrop } from "@/components/TowerBackdrop";
import { ErrorBox, Loading } from "@/components/ui-kit";
import { api, useTaverna, type Area } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

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
  const messages = q.data?.messages ?? [];
  const lastId = messages[messages.length - 1]?.id ?? 0;

  // quando arriva un messaggio nuovo si scende in fondo
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastId]);

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
    <AppShell area={area} eyebrow="Per tutti · user e admin" title="Taverna" backdrop={<TowerBackdrop />}>
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
            messages.map((m) => (
              <article key={m.id} className="border-b border-line px-3 py-2.5 last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-block max-w-[75%] truncate px-2 py-0.5 font-display text-[12px] font-bold tracking-[0.04em] text-white",
                      m.author_role === "admin" ? "bg-accent" : "bg-primary",
                    )}
                  >
                    {m.author_name}
                  </span>
                  <span className="shrink-0 text-[12px] italic text-muted-foreground">{timeAgo(m.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-[17px] leading-snug">{m.testo}</p>
              </article>
            ))
          )}
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-gold p-2.5">
          <label className="sr-only" htmlFor="taverna-testo">
            Messaggio
          </label>
          <textarea
            id="taverna-testo"
            rows={1}
            maxLength={600}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(e);
              }
            }}
            placeholder={area === "admin" ? "Scrivi come Admin…" : "Scrivi un messaggio…"}
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
