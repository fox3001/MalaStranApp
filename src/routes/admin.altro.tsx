import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { ClipboardList, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/altro")({
  component: MaterialiLista,
});

function MaterialiLista() {
  const { gear } = useDemo();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (query === "") return gear;
    return gear.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()));
  }, [gear, query]);

  return (
    <AppShell area="admin" title="Materiali" back="/admin">
      <section className="px-3 pt-6">
        <p className="eyebrow text-accent">Magazzino</p>
        <h2 className="mt-1 font-serif text-3xl text-primary">Materiali e accessori</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ricerca rapida e accesso alle schede.
        </p>
      </section>

      <section className="mt-6 px-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per nome..."
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </section>

      <section className="mt-6 px-3">
        <SectionTitle
          action={
            <span className="eyebrow text-muted-foreground">
              {filtered.length} risultati
            </span>
          }
        >
          Lista materiali
        </SectionTitle>
        {filtered.length === 0 ? (
          <p className="border-t border-border py-3 text-sm text-muted-foreground">
            Nessun materiale trovato con questo criterio.
          </p>
        ) : (
          <ul className="border-t border-border">
            {filtered.map((g) => (
              <li key={g.id}>
                <div
                  className="flex items-center justify-between gap-3 border-b border-border py-3 active:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">{g.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {g.description}
                      </span>
                    </span>
                  </div>
                  <span className="eyebrow shrink-0 text-accent">{g.verification}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
