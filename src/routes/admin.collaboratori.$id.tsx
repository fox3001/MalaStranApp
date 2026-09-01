import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/ui-kit";
import { CheckCircle2, CircleAlert, Flag, Mail, Phone, UserRound } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const ADMIN_TOKEN_KEY = "malastrana-admin-token";
const PROFILE_SKILLS = ["#attrice", "#attore", "#performer", "#fuoco", "#combattimento", "#medievale", "#pirata", "#stunt", "#trucco", "#horror", "#gestionePubblico", "#tecnico", "#luci", "#allestimenti", "#magia", "#danza", "#canto"];

type User = { id: number; nome: string; cognome: string; username: string; email: string | null; telefono?: string; bio?: string; competenze?: string[]; competenzeFlag?: string[] };

export const Route = createFileRoute("/admin/collaboratori/$id")({ component: CollaboratoreDettaglio });

function CollaboratoreDettaglio() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  const [telefono, setTelefono] = useState(""); const [email, setEmail] = useState(""); const [bio, setBio] = useState(""); const [competenze, setCompetenze] = useState<string[]>([]); const [flags, setFlags] = useState<string[]>([]);

  async function load() {
    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY); if (!token) return;
    try { const r = await fetch(`${API_BASE_URL}/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json().catch(() => null); if (!r.ok || !d?.success) throw new Error(d?.error || "Collaboratore non trovato"); const u = d.user as User; setUser(u); setTelefono(u.telefono || ""); setEmail(u.email || ""); setBio(u.bio || ""); setCompetenze(u.competenze || []); setFlags(u.competenzeFlag || []); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Impossibile caricare il collaboratore"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [id]);

  function toggleSkill(skill: string) { setCompetenze((current) => current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill]); setFlags((current) => current.filter((s) => s !== skill)); }
  function toggleFlag(skill: string) { if (!competenze.includes(skill)) setCompetenze((current) => [...current, skill]); setFlags((current) => current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill]); }
  async function save() { const token = window.localStorage.getItem(ADMIN_TOKEN_KEY); if (!token) return; setSaving(true); setMessage(""); try { const r = await fetch(`${API_BASE_URL}/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ telefone: telefono, telefono, email, bio, competenze, competenzeFlag: flags }) }); const d = await r.json().catch(() => null); if (!r.ok || !d?.success) throw new Error(d?.error || "Salvataggio fallito"); setUser(d.user); setMessage("Scheda salvata."); } catch (e) { setMessage(e instanceof Error ? e.message : "Salvataggio fallito"); } finally { setSaving(false); } }

  if (loading) return <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori"><section className="px-3 pt-6"><p className="text-sm text-muted-foreground">Caricamento scheda…</p></section></AppShell>;
  if (!user) return <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori"><section className="px-3 pt-6"><p className="text-sm text-muted-foreground">{message || "Collaboratore non trovato."}</p></section></AppShell>;

  return <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori">
    <section className="px-3 pt-6"><p className="eyebrow text-accent">Scheda collaboratore</p><h2 className="mt-1 font-serif text-3xl text-primary">{user.nome} {user.cognome}</h2><p className="mt-1 text-sm text-muted-foreground">@{user.username}</p></section>
    <section className="mt-6 px-3"><SectionTitle>Dati personali</SectionTitle><div className="grid gap-3 border-t border-border py-3">
      <label className="text-sm">Telefono<input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-surface px-3" /></label>
      <label className="text-sm">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 min-h-11 w-full border border-border-strong bg-surface px-3" /></label>
      <label className="text-sm">Presentazione<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-1 w-full border border-border-strong bg-surface px-3 py-2" /></label>
    </div></section>
    <section className="mt-6 px-3"><SectionTitle>Competenze e voci da flaggare</SectionTitle><p className="mb-3 text-xs text-muted-foreground">Le competenze selezionate appartengono alla scheda. La bandierina identifica quelle prioritarie.</p><div className="border-t border-border">{PROFILE_SKILLS.map((skill) => { const selected = competenze.includes(skill); const flagged = flags.includes(skill); return <div key={skill} className="flex items-center gap-3 border-b border-border py-3"><label className="flex flex-1 items-center gap-3 text-sm"><input type="checkbox" checked={selected} onChange={() => toggleSkill(skill)} className="h-4 w-4" /><span>{skill}</span></label><button type="button" onClick={() => toggleFlag(skill)} aria-label={`Priorità ${skill}`} className={flagged ? "text-accent" : "text-muted-foreground/30"}><Flag className="h-4 w-4" fill={flagged ? "currentColor" : "none"} /></button>{selected ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <CircleAlert className="h-4 w-4 text-muted-foreground/40" />}</div>; })}</div></section>
    {message && <p className="mt-4 px-3 text-sm text-accent">{message}</p>}<div className="mt-5 px-3"><button type="button" disabled={saving} onClick={save} className="min-h-11 w-full bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">{saving ? "Salvataggio…" : "Salva scheda"}</button></div>
    <section className="mt-6 px-3"><SectionTitle>Contatti</SectionTitle><div className="grid gap-2 border-t border-border py-3 text-sm"><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" />{telefono || "Telefono non inserito"}</p><p className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" />{email || "Email non inserita"}</p><p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-accent" />Account reale · ID {user.id}</p></div></section>
  </AppShell>;
}
