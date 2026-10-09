import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GuidaPage } from "@/components/HelpButton";

export const Route = createFileRoute("/u/guida")({ component: () => (
  <AppShell area="user" eyebrow="Guida" title="Come funziona" back="/u/profilo">
    <GuidaPage area="user" />
  </AppShell>
) });
