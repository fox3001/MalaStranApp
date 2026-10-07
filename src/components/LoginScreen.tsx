import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, setToken, type Area } from "@/lib/api";
import { ArcaneCircle, Button, LinkButton, TextInput, Toggle } from "@/components/ui-kit";

/** Schermata di accesso: logo, nome utente, password, "Ricordami", ENTRA. */
export function LoginScreen({ area, onDone }: { area: Area; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(true);

  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = area === "admin" ? "admin" : String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    setBusy(true);
    try {
      const d = await api<{ token: string; user: { role: string } }>(null, "/login", { method: "POST", body: { username, password } });
      if (d.user.role !== area) throw new Error(area === "admin" ? "Queste non sono credenziali admin" : "Queste non sono credenziali user");
      setToken(area, d.token, remember);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Accesso non riuscito");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10">
      <ArcaneCircle spin className="left-1/2 top-[8%] h-[540px] w-[540px] -translate-x-1/2" />
      <form onSubmit={enter} className="relative w-full max-w-sm">
        <img src="/malastrana-logo.png" alt="MalaStranApp" width={250} height={222} className="mx-auto mb-7 h-auto w-[250px]" />
        {area === "admin" && <p className="mb-3 text-center font-display text-[11px] uppercase tracking-[0.3em] text-accent">Ufficio & regia</p>}
        <div className="grid gap-3">
          {area === "user" && <TextInput label="Nome utente" name="username" type="text" autoFocus autoCapitalize="none" autoCorrect="off" autoComplete="username" required />}
          <TextInput label="Password" name="password" type="password" autoFocus={area === "admin"} autoComplete="current-password" required />
          <Toggle label="Ricordami su questo telefono" checked={remember} onChange={setRemember} />
        </div>
        <Button type="submit" variant="accent" full disabled={busy} className="mt-3">
          {busy ? "Accesso…" : "Entra"}
        </Button>
        <div className="mt-3">
          <LinkButton to={area === "admin" ? "/" : "/admin"} variant="primary" full>
            {area === "admin" ? "Accedi come user" : "Accedi come admin"}
          </LinkButton>
        </div>
        {area === "user" && <p className="mt-4 text-center text-[15px] italic text-muted-foreground">Nome utente e password te li dà l'ufficio.</p>}
      </form>
    </main>
  );
}
