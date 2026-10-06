import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { CostumeList } from "@/components/CostumeList";
import { SkillPicker } from "@/components/SkillPicker";
import { Avatar, Button, Card, ErrorBox, Loading, SectionTitle, TextArea, TextInput } from "@/components/ui-kit";
import { useApiMutation, useMyCostumes, useProfile, type User } from "@/lib/api";

export const Route = createFileRoute("/u/profilo")({ component: Profilo });

function Profilo() {
  const q = useProfile();
  return (
    <AppShell area="user" title="Il mio profilo" back="/u">
      {q.isLoading ? <Loading /> : q.isError || !q.data ? <div className="mt-6"><ErrorBox error={q.error} onRetry={() => void q.refetch()} /></div> : <ProfileForm user={q.data.user} />}
    </AppShell>
  );
}

function ProfileForm({ user }: { user: User }) {
  const [form, setForm] = useState(user);
  useEffect(() => setForm(user), [user]);
  const costumes = useMyCostumes();
  const save = useApiMutation<Partial<User>>("user", (body) => ({ path: "/profile", method: "PATCH", body }), { success: "Profilo salvato", invalidate: [["profile"]] });
  const addCostume = useApiMutation<{ nome: string; categoria: string; note: string }>("user", (body) => ({ path: "/profile/costumes", method: "POST", body }), { success: "Costume aggiunto", invalidate: [["costumes"]] });
  const delCostume = useApiMutation<number>("user", (id) => ({ path: `/profile/costumes/${id}`, method: "DELETE" }), { invalidate: [["costumes"]] });
  const changePwd = useApiMutation<{ attuale: string; nuova: string }>("user", (body) => ({ path: "/profile/password", method: "POST", body }), { success: "Password cambiata" });

  const set = (k: keyof User) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    save.mutate({ telefono: form.telefono, email: form.email, bio: form.bio, competenze: form.competenze, competenzeFlag: form.competenzeFlag });
  }

  function submitPwd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    const nuova = String(f.get("nuova") || "");
    if (nuova !== String(f.get("conferma") || "")) {
      window.alert("Le due nuove password non coincidono");
      return;
    }
    changePwd.mutate({ attuale: String(f.get("attuale") || ""), nuova }, { onSuccess: () => formEl.reset() });
  }

  return (
    <>
      <section className="flex items-center gap-4 pt-6">
        <Avatar name={`${user.nome} ${user.cognome}`} size="md" />
        <div>
          <h2 className="font-serif text-2xl text-primary">
            {user.nome} {user.cognome}
          </h2>
          <p className="text-sm text-muted-foreground">
            Username: <strong className="text-foreground">{user.username}</strong>
          </p>
          {user.qualifica && <p className="text-sm text-muted-foreground">{user.qualifica}</p>}
        </div>
      </section>

      <form onSubmit={submit} className="mt-6 grid gap-6">
        <Card className="grid gap-4">
          <SectionTitle>I miei contatti</SectionTitle>
          <TextInput label="Telefono" type="tel" value={form.telefono} onChange={set("telefono")} />
          <TextInput label="Email" type="email" value={form.email} onChange={set("email")} />
          <TextArea label="Presentazione" value={form.bio} onChange={set("bio")} placeholder="Raccontati in poche righe: esperienze, specialità…" />
        </Card>
        <Card>
          <SectionTitle>Le mie competenze</SectionTitle>
          <SkillPicker value={form.competenze} flags={form.competenzeFlag} onChange={(v, fl) => setForm((f) => ({ ...f, competenze: v, competenzeFlag: fl }))} />
        </Card>
        <Button type="submit" disabled={save.isPending} full>
          {save.isPending ? "Salvataggio…" : "Salva profilo"}
        </Button>
      </form>

      <Card className="mt-6">
        <SectionTitle>I miei costumi</SectionTitle>
        {costumes.isLoading ? <Loading /> : <CostumeList costumes={costumes.data?.costumes ?? []} onAdd={(c) => addCostume.mutate(c)} onDelete={(id) => delCostume.mutate(id)} adding={addCostume.isPending} />}
      </Card>

      <Card className="mt-6">
        <SectionTitle>Cambia password</SectionTitle>
        <form onSubmit={submitPwd} className="grid gap-3">
          <TextInput label="Password attuale" name="attuale" type="password" required autoComplete="current-password" />
          <TextInput label="Nuova password" name="nuova" type="password" required minLength={6} autoComplete="new-password" />
          <TextInput label="Ripeti nuova password" name="conferma" type="password" required minLength={6} autoComplete="new-password" />
          <Button type="submit" variant="outline" disabled={changePwd.isPending}>
            Cambia password
          </Button>
        </form>
      </Card>
    </>
  );
}
