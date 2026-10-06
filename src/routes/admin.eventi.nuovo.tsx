import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EMPTY_EVENT, EventForm, type EventInput } from "@/components/EventForm";
import { BollaFilePicker } from "@/components/BollaImport";
import { Card, PageTitle, SectionTitle } from "@/components/ui-kit";
import type { ParsedRow } from "@/lib/bollaParser";
import { api, type MalEvent } from "@/lib/api";

export const Route = createFileRoute("/admin/eventi/nuovo")({ component: NuovoEvento });

function NuovoEvento() {
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [bolla, setBolla] = useState<ParsedRow[]>([]);

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
      <PageTitle eyebrow="Eventi" title="Nuovo evento" subtitle="Dopo il salvataggio potrai invitare gli user e preparare la bolla di carico." />
      <div className="mt-6">
        <EventForm
          initial={EMPTY_EVENT}
          submitLabel={bolla.length ? `Crea evento con la bolla (${bolla.length} voci)` : "Crea evento"}
          busy={busy}
          onSubmit={create}
          extra={
            <Card>
              <SectionTitle>Bolla di carico</SectionTitle>
              <p className="mb-3 text-sm text-muted-foreground">Carica il file della bolla (PDF o Excel): verrà letta e divisa nei suoi gruppi. Puoi anche farlo dopo, dalla scheda Bolla.</p>
              <BollaFilePicker value={bolla} onChange={setBolla} />
            </Card>
          }
        />
      </div>
    </AppShell>
  );
}
