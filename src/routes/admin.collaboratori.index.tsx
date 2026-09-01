import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar, Tags } from "@/components/ui-kit";
import { COLLABORATORS } from "@/data/demo";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const ADMIN_TOKEN_KEY = "malastrana-admin-token";

type RealUser = {
  id: number;
  nome: string;
  cognome: string;
  username: string;
  email: string | null;
  ruolo?: string;
  role?: string;
  created_at?: string;
};

export const Route = createFileRoute("/admin/collaboratori/")({
  head: () => ({
    meta: [
      { title: "Collaboratori — Regia Malastrana" },
      {
        name: "description",
        content:
          "Rubrica dei collaboratori con ricerca per nome e hashtag di competenza.",
      },
      { property: "og:title", content: "Collaboratori — Regia Malastrana" },
      {
        property: "og:description",
        content: "Rubrica collaboratori del gestionale Malastrana.",
      },
      { property: "og:url", content: "/admin/collaboratori" },
    ],
    links: [{ rel: "canonical", href: "/admin/collaboratori" }],
  }),
  component: AdminCollaboratori,
});

function AdminCollaboratori() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadUsers() {
    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error || "Impossibile caricare i collaboratori");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossibile caricare i collaboratori");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      setMessage("Sessione amministratore non disponibile.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, cognome, email: email || undefined, password: password || undefined }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error || "Impossibile creare il collaboratore");
      setMessage(`Collaboratore creato. Username: ${data.user.username}`);
      setNome("");
      setCognome("");
      setEmail("");
      setPassword("");
      setShowCreate(false);
      await loadUsers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossibile creare il collaboratore");
    } finally {
      setSaving(false);
    }
  }

  const query = q.trim().toLowerCase();
  const realList = users.filter(
    (c) =>
      !query ||
      `${c.nome} ${c.cognome}`.toLowerCase().includes(query) ||
      c.username.toLowerCase().includes(query) ||
      (c.email || "").toLowerCase().includes(query),
  );

  return (
    <AppShell area="admin" title="Collaboratori">
      <section className="px-3 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-foreground">Rubrica</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cerca per nome, username o email.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowCreate((value) => !value);
              setMessage("");
            }}
            className="shrink-0 rounded-lg border border-accent bg-accent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent-foreground active:scale-[0.98]"
          >
            {showCreate ? "Chiudi" : "Nuovo"}
          </button>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca…"
          className="mt-4 min-h-12 w-full border border-border-strong bg-surface px-3 text-sm text-foreground"
        />
      </section>

      {showCreate && (
        <section className="mt-5 px-3">
          <form onSubmit={createUser} className="border border-border-strong bg-surface p-5 shadow-[var(--shadow-card)]">
            <p className="eyebrow text-accent">Nuovo collaboratore</p>
            <h3 className="mt-1 font-serif text-xl text-primary">Crea il primo account</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-foreground">
                Nome
                <input required value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-background px-3" />
              </label>
              <label className="text-sm text-foreground">
                Cognome
                <input required value={cognome} onChange={(e) => setCognome(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-background px-3" />
              </label>
              <label className="text-sm text-foreground sm:col-span-2">
                Email <span className="text-muted-foreground">(opzionale)</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-background px-3" />
              </label>
              <label className="text-sm text-foreground sm:col-span-2">
                Password <span className="text-muted-foreground">(opzionale: se vuota usa il cognome)</span>
                <input type="password" minLength={3} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-background px-3" />
              </label>
            </div>
            <button disabled={saving} type="submit" className="mt-4 min-h-11 w-full bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">
              {saving ? "Creazione…" : "Crea collaboratore"}
            </button>
          </form>
        </section>
      )}

      {message && <p className="mt-4 px-3 text-sm text-accent">{message}</p>}

      <ul className="mt-5 border-t border-border">
        {loading ? (
          <li className="px-3 py-6 text-sm text-muted-foreground">Caricamento collaboratori…</li>
        ) : realList.length > 0 ? (
          realList.map((c) => (
            <li key={c.id}>
              <Link
                to="/admin/collaboratori/$id"
                params={{ id: String(c.id) }}
                className="flex gap-3 border-b border-border px-3 py-3.5 active:bg-muted"
              >
                <Avatar name={`${c.nome} ${c.cognome}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-base text-foreground">
                    {c.nome} {c.cognome}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    @{c.username}{c.email ? ` · ${c.email}` : ""}
                  </span>
                </span>
                <span className="eyebrow shrink-0 text-accent">ATTIVO</span>
              </Link>
            </li>
          ))
        ) : (
          <>
            <li className="px-3 py-6 text-sm text-muted-foreground">
              Nessun account collaboratore creato.
            </li>
            {users.length === 0 && COLLABORATORS.length > 0 && (
              <li className="border-t border-border px-3 py-4 text-xs text-muted-foreground">
                I collaboratori mostrati nelle altre sezioni sono ancora dati demo e non sono account reali.
              </li>
            )}
          </>
        )}
      </ul>
    </AppShell>
  );
}
