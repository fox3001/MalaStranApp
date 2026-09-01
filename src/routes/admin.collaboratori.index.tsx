import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar, Tags } from "@/components/ui-kit";
import { getAdminCollaborators } from "@/lib/api";

export const Route = createFileRoute("/admin/collaboratori/")({
  head: () => ({
    meta: [
      { title: "Collaboratori — Regia Malastrana" },
      { name: "description", content: "Rubrica collaboratori con ricerca per nome e hashtag di competenza." },
    ],
  }),
  component: AdminCollaboratori,
});

type RealCollaborator = {
  id: number;
  nome: string;
  cognome: string;
  username: string;
  email: string | null;
  ruolo: string;
  created_at: string;
};

function AdminCollaboratori() {
  const [q, setQ] = useState("");
  const [collaborators, setCollaborators] = useState<RealCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getAdminCollaborators()
      .then((result) => { if (active) setCollaborators(result.users); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Impossibile caricare i collaboratori"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const query = q.trim().toLowerCase();
  const list = useMemo(() => collaborators.filter((c) => {
    if (!query) return true;
    return `${c.nome} ${c.cognome}`.toLowerCase().includes(query)
      || c.username.toLowerCase().includes(query)
      || c.email?.toLowerCase().includes(query)
      || c.ruolo.toLowerCase().includes(query);
  }), [collaborators, query]);

  return <AppShell area="admin" title="Collaboratori">
    <section className="px-3 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="font-serif text-2xl text-foreground">Rubrica</h2><p className="mt-1 text-sm text-muted-foreground">Cerca per nome, username, email o ruolo.</p></div>
        <Link to="/admin/collaboratori/nuovo" className="shrink-0 bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">+ Nuovo</Link>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca…" className="mt-4 min-h-12 w-full border border-border-strong bg-surface px-3 text-sm text-foreground" />
    </section>

    <section className="mt-5 border-t border-border">
      {loading && <p className="px-3 py-6 text-sm text-muted-foreground">Caricamento collaboratori…</p>}
      {!loading && error && <p className="px-3 py-6 text-sm text-destructive">{error}</p>}
      {!loading && !error && <ul>
        {list.map((c) => <li key={c.id}><Link to="/admin/collaboratori/$id" params={{ id: String(c.id) }} className="flex gap-3 border-b border-border px-3 py-3.5 active:bg-muted"><Avatar name={`${c.nome} ${c.cognome}`} /><span className="min-w-0 flex-1"><span className="block truncate font-serif text-base text-foreground">{c.nome} {c.cognome}</span><span className="block truncate text-xs text-muted-foreground">{c.ruolo} · {c.username}</span><span className="mt-1.5 block"><Tags tags={c.email ? [c.email] : []} /></span></span><span className="eyebrow shrink-0 text-accent">Attivo</span></Link></li>)}
        {list.length === 0 && <li className="px-3 py-6 text-sm text-muted-foreground">Nessun collaboratore trovato.</li>}
      </ul>}
    </section>
  </AppShell>;
}
