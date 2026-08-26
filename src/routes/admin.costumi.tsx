import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { Search, Shirt, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/costumi")({
  component: CostumiLista,
});

type SizeFilter = string;

function CostumiLista() {
  const { costumes } = useDemo();
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<SizeFilter>("tutte");
  const categories = useMemo(
    () => Array.from(new Set(costumes.map((c) => c.category))),
    [costumes],
  );

  const filtered = useMemo(() => {
    return costumes.filter((c) => {
      const matchQuery = query === "" || c.name.toLowerCase().includes(query.toLowerCase());
      const matchSize = size === "tutte" || c.category === size;
      return matchQuery && matchSize;
    });
  }, [costumes, query, size]);

  return (
    <AppShell area="admin" title="Costumi" back="/admin">
      <section className="px-3 pt-6">
        <p className="eyebrow text-accent">Magazzino</p>
        <h2 className="mt-1 font-serif text-3xl text-primary">Costumi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ricerca, filtri e accesso rapido alle schede.
        </p>
      </section>

      <section className="mt-6 px-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per nome..."
              className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as SizeFilter)}
              className="rounded-md border border-border bg-surface px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="tutte">Tutte</option>
              {categories.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
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
          Lista costumi
        </SectionTitle>
        {filtered.length === 0 ? (
          <p className="border-t border-border py-3 text-sm text-muted-foreground">
            Nessun costume trovato con questi criteri.
          </p>
        ) : (
          <ul className="border-t border-border">
            {filtered.map((c) => (
              <li key={c.id}>
                <div
                  className="flex items-center justify-between gap-3 border-b border-border py-3 active:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Shirt className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">{c.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {c.category}
                      </span>
                    </span>
                  </div>
                  <span className="eyebrow shrink-0 text-accent">{c.verification}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
