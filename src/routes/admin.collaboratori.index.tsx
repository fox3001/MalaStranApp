import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar, Card, Tags } from "@/components/ui-kit";
import { buildUsername, createCollaborator, getAdminCollaborators, PROFILE_COSTUMES, PROFILE_SKILLS, type CollaboratorProfile } from "@/lib/api";

export const Route = createFileRoute("/admin/collaboratori/")({ component: AdminCollaboratori });

function AdminCollaboratori() {
  const [q, setQ] = useState("");
  const [collaborators, setCollaborators] = useState<CollaboratorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [nome, setNome] = useState(""); const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [skills, setSkills] = useState<string[]>([]); const [costumes, setCostumes] = useState<string[]>([]);
  const [createError, setCreateError] = useState(""); const [created, setCreated] = useState<CollaboratorProfile | null>(null);

  const load = () => { setLoading(true); getAdminCollaborators().then(r=>setCollaborators(r.users)).catch(e=>setError(e instanceof Error?e.message:"Impossibile caricare i collaboratori")).finally(()=>setLoading(false)); };
  useEffect(load, []);
  const query=q.trim().toLowerCase();
  const list=useMemo(()=>collaborators.filter(c=>!query||`${c.nome} ${c.cognome} ${c.username} ${c.email||""} ${c.ruolo} ${c.skills.join(" ")} ${c.costumeFlags.join(" ")}`.toLowerCase().includes(query)),[collaborators,query]);
  const toggle=(v:string,list:string[],set:(v:string[])=>void)=>set(list.includes(v)?list.filter(x=>x!==v):[...list,v]);
  const username=nome&&cognome?buildUsername(nome,cognome):"";

  async function submit(e:React.FormEvent){ e.preventDefault(); setCreateError(""); try { const r=await createCollaborator({nome,cognome,email,password:password||cognome,skills,costumeFlags:costumes}); setCreated(r.user); load(); } catch(e){setCreateError(e instanceof Error?e.message:"Impossibile creare il collaboratore");} }

  return <AppShell area="admin" title="Collaboratori">
    <section className="px-3 pt-5">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-serif text-2xl text-foreground">Rubrica</h2><p className="mt-1 text-sm text-muted-foreground">Cerca anche per competenze e dotazioni.</p></div><button type="button" onClick={()=>{setCreating(v=>!v);setCreated(null)}} className="shrink-0 bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">{creating?"Chiudi":"+ Nuovo"}</button></div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca nome, competenza, costume…" className="mt-4 min-h-12 w-full border border-border-strong bg-surface px-3 text-sm text-foreground" />
    </section>

    {creating && <section className="mt-5 border-y border-border bg-muted/20 px-3 py-5"><p className="eyebrow text-accent">Nuovo collaboratore</p><h3 className="mt-1 font-serif text-2xl text-primary">Crea profilo</h3><p className="mt-1 text-sm text-muted-foreground">Le checkbox vengono salvate nella scheda reale del collaboratore.</p>
      {created ? <Card className="mt-5"><p className="font-semibold">{created.nome} {created.cognome} creato.</p><p className="mt-2 text-sm">Username: <strong>{created.username}</strong></p><p className="mt-1 text-sm">Competenze: {created.skills.join(", ")||"nessuna"}</p><p className="mt-1 text-sm">Costumi: {created.costumeFlags.join(", ")||"nessuna"}</p><Link className="mt-4 inline-flex bg-primary px-4 py-3 text-xs font-semibold uppercase text-white" to="/admin/collaboratori/$id" params={{id:String(created.id)}}>Apri scheda</Link></Card> : <form onSubmit={submit} className="mt-5 grid gap-4"><Field label="Nome" value={nome} onChange={setNome} required/><Field label="Cognome" value={cognome} onChange={setCognome} required/><Field label="Email" type="email" value={email} onChange={setEmail}/><Field label="Password iniziale" value={password} onChange={setPassword} placeholder={cognome||"Cognome"}/>{username&&<p className="text-sm text-muted-foreground">Username automatico: <strong>{username}</strong></p>}
        <FlagSection title="Competenze" values={PROFILE_SKILLS} selected={skills} toggle={v=>toggle(v,skills,setSkills)}/><FlagSection title="Costumi / dotazioni" values={PROFILE_COSTUMES} selected={costumes} toggle={v=>toggle(v,costumes,setCostumes)}/>{createError&&<p className="text-sm text-destructive">{createError}</p>}<button className="min-h-12 bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white" type="submit">Crea collaboratore</button></form>}
    </section>}

    <section className="mt-5 border-t border-border">{loading&&<p className="px-3 py-6 text-sm text-muted-foreground">Caricamento…</p>}{!loading&&error&&<p className="px-3 py-6 text-sm text-destructive">{error}</p>}{!loading&&!error&&<ul>{list.map(c=><li key={c.id}><Link to="/admin/collaboratori/$id" params={{id:String(c.id)}} className="flex gap-3 border-b border-border px-3 py-3.5 active:bg-muted"><Avatar name={`${c.nome} ${c.cognome}`}/><span className="min-w-0 flex-1"><span className="block truncate font-serif text-base text-foreground">{c.nome} {c.cognome}</span><span className="block truncate text-xs text-muted-foreground">{c.ruolo} · {c.username}</span><span className="mt-1.5 block"><Tags tags={[...c.skills,...c.costumeFlags]}/></span></span><span className="eyebrow shrink-0 text-accent">Attivo</span></Link></li>)}{list.length===0&&<li className="px-3 py-6 text-sm text-muted-foreground">Nessun collaboratore trovato.</li>}</ul>}</section>
  </AppShell>;
}
function FlagSection({title,values,selected,toggle}:{title:string;values:readonly string[];selected:string[];toggle:(v:string)=>void}){return <section className="mt-4"><h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h4><Card><div className="grid gap-2 sm:grid-cols-2">{values.map(v=><label key={v} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface px-3 py-3 text-sm"><input type="checkbox" checked={selected.includes(v)} onChange={()=>toggle(v)} className="h-5 w-5 shrink-0 accent-accent"/><span className="font-medium text-foreground">{v}</span></label>)}</div></Card></section>}
function Field({label,value,onChange,type="text",placeholder,required=false}:{label:string;value:string;onChange:(v:string)=>void;type?:string;placeholder?:string;required?:boolean}){return <label className="block"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}{required?" *":""}</span><input required={required} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="mt-2 min-h-12 w-full border border-border-strong bg-surface px-3 text-sm text-foreground"/></label>}
