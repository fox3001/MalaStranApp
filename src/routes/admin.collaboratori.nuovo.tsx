import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui-kit";
import { buildUsername, createCollaborator } from "@/lib/api";

export const Route = createFileRoute("/admin/collaboratori/nuovo")({ component: NuovoCollaboratore });

function NuovoCollaboratore() {
  const navigate = useNavigate();
  const [nome, setNome] = useState(""); const [cognome, setCognome] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [created, setCreated] = useState<Awaited<ReturnType<typeof createCollaborator>>["user"] | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await createCollaborator({ nome, cognome, email, password: password || cognome }); setCreated(result.user); }
    catch (err) { setError(err instanceof Error ? err.message : "Impossibile creare il collaboratore"); }
    finally { setBusy(false); }
  }

  if (created) return <AppShell area="admin" title="Collaboratore creato" back="/admin/collaboratori"><section className="px-3 pt-6">
    <p className="eyebrow text-accent">Profilo reale creato</p><h2 className="mt-1 font-serif text-3xl text-primary">{created.nome} {created.cognome}</h2>
    <Card className="mt-6"><p className="text-sm text-muted-foreground">Credenziali iniziali</p><dl className="mt-4 grid gap-3 text-sm"><div><dt className="text-muted-foreground">Username</dt><dd className="font-semibold text-foreground">{created.username}</dd></div><div><dt className="text-muted-foreground">Password</dt><dd className="font-semibold text-foreground">{password || created.cognome}</dd></div></dl></Card>
    <div className="mt-6 flex gap-3"><Link to="/admin/collaboratori/$id" params={{ id: String(created.id) }} className="inline-flex min-h-11 flex-1 items-center justify-center bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white">Apri profilo</Link><button onClick={() => navigate({ to: "/admin/collaboratori/nuovo" })} className="min-h-11 border border-border px-4 text-sm font-semibold uppercase tracking-[0.08em] text-primary">Nuovo</button></div>
  </section></AppShell>;

  const previewUsername = nome && cognome ? buildUsername(nome, cognome) : "";
  return <AppShell area="admin" title="Nuovo collaboratore" back="/admin/collaboratori"><form onSubmit={submit} className="px-3 pt-6">
    <p className="eyebrow text-accent">Anagrafica</p><h2 className="mt-1 font-serif text-3xl text-primary">Crea profilo</h2><p className="mt-2 text-sm text-muted-foreground">Lo username viene generato automaticamente come nome.cognome. Se lasci vuota la password, viene usato il cognome.</p>
    <div className="mt-6 grid gap-4"><Field label="Nome" value={nome} onChange={setNome} required /><Field label="Cognome" value={cognome} onChange={setCognome} required /><Field label="Email" type="email" value={email} onChange={setEmail} /><Field label="Password iniziale" type="text" value={password} onChange={setPassword} placeholder={cognome || "Cognome"} /></div>
    {previewUsername && <p className="mt-4 text-sm text-muted-foreground">Username: <strong className="text-foreground">{previewUsername}</strong></p>}
    {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    <button disabled={busy} type="submit" className="mt-6 min-h-12 w-full bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">{busy ? "Creazione…" : "Crea collaboratore"}</button>
  </form></AppShell>;
}

function Field({ label, value, onChange, type = "text", placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <label className="block"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}{required ? " *" : ""}</span><input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 min-h-12 w-full border border-border-strong bg-surface px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" /></label>;
}
