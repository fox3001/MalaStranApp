import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle } from "@/components/ui-kit";
import { NOTIFICATIONS } from "@/data/demo";

export const Route = createFileRoute("/u/notifiche")({
  component: UserNotifications,
});

function UserNotifications() {
  return (
    <AppShell area="u" title="" back="/u">
      <section className="pt-6">
        <p className="eyebrow text-accent">Aggiornamenti</p>
        <h2 className="mt-1 font-serif text-2xl text-primary">Notifiche</h2>
        <p className="mt-1 text-sm text-muted-foreground">Conferme, richieste e novita sugli eventi</p>
      </section>

      <section className="mt-6">
        <SectionTitle>Recenti</SectionTitle>
        {NOTIFICATIONS.length === 0 ? (
          <Card>
            <p className="py-1 text-sm text-muted-foreground">Nessuna notifica al momento.</p>
          </Card>
        ) : (
          <Card>
            <ul>
              {NOTIFICATIONS.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <span className="min-w-0 text-sm text-foreground">{n.text}</span>
                  <span className="eyebrow shrink-0 pt-0.5 text-muted-foreground">{n.when}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
