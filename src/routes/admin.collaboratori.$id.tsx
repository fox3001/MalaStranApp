import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { changeCollaboratorPassword, getAdminCollaborator } from "@/lib/api";
import { CheckCircle2, CircleAlert, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/admin/collaboratori/$id")({ component: CollaboratoreDettaglio });

type RealUser = { id: number; nome: string; cognome: string; username: string; email: string | null; ruolo: string; created_at: string };

function CollaboratoreDettaglio() {
  const { id } = Route.useParams();
  const demo = useDemo();
  const isReal = /^\d+$/.test(id);
  const demoCollaborator = demo.collaborators.find((c) => c.id === id);
  const [realUser, setRealUser] = useState<RealUser | null>(null);
  const [loading, setLoading] = useState(isReal);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isReal) return;
    getAdminCollaborator(id).then((result) => setRealUser(result.user)).catch(() => setRealUser(null)).finally(() => setLoading(false));
  }, [id, isReal]);

  if (loading) return <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori"><section className="px-3 pt-6"><p className="text-sm text-muted-foreground">Caricamento profilo reale…</p></section></AppShell>;

  if (isReal) {
    if (!realUser) return <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori"><section className="px-3 pt-6"><p className="text-sm text-muted-foreground">Collaboratore non trovato.</p></section></AppShell>;
    async function savePassword() {
      if (password.length < 3) return setMessage("La password deve contenere almeno 3 caratteri.");
      try { await changeCollaboratorPassword(id, password); setPassword(""); setMessage("Password modificata."); } catch (err) { setMessage(err instanceof Error ? err.message : "Errore"); }
    }
    return <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori">
      <section className="px-3 pt-6"><p className="eyebrow text-accent">Scheda collaboratore reale</p><h2 className="mt-1 font-serif text-3xl text-primary">{realUser.nome} {realUser.cognome}</h2><p className="mt-1 text-sm text-muted-foreground">Username: <strong>{realUser.username}</strong></p></section>
      <section className="mt-6 px-3"><SectionTitle>Contatti</SectionTitle><div className="grid gap-2 border-t border-border py-3 text-sm"><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> Telefono non ancora inserito</p><p className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> {realUser.email || "Email non inserita"}</p></div></section>
      <section className="mt-6 px-3"><SectionTitle>Cambio password</SectionTitle><div className="border-t border-border pt-3"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nuova password" className="min-h-11 w-full border border-border-strong bg-surface px-3 text-sm" /><button onClick={savePassword} className="mt-3 min-h-10 bg-primary px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white">Salva password</button>{message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}</div></section>
      <section className="mt-6 px-3"><SectionTitle>Stato</SectionTitle><p className="border-t border-border py-3 text-sm">Profilo creato il {new Date(realUser.created_at).toLocaleDateString("it-IT")}.</p></section>
    </AppShell>;
  }

  if (!demoCollaborator) return <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori"><section className="px-3 pt-6"><p className="text-sm text-muted-foreground">Collaboratore non trovato.</p></section></AppShell>;
  return <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori">
    <section className="px-3 pt-6"><p className="eyebrow text-accent">Scheda collaboratore demo</p><h2 className="mt-1 font-serif text-3xl text-primary">{demoCollaborator.name}</h2><p className="mt-1 text-sm text-muted-foreground">{demoCollaborator.role}</p></section>
    <section className="mt-6 px-3"><SectionTitle>Contatti</SectionTitle><div className="grid gap-2 border-t border-border py-3 text-sm"><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> {demoCollaborator.phone || "Telefono non inserito"}</p><p className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> {demoCollaborator.email || "Email non inserita"}</p></div></section>
    <section className="mt-6 px-3"><SectionTitle>Competenze</SectionTitle><ul className="border-t border-border">{demoCollaborator.skillsDetail.map((skill) => <li key={skill.name} className="flex items-center justify-between gap-3 border-b border-border py-3"><span className="text-sm">{skill.name}</span>{skill.status === "verificata" ? <span className="flex items-center gap-1 text-xs font-medium text-accent"><CheckCircle2 className="h-4 w-4" /> Verificata</span> : <button onClick={() => demo.verifyCollaboratorSkill(demoCollaborator.id, skill.name)} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-xs"><CircleAlert className="h-3.5 w-3.5" /> Verifica</button>}</li>)}</ul></section>
    <section className="mt-6 px-3"><SectionTitle action={<Link to="/admin/collaboratori/$id/disponibilita" params={{ id }} className="eyebrow text-accent">Apri</Link>}>Disponibilità</SectionTitle><div className="border border-border bg-surface p-4"><p className="text-sm">Consulta e gestisci le disponibilità di {demoCollaborator.name} per gli eventi.</p></div></section>
  </AppShell>;
}
