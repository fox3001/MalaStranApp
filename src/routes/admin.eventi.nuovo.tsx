import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/ui-kit";
import { CalendarDays, Clock, MapPin, Search, X, UserRound, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/eventi/nuovo")({
  component: EventoNuovo,
});

function EventoNuovo() {
  const { collaborators } = useDemo();
  const [form, setForm] = useState({
    name: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    place: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [proposedIds, setProposedIds] = useState<string[]>([]);

  const canSubmit = form.name && form.date && form.timeStart && form.timeEnd && form.place;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return collaborators.filter((c) => {
      const haystack = [
        c.name,
        c.role,
        c.bio,
        ...c.skills,
        ...c.skillsDetail.map((s) => s.name),
        ...c.proposedSkills,
        ...c.personalCostumes.flatMap((pc) => [pc.name, pc.category, ...pc.tags]),
        ...c.personalPhotos.flatMap((ph) => [ph.caption || "", ...ph.tags]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [collaborators, searchQuery]);

  const proposedCollaborators = collaborators.filter((c) => proposedIds.includes(c.id));

  function addProposed(id: string) {
    if (!proposedIds.includes(id)) {
      setProposedIds([...proposedIds, id]);
      setSearchQuery("");
    }
  }

  function removeProposed(id: string) {
    setProposedIds(proposedIds.filter((pid) => pid !== id));
  }

  return (
    <AppShell area="admin" title="Nuovo evento" back="/admin/eventi">
      <section className="px-3 pt-6">
        <p className="eyebrow text-accent">Creazione</p>
        <h2 className="mt-1 font-serif text-3xl text-primary">Nuovo evento</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Inserisci i dati base e proponi i collaboratori per la squadra.
        </p>
      </section>

      <section className="mt-6 px-3">
        <SectionTitle>Dati evento</SectionTitle>
        <div className="grid gap-3 border-t border-border pt-3">
          <Field icon={CalendarDays} label="Nome evento">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Es. Saggio di danza 2026"
            />
          </Field>
          <Field icon={CalendarDays} label="Data">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field icon={Clock} label="Ora inizio">
              <input
                type="time"
                value={form.timeStart}
                onChange={(e) => setForm({ ...form, timeStart: e.target.value })}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field icon={Clock} label="Ora fine">
              <input
                type="time"
                value={form.timeEnd}
                onChange={(e) => setForm({ ...form, timeEnd: e.target.value })}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          </div>
          <Field icon={MapPin} label="Luogo">
            <input
              value={form.place}
              onChange={(e) => setForm({ ...form, place: e.target.value })}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Es. Teatro Comunale"
            />
          </Field>
        </div>
      </section>

      {/* Collaborator search */}
      <section className="mt-6 px-3">
        <SectionTitle>Cerca collaboratori</SectionTitle>
        <p className="mb-3 text-sm text-muted-foreground">
          Cerca tra tutti i collaboratori per nome, competenze, costumi, tag o foto. Clicca su un risultato per aggiungerlo alla squadra proposta.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Es. #pirata, combattimento, Elena, medievale..."
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Cancella ricerca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {searchQuery.trim() && (
          <div className="mt-4">
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun collaboratore trovato.</p>
            ) : (
              <ul className="space-y-2">
                {searchResults.map((c) => {
                  const alreadyProposed = proposedIds.includes(c.id);
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => addProposed(c.id)}
                        disabled={alreadyProposed}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                          alreadyProposed
                            ? "border-border bg-muted/50 opacity-60"
                            : "border-border bg-surface hover:border-accent hover:bg-accent/5 active:scale-[0.99]",
                        )}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <UserRound className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                          {c.skillsDetail.length > 0 && (
                            <p className="mt-0.5 truncate text-[11px] text-accent">
                              {c.skillsDetail.map((s) => s.name).join(" · ")}
                            </p>
                          )}
                          {c.personalCostumes.length > 0 && (
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              Costumi: {c.personalCostumes.map((pc) => pc.name).join(", ")}
                            </p>
                          )}
                        </div>
                        {alreadyProposed ? (
                          <span className="shrink-0 text-xs font-medium text-muted-foreground">Già aggiunto</span>
                        ) : (
                          <span className="shrink-0 text-xs font-medium text-accent">+ Aggiungi</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Proposed team */}
      <section className="mt-6 px-3">
        <SectionTitle>Squadra proposta</SectionTitle>
        {proposedCollaborators.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun collaboratore ancora aggiunto. Usa la ricerca sopra per proporre la squadra.</p>
        ) : (
          <ul className="space-y-2">
            {proposedCollaborators.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <UserRound className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                </div>
                <button
                  onClick={() => removeProposed(c.id)}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Rimuovi"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 px-3">
        <div className="border border-border bg-surface p-4">
          <p className="text-sm text-foreground">
            Dopo aver creato l'evento, i collaboratori proposti riceveranno la richiesta di disponibilità.
          </p>
          <button
            disabled={!canSubmit}
            className={`mt-3 inline-flex min-h-9 items-center gap-2 border px-3 text-xs font-semibold uppercase tracking-[0.08em] ${
              canSubmit
                ? "border-primary bg-primary text-white"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            <Plus className="h-4 w-4" />
            Crea evento {proposedCollaborators.length > 0 && `(${proposedCollaborators.length} proposti)`}
          </button>
        </div>
      </section>
    </AppShell>
  );
}

function Field({
  icon: any,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  const Icon = icon;
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        <p className="eyebrow text-xs text-muted-foreground">{label}</p>
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
