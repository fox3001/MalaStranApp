import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HelpButton } from "@/components/HelpButton";
import { api, getToken, setToken, useNotifications, type TavernaMessage } from "@/lib/api";

export interface AppShellProps {
  area: "admin" | "user";
  title: string;
  children: ReactNode;
  back?: string;
  /** piccola scritta sopra il titolo */
  eyebrow?: string;
  /** contenuto a tutta larghezza subito sotto la testata (es. linguette) */
  below?: ReactNode;
  /** la home user ha una testata sua (marchio + campanella) */
  plainHeader?: boolean;
  /** sfondi decorativi dietro al contenuto */
  backdrop?: ReactNode;
  /** pulsanti in più nella testata, accanto alla campanella */
  headerExtra?: ReactNode;
}

type IconName = "home" | "shield" | "cal" | "user" | "users" | "mug";
const ICONS: Record<IconName, ReactNode> = {
  home: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />,
  shield: <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />,
  cal: (
    <>
      <rect x="4" y="5" width="16" height="15" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="9" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </>
  ),
  mug: (
    <>
      <path d="M5 7h10v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M15 10h2.5a2 2 0 0 1 0 4H15M5 7c0-2 2-3 3.5-2.2C9.5 3.5 12 3.5 12.8 5 14.5 4.5 15.5 6 15 7" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="3.5" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20c.8-3.5 3-5 6-5s5.2 1.5 6 5M15 15c3 0 5 1.5 6 4" />
    </>
  ),
};
export function NavIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={cn("h-[22px] w-[22px]", className)} aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  exact?: boolean;
}
const USER_NAV: NavItem[] = [
  { to: "/u", label: "Home", icon: "home", exact: true },
  { to: "/u/eventi", label: "Eventi", icon: "shield" },
  { to: "/u/taverna", label: "Taverna", icon: "mug" },
  { to: "/u/calendario", label: "Calendario", icon: "cal" },
  { to: "/u/profilo", label: "Profilo", icon: "user" },
];
const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Regia", icon: "home", exact: true },
  { to: "/admin/eventi", label: "Eventi", icon: "shield" },
  { to: "/admin/taverna", label: "Taverna", icon: "mug" },
  { to: "/admin/collaboratori", label: "User", icon: "users" },
  { to: "/admin/calendario", label: "Calendario", icon: "cal" },
];

/** Quanti messaggi ci sono ora in Taverna (si ricontrolla ogni 20 secondi). */
function useTavernaCount(area: "admin" | "user") {
  const q = useQuery<{ messages: TavernaMessage[] }>({
    queryKey: [area, "taverna"],
    queryFn: () => api(area, "/taverna"),
    refetchInterval: 20000,
    enabled: !!getToken(area),
  });
  return q.data?.messages.length ?? 0;
}

export function useLogout(area: "admin" | "user") {
  const router = useRouter();
  const qc = useQueryClient();
  return async () => {
    if (getToken(area)) {
      try {
        await api(area, "/logout", { method: "POST" });
      } catch {
        /* si esce comunque */
      }
    }
    setToken(area, null);
    qc.clear();
    await router.navigate({ to: "/" });
  };
}

export function BellButton({ area, light }: { area: "admin" | "user"; light?: boolean }) {
  const notifications = useNotifications(area);
  const unread = notifications.data?.unread ?? 0;
  return (
    <Link
      to={area === "admin" ? "/admin/notifiche" : "/u/notifiche"}
      aria-label={unread ? `Notifiche, ${unread} nuove` : "Notifiche"}
      className={cn(
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
        light ? "border-gold-light text-white" : "border-gold bg-card text-primary",
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden="true">
        <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
      {unread > 0 && (
        <span className={cn("absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-sans text-[10px] font-bold", light ? "bg-white text-accent" : "bg-primary text-primary-foreground")}>
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}

function BackButton({ to, light }: { to: string; light?: boolean }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      aria-label="Indietro"
      className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center border", light ? "border-gold-light text-white" : "border-gold text-primary")}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export function AppShell({ area, title, children, back, eyebrow, below, plainHeader, backdrop, headerExtra }: AppShellProps) {
  const location = useLocation();
  const isAdmin = area === "admin";
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;
  const tavernaCount = useTavernaCount(area);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
      {backdrop}
      {plainHeader ? null : isAdmin ? (
        <header className="sticky top-0 z-40 bg-accent pt-safe text-white [box-shadow:inset_0_-5px_0_#143C3E,inset_0_-6px_0_var(--color-gold)]">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 pb-3.5 pt-4">
            {back && <BackButton to={back} light />}
            <div className="min-w-0 flex-1">
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/85">{eyebrow ?? "Ufficio & regia"}</p>
              <h1 className="truncate font-display text-[21px] font-bold leading-tight tracking-[0.04em] text-white">{title}</h1>
            </div>
            {headerExtra}
            <HelpButton area="admin" light />
            <BellButton area="admin" light />
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-40 border-b border-gold bg-background/95 pt-safe backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 pb-3 pt-4">
            {back && <BackButton to={back} />}
            <div className="min-w-0 flex-1">
              <p className="font-display text-[10px] uppercase tracking-[0.24em] text-accent">{eyebrow ?? "Malastrana"}</p>
              <h1 className="truncate font-display text-xl font-bold leading-tight text-primary">{title}</h1>
            </div>
            {headerExtra}
            <HelpButton area="user" />
            <BellButton area="user" />
          </div>
        </header>
      )}
      {below && <div className="sticky top-[76px] z-30">{below}</div>}

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-5 pb-28">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold bg-nav pb-safe">
        <div className="mx-auto flex h-[72px] max-w-3xl items-stretch">
          {navItems.map((item) => {
            const active = item.exact ? location.pathname.replace(/\/$/, "") === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to={item.to as any}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-[3px] font-display text-[9px] uppercase tracking-[0.08em]",
                  active ? (isAdmin ? "text-accent" : "text-primary") : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <NavIcon name={item.icon} />
                  {item.icon === "mug" && tavernaCount > 0 && (
                    <span
                      aria-label={`${tavernaCount} messaggi`}
                      className={cn(
                        "absolute -right-3 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white px-1 font-sans text-[10px] font-bold normal-case tracking-normal text-white",
                        isAdmin ? "bg-accent" : "bg-primary",
                      )}
                    >
                      {tavernaCount > 99 ? "99+" : tavernaCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/** Linguette in maiuscoletto (Prossimi/Passati, Persone/Bolla…) */
export function Tabs<T extends string>({ items, value, onChange, tone = "accent" }: { items: { value: T; label: string }[]; value: T; onChange: (v: T) => void; tone?: "accent" | "primary" }) {
  return (
    <div role="tablist" className="grid border-b border-gold bg-nav" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.value)}
            className={cn(
              "min-h-[46px] border-b-[3px] font-display text-[11px] uppercase tracking-[0.12em]",
              on ? (tone === "accent" ? "border-accent text-accent" : "border-primary text-primary") : "border-transparent text-muted-foreground",
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
