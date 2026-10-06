import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EMPTY_EVENT, EventForm, type EventInput } from "@/components/EventForm";
import { PageTitle } from "@/components/ui-kit";
import { api, type MalEvent } from "@/lib/api";

export const Route = createFileRoute("/admin/eventi/nuovo")({ component: NuovoEvento });

function NuovoEvento() {
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function create(v: EventInput) {
    setBusy(true);
    try {
      const d = await api<{ event: MalEvent }>("admin", "/admin/events", { method: "POST", body: v });
      toast.success(`Evento creato: ${d.event.code}`);
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
        <EventForm initial={EMPTY_EVENT} submitLabel="Crea evento" busy={busy} onSubmit={create} />
      </div>
    </AppShell>
  );
}
