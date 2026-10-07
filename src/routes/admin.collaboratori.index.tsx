import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { SkillPicker } from "@/components/SkillPicker";
import { Avatar, Button, Card, Empty, ErrorBox, Loading, PageTitle, Tags, TextArea, TextInput } from "@/components/ui-kit";
import { useAdminUsers, useApiMutation } from "@/lib/api";

export const Route = createFileRoute("/admin/collaboratori/")({ component: Rubrica });

function Rubrica() {
  const users = useAdminUsers();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users.data?.users ?? []).filter((u) => {
      if (!showInactive && !u.attivo) return false;
      if (!q) return true;
      const hay = [u.nome, u.cognome, u.username, u.email, u.qualifica, u.bio, u.note, ...u.competenze, ...(u.costumi ?? [])].join(" ").toLowerCase();
      return q.split(/\s+/).every((part) => hay.includes(part));
    });
  }, [users.data, query, showInactive]);

  const inactive = (users.data?.users ?? []).filter((u) => !u.attivo).length;

  return (
    <AppShell area="admin" title="User">
      <PageTitle
        eyebrow="Rubrica"
        title="User"
        subtitle="Cerca per nome, competenza, costume o note: «chi sa fare cosa?»"
        action={
          <button type="button" onClick={() => setShowForm((v) => !v)} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg bg-accent px-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent-foreground">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {showForm ? "Chiudi" : "Nuovo"}
          </button>
        }
      />

      {showForm && <NewUserForm onCreated={() => setShowForm(false)} />}

      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="es. fuoco, pirata, Rossi…"
          className="min-h-11 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>
      {inactive > 0 && (
        <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Mostra anche i {inactive} user disattivati
        </label>
      )}

      <section className="mt-4">
        {users.isLoading ? (
          <Loading />
        ) : users.isError ? (
          <ErrorBox error={users.error} onRetry={() => void users.refetch()} />
        ) : filtered.length === 0 ? (
          <Empty>{(users.data?.users.length ?? 0) === 0 ? "Nessuno user creato. Premi «Nuovo» per creare la prima scheda." : "Nessun risultato per questa ricerca."}</Empty>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            {filtered.map((u) => (
              <li key={u.id} className="border-b border-border last:border-b-0">
                <Link to="/admin/collaboratori/$id" params={{ id: String(u.id) }} className="flex items-start gap-3 px-4 py-3 active:bg-muted">
                  <Avatar name={`${u.nome} ${u.cognome}`} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-serif text-base text-foreground">
                        {u.nome} {u.cognome}
                      </span>
                      {!u.attivo && <span className="eyebrow text-destructive">Disattivato</span>}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      @{u.username}
                      {u.qualifica ? ` · ${u.qualifica}` : ""}
                    </span>
                    {u.competenze.length > 0 && (
                      <span className="mt-1.5 block">
                        <Tags tags={u.competenze.slice(0, 6)} />
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function NewUserForm({ onCreated }: { onCreated: () => void }) {
  const [skills, setSkills] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const create = useApiMutation<Record<string, unknown>>("admin", (body) => ({ path: "/admin/users", method: "POST", body }), { success: "User creato", invalidate: [["users"]] });

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) || "").trim();
    create.mutate(
      {
        nome: get("nome"),
        cognome: get("cognome"),
        username: get("username") || undefined,
        password: get("password"),
        qualifica: get("qualifica"),
        telefono: get("telefono"),
        email: get("email"),
        bio: get("bio"),
        note: get("note"),
        competenze: skills,
        competenzeFlag: flags,
      },
      { onSuccess: onCreated },
    );
  }

  return (
    <Card className="mt-5">
      <form onSubmit={submit} className="grid gap-4">
        <p className="font-serif text-lg text-primary">Nuovo user</p>
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Nome *" name="nome" required autoComplete="off" />
          <TextInput label="Cognome *" name="cognome" required autoComplete="off" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label="Username" name="username" autoComplete="off" autoCapitalize="none" pattern="[A-Za-z0-9._\-]{3,40}" hint="Se lo lasci vuoto diventa nome.cognome. Senza spazi." />
          <TextInput label="Password *" name="password" type="password" required minLength={6} autoComplete="new-password" hint="Almeno 6 caratteri. Comunicala tu allo user." />
        </div>
        <TextInput label="Qualifica" name="qualifica" placeholder="es. Attrice e performer" />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label="Telefono" name="telefono" type="tel" />
          <TextInput label="Email" name="email" type="email" />
        </div>
        <TextArea label="Presentazione" name="bio" />
        <TextArea label="Note interne (le vede solo l'admin)" name="note" />
        <div>
          <p className="eyebrow mb-2 text-muted-foreground">Competenze</p>
          <SkillPicker value={skills} flags={flags} onChange={(v, fl) => { setSkills(v); setFlags(fl); }} />
        </div>
        <Button type="submit" disabled={create.isPending} full>
          {create.isPending ? "Salvataggio…" : "Crea user"}
        </Button>
      </form>
    </Card>
  );
}
