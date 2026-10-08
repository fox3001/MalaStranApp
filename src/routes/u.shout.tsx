import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { ShoutIcon } from "@/components/ShoutIcon";
import { Empty, ErrorBox, Loading, PageTitle } from "@/components/ui-kit";
import { api, useMyShouts } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/shout")({ component: ShoutUser });

/** Tutti gli shout ricevuti dall'admin; aprendo la pagina diventano "letti". */
function ShoutUser() {
  const q = useMyShouts();
  const qc = useQueryClient();
  const unread = q.data?.unread ?? 0;

  useEffect(() => {
    if (!unread) return;
    const t = setTimeout(() => {
      void api("user", "/shouts/read", { method: "POST" }).then(() => {
        void qc.invalidateQueries({ queryKey: ["user", "shouts"] });
        void qc.invalidateQueries({ queryKey: ["user", "notifications"] });
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [unread, qc]);

  return (
    <AppShell area="user" eyebrow="Dall'admin" title="Shout" back="/u">
      <PageTitle eyebrow="Messaggi" title="Shout" subtitle="I messaggi che l'admin ha mandato a te (o a tutti)." />
      <div className="mt-5">
        {q.isLoading ? (
          <Loading />
        ) : q.isError ? (
          <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
        ) : !q.data?.shouts.length ? (
          <Empty>Nessuno shout per ora.</Empty>
        ) : (
          <ul className="grid gap-3">
            {q.data.shouts.map((s) => (
              <li key={s.id} className={cn("border bg-card px-4 py-3", s.letto ? "border-border" : "border-l-4 border-gold border-l-accent")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-accent px-2 py-0.5 font-display text-[11px] font-bold tracking-[0.06em] text-white">
                    <ShoutIcon className="h-3.5 w-3.5" /> Admin{s.a_tutti ? " · a tutti" : ""}
                  </span>
                  <span className="flex items-center gap-2 text-[13px] italic text-muted-foreground">
                    {!s.letto && <span className="font-display text-[10px] not-italic uppercase tracking-[0.12em] text-accent">nuovo</span>}
                    {s.quando}
                  </span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap break-words text-[17px] leading-snug">{s.testo}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
