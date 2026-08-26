import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionTitle, StatusTag } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { COLLABORATORS } from "@/data/demo";
import { CheckCircle2, ChevronLeft, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin/collaboratori/$id/disponibilita")({
  component: CollaboratoreDisponibilita,
});

function CollaboratoreDisponibilita() {
  const { id } = Route.useParams();
  const { events, availability, setAvailabilityResponse } = useDemo();
  const collaborator = COLLABORATORS.find((c) => c.id === id);

  if (!collaborator) {
    return (
      <AppShell area="admin" title="Collaboratore">
        <section className="px-3 pt-6">
          <p className="text-sm text-muted-foreground">Collaboratore non trovato.</p>
          <Link to="/admin/collaboratori" className="eyebrow text-accent">
            Torna alla lista
          </Link>
        </section>
      </AppShell>
    );
  }

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori">
      <section className="px-3 pt-6">
        <p className="eyebrow text-accent">Disponibilità¹²</p>
        <h2 className="mt-1 font-serif text-3xl text-primary">{collaborator.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{collaborator.role}</p>
      </section>

      <section className="mt-6 px-3">
        <div className="border border-border bg-surface p-4">
          <p className="text-sm text-foreground">
            Gestisci le risposte agli eventi per questo collaboratore.
          </p>
        </div>
      </section>

      <section className="mt-6 px-3">
        <SectionTitle>Tutti gli eventi</SectionTitle>
        <ul className="border-t border-border">
          {sorted.map((e) => {
            const response = availability[e.id];
            return (
              <li key={e.id} className="border-b border-border py-3">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    to="/admin/eventi/$code"
                    params={{ code: e.code }}
                    className="flex min-w-0 flex-1 items-center gap-3 active:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">{e.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {e.place} · {e.timeStart}–{e.timeEnd} · {e.date}
                      </span>
                    </span>
                  </Link>
                  <StatusTag status={e.status} />
                  {response === undefined ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => setAvailabilityResponse(e.id, "yes")}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-accent active:bg-muted"
                        aria-label="Conferma disponibilità"
                        title="Conferma"
                      >
                        <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                      <button
                        onClick={() => setAvailabilityResponse(e.id, "no")}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground active:bg-muted"
                        aria-label="Non confermare"
                        title="Non confermare"
                      >
                        <XCircle className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`eyebrow shrink-0 ${
                        response === "yes" ? "text-accent" : "text-muted-foreground"
                      }`}
                    >
                      {response === "yes" ? "Confermato" : "Non confermato"}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
