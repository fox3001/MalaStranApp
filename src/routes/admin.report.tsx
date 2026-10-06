import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Empty, ErrorBox, Loading, PageTitle, SelectInput, Toggle } from "@/components/ui-kit";
import { useAdminEvents, useReport, type ReportRow } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/report")({ component: Report });

function Report() {
  const events = useAdminEvents();
  const [code, setCode] = useState("");
  const [onlyIssues, setOnlyIssues] = useState(false);
  const report = useReport(code, onlyIssues);
  const rows = report.data?.rows ?? [];

  return (
    <AppShell area="admin" title="Report" back="/admin">
      <PageTitle eyebrow="Note per evento" title="Report bolle" subtitle="Presenza, rientro, danni e commenti scritti dagli user." />
      <div className="mt-5 grid gap-3">
        <SelectInput label="Evento" value={code} onChange={(e) => setCode(e.target.value)}>
          <option value="">Tutti gli eventi</option>
          {(events.data?.events ?? []).map((e) => (
            <option key={e.code} value={e.code}>
              {formatDate(e.data)} · {e.nome}
            </option>
          ))}
        </SelectInput>
        <Toggle checked={onlyIssues} onChange={setOnlyIssues} label="Solo danni, commenti e voci entrate ma non uscite" />
        {rows.length > 0 && (
          <Button type="button" variant="outline" onClick={() => downloadCsv(rows)}>
            <Download className="h-4 w-4" /> Scarica per Excel (CSV)
          </Button>
        )}
      </div>
      <section className="mt-5">
        {report.isLoading ? (
          <Loading />
        ) : report.isError ? (
          <ErrorBox error={report.error} onRetry={() => void report.refetch()} />
        ) : rows.length === 0 ? (
          <Empty>Nessuna riga da mostrare.</Empty>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            {rows.map((r) => (
              <li key={r.id} className={cn("border-b border-border px-4 py-3 last:border-b-0", r.damaged && "bg-destructive/5")}>
                <Link to="/admin/eventi/$code" params={{ code: r.event_code }} className="eyebrow text-accent">
                  {formatDate(r.event_data)} · {r.event_nome}
                </Link>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {r.quantita > 1 && `${r.quantita}× `}
                  {r.item}
                  {r.note && <span className="font-normal text-muted-foreground"> · {r.note}</span>}
                </p>
                <p className="mt-1 text-xs">
                  <Mark on={r.prep}>Prep</Mark> · <Mark on={r.present}>Entrata</Mark> · <Mark on={r.returned}>Uscita</Mark> ·{" "}
                  <span className={r.damaged ? "font-semibold text-destructive" : "text-muted-foreground"}>{r.damaged ? "DANNEGGIATO" : "nessun danno"}</span>
                </p>
                {r.comment && <p className="mt-1.5 rounded-md bg-muted px-2 py-1.5 text-xs">“{r.comment}”</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function Mark({ on, children }: { on: boolean; children: string }) {
  return <span className={on ? "text-success" : "text-muted-foreground line-through"}>{children}</span>;
}

function downloadCsv(rows: ReportRow[]) {
  const head = ["Data", "Evento", "Codice evento", "Sezione/gruppo", "Nome", "Quantità", "Note", "Prep", "Entrata", "Uscita", "Danni", "Commento"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.event_data, r.event_nome, r.event_code, r.categoria, r.item, r.quantita, r.note, r.prep ? "sì" : "no", r.present ? "sì" : "no", r.returned ? "sì" : "no", r.damaged ? "sì" : "no", r.comment].map(esc).join(";"),
  );
  const blob = new Blob(["﻿" + [head.map(esc).join(";"), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "report-bolle.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}
