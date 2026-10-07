import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { AssenzeList } from "@/components/AssenzeList";
import { CostumeList } from "@/components/CostumeList";
import { SkillPicker } from "@/components/SkillPicker";
import { Avatar, Button, Card, ErrorBox, Loading, ParticipantTag, SectionTitle, TextArea, TextInput } from "@/components/ui-kit";
import { useAdminUser, useApiMutation, type Assenza, type User } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/collaboratori/$id")({ component: SchedaUser });

function SchedaUser() {
  const { id } = Route.useParams();
  const q = useAdminUser(id);

  return (
    <AppShell area="admin" title="Scheda user" back="/admin/collaboratori">
      {q.isLoading ? (
        <Loading />
      ) : q.isError || !q.data ? (
        <div className="mt-6">
          <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
        </div>
      ) : (
        <Scheda id={id} user={q.data.user} password={q.data.password ?? null} assenze={q.data.assenze ?? []} costumes={q.data.costumes} events={q.data.events} />
      )}
    </AppShell>
  );
}

function Scheda({ id, user, password, assenze, costumes, events }: { id: string; user: User; password: string | null; assenze: Assenza[]; costumes: NonNullable<ReturnType<typeof useAdminUser>["data"]>["costumes"]; events: NonNullable<ReturnType<typeof useAdminUser>["data"]>["events"] }) {
  const router = useRouter();
  const [form, setForm] = useState(user);
  const [pwd, setPwd] = useState("");
  useEffect(() => setForm(user), [user]);

  const save = useApiMutation<Partial<User>>("admin", (body) => ({ path: `/admin/users/${id}`, method: "PATCH", body }), { success: "Scheda salvata", invalidate: [["users"]] });
  const setPassword = useApiMutation<string>("admin", (password) => ({ path: `/admin/users/${id}/password`, method: "PATCH", body: { password } }), { success: "Password aggiornata", invalidate: [["users"]] });
  const remove = useApiMutation<void>("admin", () => ({ path: `/admin/users/${id}`, method: "DELETE" }), { success: "User eliminato", invalidate: [["users"], ["events"]] });
  const addCostume = useApiMutation<{ nome: string; categoria: string; note: string }>("admin", (body) => ({ path: `/admin/users/${id}/costumes`, method: "POST", body }), { success: "Costume aggiunto", invalidate: [["users"]] });
  const delCostume = useApiMutation<number>("admin", (cid) => ({ path: `/admin/users/${id}/costumes/${cid}`, method: "DELETE" }), { invalidate: [["users"]] });

  const set = (k: keyof User) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    save.mutate({
      nome: form.nome, cognome: form.cognome, qualifica: form.qualifica, telefono: form.telefono, email: form.email,
      bio: form.bio, note: form.note, competenze: form.competenze, competenzeFlag: form.competenzeFlag,
    });
  }

  return (
    <>
      <section className="flex items-center gap-4 pt-6">
        <Avatar name={`${user.nome} ${user.cognome}`} size="md" />
        <div className="min-w-0">
          <h2 className="font-serif text-2xl text-primary">
            {user.nome} {user.cognome}
          </h2>
          <p className="text-sm text-muted-foreground">
            Username: <strong className="text-foreground">{user.username}</strong>
            {!user.attivo && <span className="ml-2 text-destructive">· disattivato</span>}
          </p>
        </div>
      </section>

      <form onSubmit={submit} className="mt-6 grid gap-6">
        <Card className="grid gap-4">
          <SectionTitle>Dati personali</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Nome" value={form.nome} onChange={set("nome")} required />
            <TextInput label="Cognome" value={form.cognome} onChange={set("cognome")} required />
          </div>
          <TextInput label="Qualifica" value={form.qualifica} onChange={set("qualifica")} placeholder="es. Attrice e performer" />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label="Telefono" type="tel" value={form.telefono} onChange={set("telefono")} />
            <TextInput label="Email" type="email" value={form.email} onChange={set("email")} />
          </div>
          <TextArea label="Presentazione" value={form.bio} onChange={set("bio")} />
          <TextArea label="Note interne (solo admin)" value={form.note} onChange={set("note")} />
        </Card>

        <Card>
          <SectionTitle>Competenze</SectionTitle>
          <SkillPicker value={form.competenze} flags={form.competenzeFlag} onChange={(v, fl) => setForm((f) => ({ ...f, competenze: v, competenzeFlag: fl }))} />
        </Card>

        <Button type="submit" disabled={save.isPending} full>
          {save.isPending ? "Salvataggio…" : "Salva scheda"}
        </Button>
      </form>

      <Card className="mt-6">
        <SectionTitle>Giorni in cui non c'è</SectionTitle>
        <AssenzeList assenze={assenze} readOnly empty="Non ha segnato giorni in cui non c'è." />
      </Card>

      <Card className="mt-6">
        <SectionTitle>Costumi personali</SectionTitle>
        <CostumeList costumes={costumes} onAdd={(c) => addCostume.mutate(c)} onDelete={(cid) => delCostume.mutate(cid)} adding={addCostume.isPending} />
      </Card>

      <Card className="mt-6">
        <SectionTitle>Eventi</SectionTitle>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Non ancora coinvolto in nessun evento.</p>
        ) : (
          <ul>
            {events.map((ev) => (
              <li key={ev.code} className="border-b border-border py-2.5 last:border-b-0">
                <Link to="/admin/eventi/$code" params={{ code: ev.code }} className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-foreground">{ev.nome}</span>
                    <span className="block text-xs text-muted-foreground">{formatDate(ev.data)}</span>
                  </span>
                  <ParticipantTag status={ev.stato} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6 grid gap-3">
        <SectionTitle>Accesso</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label="Nome utente" value={user.username} readOnly />
          {password ? (
            <TextInput label="Password attuale" type="password" value={password} readOnly autoComplete="off" />
          ) : (
            <div>
              <span className="block font-display text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Password attuale</span>
              <p className="mt-1 text-sm italic text-muted-foreground">Non disponibile: è stata creata prima di questa funzione. Impostane una nuova qui sotto e da lì in poi la vedrai.</p>
            </div>
          )}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPassword.mutate(pwd, { onSuccess: () => setPwd("") });
          }}
        >
          <TextInput
            label="Nuova password"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            minLength={6}
            required
            placeholder="almeno 6 caratteri"
            autoComplete="new-password"
            className="flex-1"
          />
          <Button type="submit" variant="outline" disabled={setPassword.isPending}>
            Cambia
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">Cambiando la password lo user viene fatto uscire da tutti i dispositivi.</p>
        <Button type="button" variant="outline" onClick={() => save.mutate({ attivo: !user.attivo })}>
          {user.attivo ? "Disattiva account" : "Riattiva account"}
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm(`Eliminare definitivamente ${user.nome} ${user.cognome}? Spariscono anche risposte, costumi e notifiche. Non si può annullare.`))
              remove.mutate(undefined, { onSuccess: () => void router.navigate({ to: "/admin/collaboratori" }) });
          }}
        >
          <Trash2 className="h-4 w-4" /> Elimina user
        </Button>
      </Card>
    </>
  );
}
