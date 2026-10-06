import { Link } from "@tanstack/react-router";
import { Button, Empty, ErrorBox, Loading } from "@/components/ui-kit";
import { useApiMutation, useNotifications, type Area } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Elenco notifiche reali (admin o user), con "segna come lette". */
export function NotificationList({ area }: { area: Area }) {
  const q = useNotifications(area);
  const readAll = useApiMutation<void>(area, () => ({ path: "/notifications/read-all", method: "POST" }), { invalidate: [["notifications"]] });
  const readOne = useApiMutation<number>(area, (id) => ({ path: `/notifications/${id}/read`, method: "POST" }), { invalidate: [["notifications"]] });

  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorBox error={q.error} onRetry={() => void q.refetch()} />;
  const list = q.data?.notifications ?? [];
  if (!list.length) return <Empty>Nessuna notifica per ora.</Empty>;

  const eventPath = area === "admin" ? "/admin/eventi/$code" : "/u/eventi/$code";

  return (
    <div className="grid gap-4">
      {(q.data?.unread ?? 0) > 0 && (
        <Button type="button" variant="outline" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
          Segna tutte come lette ({q.data?.unread})
        </Button>
      )}
      <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        {list.map((n) => {
          const body = (
            <span className="flex items-start justify-between gap-3">
              <span className="flex items-start gap-2">
                {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Non letta" />}
                <span className={cn("text-sm", n.is_read ? "text-muted-foreground" : "font-medium text-foreground")}>{n.message}</span>
              </span>
              <span className="eyebrow shrink-0 text-muted-foreground">{timeAgo(n.created_at)}</span>
            </span>
          );
          return (
            <li key={n.id} className="border-b border-border last:border-b-0">
              {n.event_code ? (
                <Link to={eventPath} params={{ code: n.event_code }} onClick={() => !n.is_read && readOne.mutate(n.id)} className="block px-4 py-3 active:bg-muted">
                  {body}
                </Link>
              ) : (
                <button type="button" onClick={() => !n.is_read && readOne.mutate(n.id)} className="block w-full px-4 py-3 text-left">
                  {body}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
