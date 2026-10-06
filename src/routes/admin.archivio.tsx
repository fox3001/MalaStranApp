import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button, Empty, ErrorBox, Loading, PageTitle } from "@/components/ui-kit";
import { api, downloadText, useArchive } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/archivio")({ component: Archivio });

function Archivio() {
  const q = useArchive();
  const list = q.data?.archives ?? [];

  async function one(id: number, code: string) {
    try {
      const d = await api<{ archive: { testo: string } }>("admin", `/admin/archive/${id}`);
      downloadText(`${code}-resoconto.txt`, d.archive.testo);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore");
    }
  }
  async function all() {
    try {
      const d = await api<{ testo: string }>("admin", "/admin/archive/all");
      downloadText(`archivio-eventi-malastrana.txt`, d.testo);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore");
    }
  }

  return (
    <AppShell area="admin" title="Archivio" back="/admin">
      <PageTitle eyebrow="Eventi passati" title="Archivio" subtitle="Un mese dopo la data, ogni evento viene tolto dall'app e il suo resoconto finisce qui come testo." />
      <div className="mt-5">
        {q.isLoading ? (
          <Loading />
        ) : q.isError ? (
          <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
        ) : list.length === 0 ? (
          <Empty>Ancora nessun evento archiviato.</Empty>
        ) : (
          <div className="grid gap-4">
            <Button type="button" onClick={() => void all()}>
              <Download className="h-4 w-4" /> Scarica tutto l'archivio (.txt)
            </Button>
            <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              {list.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-base text-foreground">{a.nome}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDate(a.data)} · {a.code}
                    </span>
                  </span>
                  <button type="button" onClick={() => void one(a.id, a.code)} aria-label={`Scarica ${a.nome}`} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-accent px-3 text-xs font-semibold text-accent">
                    <Download className="h-4 w-4" /> .txt
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
