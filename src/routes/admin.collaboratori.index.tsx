import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/ui-kit";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const ADMIN_TOKEN_KEY = "malastrana-admin-token";
const PROFILE_SKILLS = ["#attrice", "#attore", "#performer", "#fuoco", "#combattimento", "#medievale", "#pirata", "#stunt", "#trucco", "#horror", "#gestionePubblico", "#tecnico", "#luci", "#allestimenti", "#magia", "#danza", "#canto"];

type RealUser = {
  id: number; nome: string; cognome: string; username: string; email: string | null; ruolo?: string; role?: string; created_at?: string;
  telefono?: string; bio?: string; competenze?: string[]; competenzeFlag?: string[];
};

export const Route = createFileRoute("/admin/collaboratori/")({
  head: () => ({ meta: [
    { title: "Collaboratori — Regia Malastrana" },
    { name: "description", content: "Rubrica dei collaboratori reali." },
    { property: "og:title", content: "Collaboratori — Regia Malastrana" },
    { property: "og:description", content: "Rubrica collaboratori del gestionale Malastrana." },
    { property: "og:url", content: "/admin/collaboratori" },
  ], links: [{ rel: "canonical", href: "/admin/collaboratori" }] }),
  component: AdminCollaboratori,
});

function AdminCollaboratori() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [nome, setNome] = useState(""); const [cognome, setCognome] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState(""); const [bio, setBio] = useState("");
  const [competenze, setCompetenze] = useState<string[]>([]); const [competenzeFlag, setCompetenzeFlag] = useState<string[]>([]);
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");

  async function loadUsers() {
    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY); if (!token) return;
    setLoading(true);
    try { const response = await fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }); const data = await response.json().catch(() => null); if (!response.ok || !data?.success) throw new Error(data?.error || "Impossibile caricare i collaboratori"); setUsers(Array.isArray(data.users) ? data.users : []); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Impossibile caricare i collaboratori"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadUsers(); }, []);

  function toggleSkill(skill: string) { setCompetenze((current) => current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill]); setCompetenzeFlag((current) => current.filter((s) => s !== skill)); }
  function toggleFlag(skill: string) { if (!competenze.includes(skill)) setCompetenze((current) => [...current, skill]); setCompetenzeFlag((current) => current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill]); }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); const token = window.localStorage.getItem(ADMIN_TOKEN_KEY); if (!token) { setMessage("Sessione amministratore non disponibile."); return; }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ nome, cognome, email: email || undefined, password: password || undefined, telefono: telefono || undefined, bio: bio || undefined, competenze, competenzeFlag }) });
      const data = await response.json().catch(() => null); if (!response.ok || !data?.success) throw new Error(data?.error || "Impossibile creare il collaboratore");
      setMessage(`Collaboratore creato. Username: ${data.user.username}`); setNome(""); setCognome(""); setEmail(""); setPassword(""); setTelefono(""); setBio(""); setCompetenze([]); setCompetenzeFlag([]); setShowCreate(false); await loadUsers();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Impossibile creare il collaboratore"); }
    finally { setSaving(false); }
  }

  const query = q.trim().toLowerCase();
  const realList = useMemo(() => users.filter((c) => !query || `${c.nome} ${c.cognome}`.toLowerCase().includes(query) || c.username.toLowerCase().includes(query) || (c.email || "").toLowerCase().includes(query) || (c.competenze || []).some((s) => s.toLowerCase().includes(query))), [users, query]);

  return <AppShell area="admin" title="Collaboratori">
    <section className="px-3 pt-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-serif text-2xl text-foreground">Rubrica</h2><p className="mt-1 text-sm text-muted-foreground">Cerca per nome, username, email o competenza.</p></div><button type="button" onClick={() => { setShowCreate((v) => !v); setMessage(""); }} className="shrink-0 rounded-lg border border-accent bg-accent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent-foreground">{showCreate ? "Chiudi" : "Nuovo"}</button></div><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca…" className="mt-4 min-h-12 w-full border border-border-strong bg-surface px-3 text-sm text-foreground" /></section>

    {showCreate && <section className="mt-5 px-3"><form onSubmit={createUser} className="border border-border-strong bg-surface p-5 shadow-[var(--shadow-card)]">
      <p className="eyebrow text-accent">Nuovo collaboratore</p><h3 className="mt-1 font-serif text-xl text-primary">Crea account e scheda personale</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-foreground">Nome<input required value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-background px-3" /></label>
        <label className="text-sm text-foreground">Cognome<input required value={cognome} onChange={(e) => setCognome(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-background px-3" /></label>
        <label className="text-sm text-foreground">Telefono<input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-background px-3" /></label>
        <label className="text-sm text-foreground">Email <span className="text-muted-foreground">(opzionale)</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-background px-3" /></label>
        <label className="text-sm text-foreground sm:col-span-2">Password <span className="text-muted-foreground">(opzionale: se vuota usa il cognome)</span><input type="password" minLength={3} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-background px-3" /></label>
        <label className="text-sm text-foreground sm:col-span-2">Presentazione<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 w-full border border-border-strong bg-background px-3 py-2" /></label>
      </div>

      <div className="mt-5 border-t border-border pt-4"><p className="text-sm font-semibold text-foreground">Competenze</p><p className="mt-1 text-xs text-muted-foreground">Spunta le voci che appartengono al collaboratore. La bandierina indica una competenza prioritaria per la ricerca e le assegnazioni.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{PROFILE_SKILLS.map((skill) => <label key={skill} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"><input type="checkbox" checked={competenze.includes(skill)} onChange={() => toggleSkill(skill)} className="h-4 w-4 accent-[var(--accent)]" /><span className="flex-1">{skill}</span><button type="button" aria-label={`Segna ${skill} come prioritaria`} onClick={(e) => { e.preventDefault(); toggleFlag(skill); }} className={`text-lg ${competenzeFlag.includes(skill) ? "text-accent" : "text-muted-foreground/30"}`}>⚑</button></label>)}</div>
        <p className="mt-3 text-xs text-muted-foreground">Se hai premuto solo la bandierina, la competenza viene automaticamente selezionata.</p>
      </div>
      <button disabled={saving} type="submit" className="mt-5 min-h-11 w-full bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">{saving ? "Creazione…" : "Crea collaboratore"}</button>
    </form></section>}
    {message && <p className="mt-4 px-3 text-sm text-accent">{message}</p>}
    <ul className="mt-5 border-t border-border">{loading ? <li className="px-3 py-6 text-sm text-muted-foreground">Caricamento collaboratori…</li> : realList.length > 0 ? realList.map((c) => <li key={c.id}><Link to="/admin/collaboratori/$id" params={{ id: String(c.id) }} className="flex gap-3 border-b border-border px-3 py-3.5 active:bg-muted"><Avatar name={`${c.nome} ${c.cognome}`} /><span className="min-w-0 flex-1"><span className="block truncate font-serif text-base text-foreground">{c.nome} {c.cognome}</span><span className="block truncate text-xs text-muted-foreground">@{c.username}{c.email ? ` · ${c.email}` : ""}</span><span className="mt-1 block truncate text-xs text-accent">{(c.competenze || []).join(" ")}</span></span><span className="eyebrow shrink-0 text-accent">ATTIVO</span></Link></li>) : <li className="px-3 py-6 text-sm text-muted-foreground">Nessun account collaboratore creato.</li>}</ul>
  </AppShell>;
}
