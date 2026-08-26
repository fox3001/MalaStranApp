import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui-kit";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/u/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <AppShell area="u" title="">
      <section className="pt-6">
        <p className="eyebrow text-accent">Comunicazione interna</p>
        <h2 className="mt-1 font-serif text-2xl text-primary">Chat interna</h2>
      </section>
      <section className="mt-6">
        <Card>
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <MessageCircle className="h-8 w-8 text-accent" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">
              La chat interna tra collaboratori e ufficio arrivera presto.
            </p>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
