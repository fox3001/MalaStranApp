import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { NotificationList } from "@/components/NotificationList";
import { PageTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/u/notifiche")({ component: () => (
  <AppShell area="user" title="Notifiche" back="/u">
    <PageTitle eyebrow="Aggiornamenti" title="Notifiche" subtitle="Richieste, conferme e novità sui tuoi eventi." />
    <div className="mt-5">
      <NotificationList area="user" />
    </div>
  </AppShell>
) });
