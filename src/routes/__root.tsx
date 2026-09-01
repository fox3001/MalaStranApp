import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useLocation, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DemoProvider } from "../lib/store";
import { login, validateSession, clearAuth } from "../lib/api";

function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-7xl font-bold text-foreground">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2><p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p><div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Go home</Link></div></div></div>;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1><p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button><a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground">Go home</a></div></div></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" },
      { title: "Malastrana — Eventi senza tempo" },
      { name: "description", content: "Gestionale interno Malastrana: eventi, disponibilità, costumi e bolle di carico." },
      { name: "theme-color", content: "#F4F7F6" },
      { name: "mobile-web-app-capable", content: "yes" },
      { property: "og:site_name", content: "Malastrana" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Spectral:wght@300;400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <html lang="it"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  return <QueryClientProvider client={queryClient}><ProtectedArea pathname={location.pathname} /><Toaster position="top-center" richColors closeButton /></QueryClientProvider>;
}

function AuthenticatedOutlet() {
  return <DemoProvider><Outlet /></DemoProvider>;
}

function ProtectedArea({ pathname }: { pathname: string }) {
  const area = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/u") ? "collaborator" : null;
  const [checking, setChecking] = useState(Boolean(area));
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setError("");
    if (!area) { setChecking(false); setAuthenticated(true); return () => { active = false; }; }
    setChecking(true);
    validateSession().then((user) => {
      if (!active) return;
      setAuthenticated(Boolean(user && user.role === (area === "admin" ? "admin" : "user")));
      setChecking(false);
    }).catch(() => {
      if (!active) return;
      clearAuth();
      setAuthenticated(false);
      setChecking(false);
    });
    return () => { active = false; };
  }, [area]);

  if (!area) return <AuthenticatedOutlet />;
  if (checking) return <main className="parchment-bg fixed inset-0 z-[100] flex min-h-screen items-center justify-center"><p className="text-sm text-muted-foreground">Verifica accesso…</p></main>;
  if (authenticated) return <AuthenticatedOutlet />;

  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    try {
      const user = await login(area === "admin" ? "admin" : username, password);
      if (user.role !== (area === "admin" ? "admin" : "user")) {
        clearAuth();
        throw new Error("Questo account non può accedere a quest'area.");
      }
      setAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenziali non valide");
    } finally {
      setBusy(false);
    }
  }

  return <main className="parchment-bg fixed inset-0 z-[100] flex min-h-screen items-center justify-center px-6 py-10" style={{ pointerEvents: "auto" }}>
    <form onSubmit={enter} className="relative z-[101] w-full max-w-sm border border-border-strong bg-surface p-6 shadow-[var(--shadow-card)]" style={{ pointerEvents: "auto" }}>
      <p className="eyebrow text-accent">{area === "admin" ? "Ufficio & regia" : "Area collaboratore"}</p>
      <h1 className="mt-2 font-serif text-2xl text-primary">Accedi</h1>
      <p className="mt-2 text-sm text-muted-foreground">Inserisci username e password.</p>
      <Link to="/" className="mt-3 inline-flex text-sm text-accent hover:underline">Indietro</Link>
      {area === "collaborator" && <>
        <label htmlFor="area-username" className="mt-5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Username</label>
        <input id="area-username" name="username" type="text" defaultValue="" autoComplete="username" autoFocus className="mt-2 min-h-12 w-full border border-border-strong bg-background px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" placeholder="nome.cognome" style={{ pointerEvents: "auto", position: "relative", zIndex: 103 }} />
      </>}
      <label htmlFor="area-password" className="mt-4 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Password</label>
      <input id="area-password" name="password" type="password" defaultValue="" autoComplete="current-password" autoFocus={area === "admin"} tabIndex={0} className="mt-2 min-h-12 w-full border border-border-strong bg-background px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" style={{ pointerEvents: "auto", position: "relative", zIndex: 103 }} />
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <button disabled={busy} type="submit" className="relative z-[102] mt-4 min-h-11 w-full bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">{busy ? "Accesso…" : "Entra"}</button>
    </form>
  </main>;
}
