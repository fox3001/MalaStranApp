import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GuidaPage } from "@/components/HelpButton";

export const Route = createFileRoute("/admin/guida")({ component: () => (
  <AppShell area="admin" eyebrow="Guida" title="Come funziona" back="/admin">
    <GuidaPage area="admin" />
  </AppShell>
) });
