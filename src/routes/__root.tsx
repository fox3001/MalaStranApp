import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useLocation, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DemoProvider } from "../lib/store";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const ADMIN_TOKEN_KEY = "malastrana-admin-token";
const USER_TOKEN_KEY = "malastrana-user-token";
const USER_DATA_KEY = "malastrana-user";

function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-7xl font-bold text-foreground">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2><p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p><div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Go home</Link></div></div></div>;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1><p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button><a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground">Go home</a></div></div></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" }, { title: "Malastrana — Eventi senza tempo" }, { name: "description", content: "Gestionale interno Malastrana: eventi, disponibilità, costumi e bolle di carico." }, { name: "theme-color", content: "#F4F7F6" }, { name: "apple-mobile-web-app-capable", content: "yes" }, { name: "apple-mobile-web-app-title", content: "Malastrana" }, { name: "apple-mobile-web-app-status-bar-style", content: "default" }, { name: "mobile-web-app-capable", content: "yes" }, { property: "og:site_name", content: "Malastrana" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "stylesheet", href: appCss }, { rel: "icon", href: "/favicon.ico", type: "image/x-icon" }, { rel: "manifest", href: "/manifest.webmanifest" }, { rel: "apple-touch-icon", href: "/icons/icon-192.png" }, { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "preconnect", href: "https://fonts.gstatic.com" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Spectral:wght@300;400;500;600&display=swap" }] }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) { return <html lang="it"><head><HeadContent /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() { const { queryClient } = Route.useRouteContext(); const location = useLocation(); return <QueryClientProvider client={queryClient}><DemoProvider><ProtectedArea pathname={location.pathname} /></DemoProvider><Toaster position="top-center" richColors closeButton /></QueryClientProvider>; }

function ProtectedArea({ pathname }: { pathname: string }) {
  const area = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/u") ? "collaborator" : null;
  const tokenKey = area === "admin" ? ADMIN_TOKEN_KEY : area === "collaborator" ? USER_TOKEN_KEY : null;
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [authenticated, setAuthenticated] = useState(() => !area || Boolean(window.localStorage.getItem(tokenKey!)));
  const [checking, setChecking] = useState(Boolean(area && window.localStorage.getItem(tokenKey!)));

  useEffect(() => {
    setPassword("");
    setUsername("");
    if (!area || !tokenKey) { setAuthenticated(true); setChecking(false); return; }
    const token = window.localStorage.getItem(tokenKey);
    if (!token) { setAuthenticated(false); setChecking(false); return; }
    setChecking(true);
    fetch(`${API_BASE_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        const expectedRole = area === "admin" ? "admin" : "user";
        if (!response.ok || !data?.success || data.user?.role !== expectedRole) throw new Error(data?.error || "Sessione non valida");
        if (area === "collaborator") window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        setAuthenticated(true);
      })
      .catch(() => { window.localStorage.removeItem(tokenKey); if (area === "collaborator") window.localStorage.removeItem(USER_DATA_KEY); setAuthenticated(false); })
      .finally(() => setChecking(false));
  }, [area, tokenKey]);

  if (!area || (authenticated && !checking)) return <Outlet />;
  if (checking) return <main className="parchment-bg flex min-h-screen items-center justify-center px-6"><p className="text-sm text-muted-foreground">Verifica sessione…</p></main>;

  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const body = area === "admin" ? { username: "admin", password } : { username: username.trim(), password };
      const response = await fetch(`${API_BASE_URL}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => null);
      const expectedRole = area === "admin" ? "admin" : "user";
      if (!response.ok || !data?.success || !data?.token || data?.user?.role !== expectedRole) throw new Error(data?.error || "Credenziali non valide");
      window.localStorage.setItem(tokenKey!, data.token);
      if (area === "collaborator") window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
      setAuthenticated(true);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Impossibile effettuare il login"); }
  }

  return <main className="parchment-bg relative z-0 flex min-h-screen items-center justify-center px-6 py-10"><form onSubmit={enter} className="relative z-50 w-full max-w-sm border border-border-strong bg-surface p-6 shadow-[var(--shadow-card)]" style={{ pointerEvents: "auto" }}><p className="eyebrow text-accent">{area === "admin" ? "Ufficio & regia" : "Area collaboratore"}</p><h1 className="mt-2 font-serif text-2xl text-primary">Accedi</h1><Link to="/" className="mt-4 inline-flex text-sm text-accent hover:underline">Indietro</Link>{area === "collaborator" && <><label htmlFor="area-username" className="mt-5 block text-sm text-foreground">Username</label><input id="area-username" name="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoFocus autoComplete="username" className="mt-1 min-h-12 w-full border border-border-strong bg-background px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" placeholder="nome.cognome" style={{ pointerEvents: "auto" }} /></>}<label htmlFor="area-password" className="mt-5 block text-sm text-foreground">Password</label><input id="area-password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus={area === "admin"} autoComplete="current-password" className="mt-1 min-h-12 w-full border border-border-strong bg-background px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" style={{ pointerEvents: "auto", position: "relative", zIndex: 60 }} /><button type="submit" disabled={area === "collaborator" && (!username.trim() || !password)} className="relative z-50 mt-4 min-h-11 w-full bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">Entra</button></form></main>;
}
