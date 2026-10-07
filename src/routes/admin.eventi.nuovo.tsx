import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EMPTY_EVENT, EventForm, type EventInput } from "@/components/EventForm";
import { BollaFilePicker } from "@/components/BollaImport";
import { InvitePicker } from "@/components/InvitePicker";
import { Card, PageTitle, SectionTitle } from "@/components/ui-kit";
import type { ParsedRow } from "@/lib/bollaParser";
import { api, type MalEvent } from "@/lib/api";

export const Route = createFileRoute("/admin/eventi/nuovo")({ component: NuovoEvento });

function NuovoEvento() {
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [bolla, setBolla] = useState<ParsedRow[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [tlIds, setTlIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  async function create(v: EventInput) {
    setBusy(true);
    try {
      const d = await api<{ event: MalEvent }>("admin", "/admin/events", { method: "POST", body: v });
      if (bolla.length) {
        try {
          for (let i = 0; i < bolla.length; i += 200) {
            await api("admin", `/admin/events/${d.event.code}/load-rows`, { method: "POST", body: { rows: bolla.slice(i, i + 200) } });
          }
          toast.success(`Evento creato con la bolla di ${bolla.length} voci`);
        } catch (err) {
          toast.error(`Evento creato, ma la bolla non è stata caricata: ${err instanceof Error ? err.message : "errore"}. Caricala dalla scheda Bolla.`);
        }
      } else toast.success(`Evento creato: ${d.event.code}`);
      if (selected.length) {
        try {
          const r = await api<{ skipped?: number }>("admin", `/admin/events/${d.event.code}/participants`, {
            method: "POST",
            body: { user_ids: selected, tl_ids: tlIds.filter((t) => selected.includes(t)) },
          });
          toast.success(`Richiesta di disponibilità inviata a ${selected.length - (r.skipped ?? 0)} user`);
        } catch (err) {
          toast.error(`Evento creato, ma gli inviti non sono partiti: ${err instanceof Error ? err.message : "errore"}. Rifalli dalla scheda Persone.`);
        }
      }
      void qc.invalidateQueries({ queryKey: ["admin", "events"] });
      await router.navigate({ to: "/admin/eventi/$code", params: { code: d.event.code } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell area="admin" title="Nuovo evento" back="/admin/eventi">
      <PageTitle eyebrow="Eventi" title="Nuovo evento" subtitle="Puoi già scegliere chi invitare: chi quel giorno non c'è non viene proposto." />
      <div className="mt-6">
        <EventForm
          initial={EMPTY_EVENT}
          submitLabel={bolla.length ? `Crea evento con la bolla (${bolla.length} voci)` : "Crea evento"}
          busy={busy}
          onSubmit={create}
          extra={(v) => (
            <>
              <Card>
                <SectionTitle>Invita user</SectionTitle>
                <p className="mb-3 text-sm text-muted-foreground">Scegli chi chiamare: quando crei l'evento gli arriva la richiesta di disponibilità. Puoi farlo anche dopo, dalla scheda Persone.</p>
                <InvitePicker date={v.data} selected={selected} setSelected={setSelected} tlIds={tlIds} setTlIds={setTlIds} search={search} setSearch={setSearch} />
              </Card>
              <Card>
                <SectionTitle>Bolla di carico</SectionTitle>
                <p className="mb-3 text-sm text-muted-foreground">Carica il file della bolla (PDF o Excel): verrà letta e divisa nei suoi gruppi. Puoi anche farlo dopo, dalla scheda Bolla.</p>
                <BollaFilePicker value={bolla} onChange={setBolla} />
              </Card>
            </>
          )}
        />
      </div>
    </AppShell>
  );
}
