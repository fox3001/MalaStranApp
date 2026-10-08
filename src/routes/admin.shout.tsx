import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { ShoutIcon } from "@/components/ShoutIcon";
import { Button, Card, Empty, ErrorBox, Loading, SectionTitle } from "@/components/ui-kit";
import { useAdminShouts, useAdminUsers, useApiMutation } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/shout")({ component: ShoutAdmin });

/** L'admin scrive uno shout a uno, più o tutti gli user; sotto, lo storico dei messaggi mandati. */
function ShoutAdmin() {
  const users = useAdminUsers();
  const history = useAdminShouts();
  const [tutti, setTutti] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [testo, setTesto] = useState("");
  const send = useApiMutation<{ testo: string; tutti: boolean; user_ids: number[] }>("admin", (body) => ({ path: "/admin/shouts", method: "POST", body }), {
    success: "Shout inviato",
    invalidate: [["shouts"]],
  });

  const active = (users.data?.users ?? []).filter((u) => u.attivo);
  const q = search.trim().toLowerCase();
  const shown = active.filter((u) => !q || `${u.nome} ${u.cognome} ${u.username}`.toLowerCase().includes(q));
  const count = tutti ? active.length : selected.length;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!testo.trim() || !count) return;
    send.mutate(
      { testo: testo.trim(), tutti, user_ids: selected },
      {
        onSuccess: () => {
          setTesto("");
          setSelected([]);
          setTutti(false);
        },
      },
    );
  }

  return (
    <AppShell area="admin" eyebrow="Messaggi agli user" title="Shout" back="/admin">
      <form onSubmit={submit} className="mt-5 grid gap-5">
        <Card className="grid gap-3">
          <SectionTitle>A chi</SectionTitle>
          <button
            type="button"
            aria-pressed={tutti}
            onClick={() => setTutti((v) => !v)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-2 border font-display text-[12px] uppercase tracking-[0.14em]",
              tutti ? "border-accent bg-accent text-white" : "border-accent bg-card text-accent",
            )}
          >
            {tutti ? `✓ A tutti (${active.length} user)` : "Manda a tutti"}
          </button>
          {!tutti && (
            <>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca uno user…"
                className="min-h-11 border border-border border-b-[1.5px] border-b-gold bg-card px-3 text-base outline-none focus:border-accent"
              />
              {users.isLoading ? (
                <Loading />
              ) : shown.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">Nessuno user trovato.</p>
              ) : (
                <ul className="max-h-64 overflow-auto">
                  {shown.map((u) => (
                    <li key={u.id} className="border-b border-border last:border-b-0">
                      <label className="flex min-h-11 items-center gap-3 text-[17px]">
                        <input
                          type="checkbox"
                          className="h-5 w-5"
                          checked={selected.includes(u.id)}
                          onChange={(e) => setSelected((s) => (e.target.checked ? [...s, u.id] : s.filter((x) => x !== u.id)))}
                        />
                        {u.nome} {u.cognome}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Card>

        <Card className="grid gap-3">
          <SectionTitle>Messaggio</SectionTitle>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Scrivi lo shout…"
            className="resize-y border border-border border-b-[1.5px] border-b-gold bg-card px-3 py-2.5 text-base outline-none placeholder:italic focus:border-accent"
          />
          <Button type="submit" disabled={!testo.trim() || !count || send.isPending}>
            <ShoutIcon className="h-4 w-4" /> {count ? `Manda a ${tutti ? "tutti" : count === 1 ? "1 user" : `${count} user`}` : "Scegli a chi mandarlo"}
          </Button>
          <p className="text-xs italic text-muted-foreground">Gli user lo trovano nella loro home e ricevono una notifica. Ogni shout finisce anche nel report mensile (Archivio).</p>
        </Card>
      </form>

      <section className="mt-6">
        <SectionTitle>Shout mandati</SectionTitle>
        {history.isLoading ? (
          <Loading />
        ) : history.isError ? (
          <ErrorBox error={history.error} onRetry={() => void history.refetch()} />
        ) : !history.data?.shouts.length ? (
          <Empty>Ancora nessuno shout.</Empty>
        ) : (
          <ul className="grid gap-3">
            {history.data.shouts.map((s) => (
              <li key={s.id} className="border border-border bg-card px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 text-[14px] text-accent">
                    <span className="font-display text-[10px] uppercase tracking-[0.14em]">A: </span>
                    {s.a_tutti ? `tutti (${s.destinatari?.length ?? 0})` : s.destinatari?.join(", ")}
                  </span>
                  <span className="shrink-0 text-[13px] italic text-muted-foreground">{s.quando}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-[17px] leading-snug">{s.testo}</p>
                <p className="mt-1 text-right text-[12px] italic text-muted-foreground">
                  letto da {s.letti ?? 0} su {s.destinatari?.length ?? 0}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
