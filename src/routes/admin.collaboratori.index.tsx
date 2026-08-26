import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar, DemoNote, Tags } from "@/components/ui-kit";
import { COLLABORATORS } from "@/data/demo";

export const Route = createFileRoute("/admin/collaboratori/")({
  head: () => ({
    meta: [
      { title: "Collaboratori — Regia Malastrana" },
      {
        name: "description",
        content:
          "Rubrica dimostrativa dei collaboratori con ricerca per nome e hashtag di competenza.",
      },
      { property: "og:title", content: "Collaboratori — Regia Malastrana" },
      {
        property: "og:description",
        content: "Rubrica collaboratori del prototipo Malastrana.",
      },
      { property: "og:url", content: "/admin/collaboratori" },
    ],
    links: [{ rel: "canonical", href: "/admin/collaboratori" }],
  }),
  component: AdminCollaboratori,
});

function AdminCollaboratori() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = COLLABORATORS.filter(
    (c) =>
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.role.toLowerCase().includes(query) ||
      c.skills.some((s) => s.toLowerCase().includes(query.replace("#", ""))),
  );

  return (
    <AppShell area="admin" title="Collaboratori">
      <section className="px-3 pt-5">
        <h2 className="font-serif text-2xl text-foreground">Rubrica</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cerca per nome, ruolo o hashtag di competenza (es. #fuoco).
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca…"
          className="mt-4 min-h-12 w-full border border-border-strong bg-surface px-3 text-sm text-foreground"
        />
      </section>

      <ul className="mt-5 border-t border-border">
        {list.map((c) => (
          <li key={c.id}>
            <Link
              to="/admin/collaboratori/$id"
              params={{ id: c.id }}
              className="flex gap-3 border-b border-border px-3 py-3.5 active:bg-muted"
            >
              <Avatar name={c.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif text-base text-foreground">
                  {c.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {c.role}
                </span>
                <span className="mt-1.5 block">
                  <Tags tags={c.skills.slice(0, 4)} />
                </span>
              </span>
              <span className="eyebrow shrink-0 text-accent">{c.state}</span>
            </Link>
          </li>
        ))}
        {list.length === 0 && (
          <li className="px-3 py-6 text-sm text-muted-foreground">
            Nessun collaboratore trovato.
          </li>
        )}
      </ul>

      <div className="mt-8 px-3">
        <DemoNote />
      </div>
    </AppShell>
  );
}
