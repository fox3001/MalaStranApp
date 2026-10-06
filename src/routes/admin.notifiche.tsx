import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { NotificationList } from "@/components/NotificationList";
import { PageTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/notifiche")({ component: () => (
  <AppShell area="admin" title="Notifiche" back="/admin">
    <PageTitle eyebrow="Aggiornamenti" title="Notifiche" subtitle="Risposte degli user e segnalazioni dalla bolla di carico." />
    <div className="mt-5">
      <NotificationList area="admin" />
    </div>
  </AppShell>
) });
