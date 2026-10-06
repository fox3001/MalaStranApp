import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRouteWithContext, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { api, areaFromPath, getToken, setToken, type Area } from "@/lib/api";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  return (
    <QueryClientProvider client={queryClient}>
      <Protected key={areaFromPath(location.pathname) ?? "public"} area={areaFromPath(location.pathname)} />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <main className="parchment-bg flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-5xl text-primary">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Questa pagina non esiste.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-accent underline">
          Torna all'inizio
        </Link>
      </div>
    </main>
  );
}

type Check = "checking" | "in" | "out";

/** Mostra le pagine admin/user solo a chi ha una sessione valida per quell'area. */
function Protected({ area }: { area: Area | null }) {
  const [state, setState] = useState<Check>(() => (!area ? "in" : getToken(area) ? "checking" : "out"));

  useEffect(() => {
    if (!area) {
      setState("in");
      return;
    }
    if (!getToken(area)) {
      setState("out");
      return;
    }
    let alive = true;
    setState("checking");
    api<{ user: { role: string } }>(area, "/me")
      .then((d) => {
        if (!alive) return;
        if (d.user.role !== area) {
          setToken(area, null);
          setState("out");
        } else setState("in");
      })
      .catch(() => alive && setState(getToken(area) ? "in" : "out"));
    return () => {
      alive = false;
    };
  }, [area]);

  useEffect(() => {
    const onLogout = (e: Event) => {
      if ((e as CustomEvent<Area>).detail === area) setState("out");
    };
    window.addEventListener("malastrana:logout", onLogout);
    return () => window.removeEventListener("malastrana:logout", onLogout);
  }, [area]);

  if (!area || state === "in") return <Outlet />;
  if (state === "checking")
    return (
      <main className="parchment-bg flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">Verifica accesso…</p>
      </main>
    );
  return <LoginForm area={area} onDone={() => setState("in")} />;
}

function LoginForm({ area, onDone }: { area: Area; onDone: () => void }) {
  const [busy, setBusy] = useState(false);

  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = area === "admin" ? "admin" : String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    setBusy(true);
    try {
      const d = await api<{ token: string; user: { role: string } }>(null, "/login", { method: "POST", body: { username, password } });
      if (d.user.role !== area) throw new Error(area === "admin" ? "Queste non sono credenziali admin" : "Queste non sono credenziali user");
      setToken(area, d.token);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Accesso non riuscito");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 min-h-12 w-full rounded-lg border border-border-strong bg-background px-3 text-base text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
  return (
    <main className="parchment-bg flex min-h-screen items-center justify-center px-6 py-10">
      <form onSubmit={enter} className="w-full max-w-sm rounded-xl border border-border-strong bg-surface p-6 shadow-[var(--shadow-card)]">
        <img src="/malastrana-logo.png" alt="MalaStranApp" className="mx-auto mb-4 h-auto w-32" />
        <p className="eyebrow text-accent">{area === "admin" ? "Ufficio & regia" : "Area user"}</p>
        <h1 className="mt-1 font-serif text-2xl text-primary">Accedi</h1>
        {area === "user" && (
          <label className="mt-5 block">
            <span className="text-sm text-foreground">Username</span>
            <input name="username" type="text" autoFocus autoCapitalize="none" autoCorrect="off" autoComplete="username" required className={field} />
          </label>
        )}
        <label className="mt-4 block">
          <span className="text-sm text-foreground">Password</span>
          <input name="password" type="password" autoFocus={area === "admin"} autoComplete="current-password" required className={field} />
        </label>
        <button type="submit" disabled={busy} className="mt-5 min-h-12 w-full rounded-lg bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50">
          {busy ? "Accesso…" : "Entra"}
        </button>
        <Link to="/" className="mt-4 block text-center text-sm text-accent hover:underline">
          Indietro
        </Link>
        {area === "user" && <p className="mt-4 text-center text-xs text-muted-foreground">Username e password te li fornisce l'ufficio.</p>}
      </form>
    </main>
  );
}
