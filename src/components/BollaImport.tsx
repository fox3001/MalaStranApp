import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui-kit";
import type { Participant } from "@/lib/api";

export interface ImportRow {
  item: string;
  categoria: string;
  codice: string;
  taglia: string;
  quantita: number;
  assigned_user_id: number | null;
  assegnato_testo: string;
}

const HEADERS: Record<string, keyof ImportRow> = {
  oggetto: "item", nome: "item", articolo: "item", costume: "item", item: "item", descrizione: "item",
  categoria: "categoria", tipo: "categoria",
  codice: "codice", code: "codice",
  taglia: "taglia", size: "taglia",
  quantita: "quantita", "quantità": "quantita", qta: "quantita", "q.tà": "quantita", qty: "quantita", pezzi: "quantita",
  assegnato: "assegnato_testo", user: "assegnato_testo", persona: "assegnato_testo", collaboratore: "assegnato_testo", chi: "assegnato_testo",
};

function norm(s: unknown): string {
  return String(s ?? "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Legge un file Excel o CSV e propone le righe della bolla, da controllare prima di importarle. */
export function BollaImport({ participants, onImport, busy }: { participants: Participant[]; onImport: (rows: ImportRow[]) => void; busy?: boolean }) {
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [fileName, setFileName] = useState("");

  function findUser(text: string): number | null {
    const t = norm(text);
    if (!t) return null;
    const p = participants.find((x) => norm(x.username) === t || norm(`${x.nome} ${x.cognome}`) === t || norm(`${x.cognome} ${x.nome}`) === t);
    return p ? p.user_id : null;
  }

  async function read(file: File) {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0] ?? ""];
      if (!sheet) throw new Error("Il file non contiene fogli");
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const parsed: ImportRow[] = [];
      for (const r of raw) {
        const row: ImportRow = { item: "", categoria: "", codice: "", taglia: "", quantita: 1, assigned_user_id: null, assegnato_testo: "" };
        for (const [k, val] of Object.entries(r)) {
          const field = HEADERS[norm(k)];
          if (!field) continue;
          if (field === "quantita") {
            const n = Number(val);
            row.quantita = Number.isInteger(n) && n > 0 ? n : 1;
          } else if (field !== "assigned_user_id") row[field] = String(val).trim();
        }
        if (!row.item) continue;
        row.assigned_user_id = findUser(row.assegnato_testo);
        parsed.push(row);
      }
      if (!parsed.length) throw new Error("Nessuna riga trovata. Serve almeno una colonna «Oggetto» (o «Nome»).");
      setRows(parsed);
      setFileName(file.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "File non leggibile");
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-border-strong p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <FileSpreadsheet className="h-4 w-4 text-accent" /> Importa da Excel o CSV
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Colonne riconosciute: Oggetto, Categoria, Codice, Taglia, Quantità, Assegnato (username oppure «Nome Cognome» di uno user invitato).
      </p>
      <input
        type="file"
        accept=".xlsx,.xls,.csv,.ods"
        className="mt-3 block w-full text-sm"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void read(f);
          e.target.value = "";
        }}
      />
      {rows && (
        <div className="mt-4">
          <p className="text-sm">
            <strong>{rows.length}</strong> righe lette da {fileName}. Controlla prima di importare:
          </p>
          <div className="mt-2 max-h-64 overflow-auto rounded border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2">Oggetto</th>
                  <th className="p-2">Cat.</th>
                  <th className="p-2">Qtà</th>
                  <th className="p-2">Assegnato</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-2">
                      {r.item}
                      {r.codice && <span className="text-muted-foreground"> · {r.codice}</span>}
                      {r.taglia && <span className="text-muted-foreground"> · tg {r.taglia}</span>}
                    </td>
                    <td className="p-2">{r.categoria}</td>
                    <td className="p-2">{r.quantita}</td>
                    <td className="p-2">
                      {r.assegnato_testo ? (r.assigned_user_id ? r.assegnato_testo : <span className="text-destructive">{r.assegnato_testo} (non trovato)</span>) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" disabled={busy} onClick={() => onImport(rows)} className="flex-1">
              Importa {rows.length} righe
            </Button>
            <Button type="button" variant="outline" onClick={() => setRows(null)}>
              Annulla
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
