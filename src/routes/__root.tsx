import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRouteWithContext, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { api, areaFromPath, getToken, setToken, type Area } from "@/lib/api";
import { LoginScreen } from "@/components/LoginScreen";

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
        <h1 className="font-display text-5xl text-primary">404</h1>
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
        <p className="italic text-muted-foreground">Verifica accesso…</p>
      </main>
    );
  return <LoginScreen area={area} onDone={() => setState("in")} />;
}

