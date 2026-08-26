import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, UserRound } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="parchment-bg flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <img
            src="/malastrana-logo.png"
            alt="Malastrana App"
            className="h-auto w-56 object-contain"
          />
        </div>

        {/* Selector */}
        <p className="eyebrow mb-4 text-center text-muted-foreground">Chi sei?</p>

        <div className="grid gap-4">
          <Link
            to="/u"
            onClick={() => window.localStorage.removeItem("malastrana-collaborator-access")}
            className="group flex items-center gap-4 rounded-xl border border-primary bg-primary px-5 py-5 text-white shadow-[var(--shadow-card)] transition-all active:scale-[0.98]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <UserRound className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block text-base font-semibold uppercase tracking-[0.1em]">
                Collaboratore
              </span>
              <span className="mt-1 block text-sm text-white/85">
                Area collaboratore dimostrativa
              </span>
            </span>
          </Link>

          <Link
            to="/admin"
            onClick={() => window.localStorage.removeItem("malastrana-admin-access")}
            className="group flex items-center gap-4 rounded-xl border border-accent bg-accent px-5 py-5 text-white shadow-[var(--shadow-card)] transition-all active:scale-[0.98]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block text-base font-semibold uppercase tracking-[0.1em]">
                Admin
              </span>
              <span className="mt-1 block text-sm text-white/85">
                Ufficio & Regia dimostrativa
              </span>
            </span>
          </Link>
        </div>

        <p className="mt-8 text-center text-sm leading-6 text-muted-foreground">
          La scelta è solo un ingresso visuale: non esiste login, non esiste
          autenticazione e non sono attivi ruoli o permessi reali.
        </p>
      </div>
    </main>
  );
}
