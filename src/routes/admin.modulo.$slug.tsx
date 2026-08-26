import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button, DemoNote, Hourglass, SectionTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/modulo/$slug")({
  head: () => ({
    meta: [
      { title: "Modulo in preparazione — Malastrana" },
      {
        name: "description",
        content:
          "Sezione del gestionale Malastrana ancora in preparazione nel prototipo UI.",
      },
      { property: "og:title", content: "Modulo in preparazione — Malastrana" },
      {
        property: "og:description",
        content: "Placeholder editoriale per moduli futuri.",
      },
    ],
  }),
  component: ModuloPage,
});

const LABELS: Record<string, string> = {
  magazzino: "Magazzino",
  bolle: "Bolle di carico",
  documenti: "Documenti",
  report: "Report",
  notifiche: "Notifiche",
  impostazioni: "Impostazioni",
};

function ModuloPage() {
  const { slug } = Route.useParams();
  const label = LABELS[slug] ?? slug;

  return (
    <AppShell area="admin" title={label} back="/admin/altro">
      <section className="flex flex-col items-center border-b border-border bg-surface px-6 py-16 text-center">
        <Hourglass className="h-10 w-10 text-primary" />
        <p className="eyebrow mt-6 text-accent">In preparazione</p>
        <h2 className="mt-2 font-serif text-3xl text-primary">{label}</h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Questa sezione fa parte della struttura prevista del gestionale, ma non è
          ancora attiva in questo prototipo UI.
        </p>
      </section>

      <section className="mt-8 px-3">
        <SectionTitle>Cosa conterrà</SectionTitle>
        <ul className="border-t border-border text-sm text-foreground">
          <li className="border-b border-border py-3">Elenchi e schede di dettaglio</li>
          <li className="border-b border-border py-3">Filtri e ricerca per hashtag</li>
          <li className="border-b border-border py-3">Azioni operative sul cast</li>
        </ul>
        <div className="mt-5">
          <Button full variant="outline" disabled>
            Attiva modulo (non disponibile)
          </Button>
        </div>
      </section>

      <div className="mt-8 px-3">
        <DemoNote />
      </div>
    </AppShell>
  );
}
