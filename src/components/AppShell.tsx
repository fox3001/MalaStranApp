import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, CalendarDays, Home, LogOut, Users, Ticket, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { api, getToken, setToken, useNotifications } from "@/lib/api";

export interface AppShellProps {
  area: "admin" | "user";
  title: string;
  children: ReactNode;
  back?: string;
}
interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const USER_NAV: NavItem[] = [
  { to: "/u", label: "Home", icon: Home, exact: true },
  { to: "/u/eventi", label: "Eventi", icon: Ticket },
  { to: "/u/calendario", label: "Calendario", icon: CalendarDays },
];
const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Regia", icon: Home, exact: true },
  { to: "/admin/eventi", label: "Eventi", icon: Ticket },
  { to: "/admin/collaboratori", label: "User", icon: Users },
  { to: "/admin/calendario", label: "Calendario", icon: CalendarDays },
];

export function AppShell({ area, title, children, back }: AppShellProps) {
  const location = useLocation();
  const router = useRouter();
  const qc = useQueryClient();
  const isAdmin = area === "admin";
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;
  const notifications = useNotifications(area);
  const unread = notifications.data?.unread ?? 0;

  async function logout() {
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
  }

  const bell = (
    <Link
      to={isAdmin ? "/admin/notifiche" : "/u/notifiche"}
      aria-label="Notifiche"
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
        isAdmin ? "text-primary active:bg-muted" : "text-white active:bg-white/20",
      )}
    >
      <Bell className="h-5 w-5" strokeWidth={1.5} />
      {unread > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className={cn("sticky top-0 z-40 border-b border-border-strong pt-safe shadow-[var(--shadow-header)]", isAdmin ? "bg-surface/95 backdrop-blur-md" : "bg-primary")}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {back && (
              <Link
                to={back}
                aria-label="Indietro"
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
                  isAdmin ? "border-border-strong bg-surface text-primary active:bg-muted" : "border-white/20 bg-white/10 text-white active:bg-white/20",
                )}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
            <div className="min-w-0">
              {isAdmin ? (
                <>
                  <p className="eyebrow text-primary/70">Ufficio & regia</p>
                  <h1 className="truncate font-serif text-xl leading-tight text-primary">{title}</h1>
                </>
              ) : (
                <>
                  <p className="eyebrow text-white/70">Area user</p>
                  <h1 className="truncate font-serif text-lg font-semibold leading-tight text-white">{title}</h1>
                </>
              )}
            </div>
          </div>
          {bell}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-2">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-strong bg-surface/95 pb-safe shadow-[var(--shadow-nav)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? location.pathname.replace(/\/$/, "") === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn("relative flex flex-1 flex-col items-center gap-1 px-1 py-2.5 transition-colors", active ? "text-accent" : "text-muted-foreground active:text-foreground")}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 1.75 : 1.5} />
                <span className={cn("text-[10px] font-semibold uppercase tracking-[0.06em]", active && "font-bold")}>{item.label}</span>
                {active && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-accent" />}
              </Link>
            );
          })}
          <button type="button" onClick={() => void logout()} className="flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-muted-foreground transition-colors active:text-foreground">
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">Esci</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
