import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button, Card, DemoNote, Field, SectionTitle } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { formatDate } from "@/data/demo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/bolla/$code")({
  head: () => ({
    meta: [
      { title: "Bolla di carico — Malastrana" },
      {
        name: "description",
        content:
          "Bolla di carico dimostrativa: check presenza, resi, danni e note per ogni voce.",
      },
      { property: "og:title", content: "Bolla di carico — Malastrana" },
      {
        property: "og:description",
        content: "Checklist materiali del prototipo Malastrana.",
      },
    ],
  }),
  component: BollaPage,
});

function BollaPage() {
  const { code } = Route.useParams();
  const { events, load, updateLoadRow, timeline } = useDemo();
  const event = events.find((e) => e.code === code);

  const done = load.filter((r) => r.present).length;

  return (
    <AppShell area="user" title="Bolla di carico" back="/u/eventi">
      {/* Header panel */}
      <Card className="border-primary/20">
        <p className="eyebrow text-primary">Documento di scena</p>
        <h2 className="mt-2 font-serif text-xl text-foreground">
          {event ? event.name : "Evento demo"}
        </h2>
        <div className="mt-4">
          <Field label="Codice">{code}</Field>
          <Field label="Data">{event ? formatDate(event.date) : "—"}</Field>
          <Field label="Luogo">{event?.place ?? "—"}</Field>
          <Field label="Stato check">
            {done} / {load.length} voci verificate
          </Field>
        </div>
      </Card>

      {/* Material list */}
      <section className="mt-6">
        <SectionTitle>Materiale assegnato</SectionTitle>
        <div className="space-y-3">
          {load.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-serif text-base text-foreground">{r.name}</p>
                  <p className="eyebrow mt-0.5 text-muted-foreground">
                    {r.code} · q.tà {r.qty}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Check
                  label="Presente"
                  active={r.present}
                  onClick={() =>
                    updateLoadRow(
                      r.id,
                      { present: !r.present },
                      `${r.name}: presenza ${!r.present ? "confermata" : "annullata"}`,
                    )
                  }
                />
                <Check
                  label="Reso"
                  active={r.returned}
                  onClick={() =>
                    updateLoadRow(
                      r.id,
                      { returned: !r.returned },
                      `${r.name}: reso ${!r.returned ? "registrato" : "annullato"}`,
                    )
                  }
                />
                <Check
                  label="Danneggiato"
                  danger
                  active={r.damaged}
                  onClick={() =>
                    updateLoadRow(
                      r.id,
                      { damaged: !r.damaged },
                      `${r.name}: danno ${!r.damaged ? "segnalato" : "rimosso"}`,
                    )
                  }
                />
              </div>

              <input
                value={r.comment}
                placeholder="Commento (opzionale)"
                onChange={(e) =>
                  updateLoadRow(r.id, { comment: e.target.value }, `${r.name}: nota aggiornata`)
                }
                className="mt-3 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </Card>
          ))}
        </div>

        <div className="mt-5">
          <Button full variant="outline" disabled>
            Invia bolla all'ufficio (non attivo)
          </Button>
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-8">
        <SectionTitle>Cronologia locale</SectionTitle>
        {timeline.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">
              Nessuna modifica registrata su questo dispositivo.
            </p>
          </Card>
        ) : (
          <Card>
            <ul>
              {timeline.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <span className="min-w-0 text-sm text-foreground">{t.text}</span>
                  <span className="eyebrow shrink-0 pt-0.5 text-muted-foreground">{t.at}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <div className="mt-8">
        <DemoNote />
      </div>
    </AppShell>
  );
}

function Check({
  label,
  active,
  danger,
  onClick,
}: {
  label: string;
  active: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "eyebrow min-h-10 rounded-lg border px-4 transition-all active:scale-[0.98]",
        active
          ? danger
            ? "border-destructive bg-destructive text-destructive-foreground"
            : "border-accent bg-accent text-accent-foreground"
          : "border-border-strong bg-surface text-muted-foreground active:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
