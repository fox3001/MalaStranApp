import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Empty, ErrorBox, Loading, PageTitle, SectionTitle } from "@/components/ui-kit";
import { api, downloadText, useArchive, useMonthlyReports } from "@/lib/api";
import { meseLabel, useFaiReport } from "@/components/ReportMese";
import { formatDate, todayIso } from "@/lib/format";

export const Route = createFileRoute("/admin/archivio")({ component: Archivio });

function Archivio() {
  const q = useArchive();
  const list = q.data?.archives ?? [];
  const [mese, setMese] = useState(() => todayIso().slice(0, 7));
  const reports = useMonthlyReports();
  const fai = useFaiReport();

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

  async function oneReport(id: number, m: string) {
    try {
      const d = await api<{ testo: string }>("admin", `/admin/report-mensili/${id}`);
      downloadText(`report-malastrana-${m}.txt`, d.testo);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore");
    }
  }

  return (
    <AppShell area="admin" title="Archivio" back="/admin">
      <PageTitle eyebrow="Eventi passati" title="Archivio" subtitle="Un mese dopo la data, ogni evento viene tolto dall'app e il suo resoconto finisce qui come testo." />
      <Card className="mt-5 grid gap-3">
        <SectionTitle>Report del mese</SectionTitle>
        <p className="text-sm text-muted-foreground">
          Un file di testo con tutto quello che è successo nel mese: eventi e info, chi ha partecipato, note, oggetti delle bolle con danni o perdite, shout e messaggi dell'admin in Taverna. Ogni report resta qui 3 mesi, poi si cancella da solo.
        </p>
        <div className="flex items-end gap-2">
          <label className="block flex-1">
            <span className="eyebrow text-accent">Mese</span>
            <input
              type="month"
              value={mese}
              onChange={(e) => setMese(e.target.value)}
              className="mt-1 min-h-11 w-full border border-border border-b-[1.5px] border-b-gold bg-card px-3 text-base outline-none focus:border-accent"
            />
          </label>
          <Button type="button" onClick={() => void fai.run(mese)} disabled={!mese || fai.busy}>
            {fai.busy ? "…" : "Fai report"}
          </Button>
        </div>
        {(reports.data?.reports.length ?? 0) > 0 && (
          <ul className="border-t border-line">
            {reports.data!.reports.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
                <span className="min-w-0">
                  <span className="block font-display text-[13px] uppercase tracking-[0.1em] text-primary">{meseLabel(r.mese)}</span>
                  <span className="block text-[13px] italic text-muted-foreground">
                    fatto il {r.quando} · si cancella il {formatDate(r.scade_il)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => void oneReport(r.id, r.mese)}
                  aria-label={`Scarica il report di ${meseLabel(r.mese)}`}
                  className="inline-flex min-h-10 shrink-0 items-center gap-1 border border-accent px-3 text-xs font-semibold text-accent"
                >
                  <Download className="h-4 w-4" /> .txt
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
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
