import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  LogOut,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  area: "admin" | "u" | "user";
  title: string;
  children: ReactNode;
  back?: string;
  notifications?: number;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const USER_NAV: NavItem[] = [
  { to: "/", label: "Login", icon: LogOut },
  { to: "/u/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/u/chat", label: "Chat", icon: MessageCircle },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/", label: "Login", icon: LogOut },
  { to: "/admin/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/u/chat", label: "Chat", icon: MessageCircle },
];

export function AppShell({ area, title, children, back, notifications }: AppShellProps) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border-strong shadow-[var(--shadow-header)] pt-safe",
          isAdmin ? "bg-surface/95 backdrop-blur-md" : "bg-primary",
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {back && (
              <Link
                to={back}
                aria-label="Indietro"
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors active:bg-muted",
                  isAdmin
                    ? "border-border-strong bg-surface text-primary"
                    : "border-white/20 bg-white/10 text-white active:bg-white/20",
                )}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
            <div>
              {isAdmin ? (
                <>
                  <p className="eyebrow text-primary/70">UFFICIO & REGIA</p>
                  <h1 className="font-serif text-xl leading-tight text-primary">{title}</h1>
                </>
              ) : (
                <p className="font-serif text-lg font-semibold tracking-[0.12em] text-white">
                  Area Collaboratore
                </p>
              )}
            </div>
          </div>
          {/* Right side */}
          {isAdmin ? (
            <Link to="/admin" className="text-right">
              <p className="font-serif text-sm font-semibold tracking-[0.14em] text-primary">
                MALASTRANA
              </p>
              <p className="font-sans text-[8px] uppercase tracking-[0.24em] text-accent">
                Eventi senza tempo
              </p>
            </Link>
          ) : (
            <Link
              to="/u/notifiche"
              aria-label="Notifiche"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors active:bg-white/20"
            >
              <Bell className="h-5 w-5" strokeWidth={1.5} />
              {notifications !== undefined && notifications > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {notifications}
                </span>
              )}
            </Link>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-strong bg-surface/95 pb-safe shadow-[var(--shadow-nav)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(location.pathname, item.to);
            return (
              <Link
                key={item.to}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to={item.to as any}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 px-2 py-2.5 transition-colors",
                  isActive
                    ? "text-accent"
                    : "text-muted-foreground active:text-foreground",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive && "stroke-[1.75]")}
                  strokeWidth={isActive ? 1.75 : 1.5}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.06em]",
                    isActive && "font-bold",
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -top-px h-0.5 w-8 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function isActiveRoute(pathname: string, to: string): boolean {
  if (to === "/") return false;
  if (to === "/admin/calendario") return pathname.startsWith("/admin/calendario");
  if (to === "/u/chat") return pathname.startsWith("/u/chat");
  if (to === "/u/calendario") return pathname.startsWith("/u/calendario");
  return pathname.startsWith(to);
}
