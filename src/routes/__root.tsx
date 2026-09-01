import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Toaster, toast } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DemoProvider } from "../lib/store";
import { CURRENT_USER } from "../data/demo";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const ADMIN_TOKEN_KEY = "malastrana-admin-token";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5",
      },
      { title: "Malastrana — Eventi senza tempo" },
      {
        name: "description",
        content:
          "Prototipo UI del gestionale interno Malastrana: eventi, disponibilità, costumi e bolle di carico.",
      },
      { name: "theme-color", content: "#F4F7F6" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Malastrana" },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "default",
      },
      { name: "mobile-web-app-capable", content: "yes" },
      { property: "og:site_name", content: "Malastrana" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Spectral:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <DemoProvider>
        <ProtectedArea pathname={location.pathname} />
        <Toaster position="top-center" richColors closeButton />
      </DemoProvider>
    </QueryClientProvider>
  );
}

function ProtectedArea({ pathname }: { pathname: string }) {
  const area = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/u") ? "collaborator" : null;
  const storageKey = area ? `malastrana-${area}-access` : null;
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(() => {
    if (!area) return true;
    if (area === "admin") return Boolean(window.localStorage.getItem(ADMIN_TOKEN_KEY));
    return window.localStorage.getItem(storageKey!) === "true";
  });

  useEffect(() => {
    setPassword("");

    if (area === "admin") {
      const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!token) {
        setAuthenticated(false);
        return;
      }

      fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("Sessione non valida");
          const data = await response.json();
          if (data?.success && data?.user?.role === "admin") {
            setAuthenticated(true);
          } else {
            throw new Error("Accesso amministratore richiesto");
          }
        })
        .catch(() => {
          window.localStorage.removeItem(ADMIN_TOKEN_KEY);
          setAuthenticated(false);
        });
      return;
    }

    setAuthenticated(storageKey ? window.localStorage.getItem(storageKey) === "true" : true);
  }, [area, storageKey]);

  if (!area || authenticated) return <Outlet />;

  const expectedPassword = CURRENT_USER.password;

  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (area === "admin") {
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "admin", password }),
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success || !data?.token || data?.user?.role !== "admin") {
          throw new Error(data?.error || "Credenziali non valide");
        }

        window.localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setAuthenticated(true);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossibile effettuare il login");
      }
      return;
    }

    if (password === expectedPassword) {
      if (storageKey) window.localStorage.setItem(storageKey, "true");
      setAuthenticated(true);
    }
  }

  return (
    <main className="parchment-bg flex min-h-screen items-center justify-center px-6 py-10">
      <form onSubmit={enter} className="w-full max-w-sm border border-border-strong bg-surface p-6 shadow-[var(--shadow-card)]">
        <p className="eyebrow text-accent">{area === "admin" ? "Ufficio & regia" : "Area collaboratore"}</p>
        <h1 className="mt-2 font-serif text-2xl text-primary">Inserisci la password</h1>
        <Link to="/" className="mt-4 inline-flex text-sm text-accent hover:underline">
          Indietro
        </Link>
        <label htmlFor="area-password" className="sr-only">Password</label>
        <input
          id="area-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          className="mt-5 min-h-12 w-full border border-border-strong bg-background px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button type="submit" className="mt-4 min-h-11 w-full bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white">
          Entra
        </button>
      </form>
    </main>
  );
}
