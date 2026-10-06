import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui-kit";
import { parseBollaPdf, parseBollaSheet, type ParsedRow, type PdfTextItem } from "@/lib/bollaParser";

export type ImportRow = ParsedRow;

/** Legge il file della bolla (PDF o Excel) e restituisce le voci. */
export async function readBollaFile(file: File): Promise<ParsedRow[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages: PdfTextItem[][] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const items: PdfTextItem[] = [];
      for (const it of content.items) {
        if (!("str" in it) || !it.str.trim()) continue;
        const [a, b, , , x, y] = it.transform as number[];
        items.push({ str: it.str, x: x!, y: y!, w: it.width, vertical: Math.abs(a!) < 0.01 && Math.abs(b!) > 0.01 });
      }
      pages.push(items);
    }
    return parseBollaPdf(pages);
  }
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const out: ParsedRow[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    out.push(...parseBollaSheet(XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" })));
  }
  return out;
}

/** Scelta del file della bolla con anteprima da controllare prima di caricarla. */
export function BollaImport({ onImport, busy, title = "Carica la bolla da file" }: { onImport: (rows: ParsedRow[]) => void; busy?: boolean; title?: string }) {
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);

  async function read(file: File) {
    setReading(true);
    try {
      const parsed = await readBollaFile(file);
      if (!parsed.length) throw new Error("Non ho trovato voci nel file. Serve una colonna «NOME» (o «Oggetto»).");
      setRows(parsed);
      setFileName(file.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "File non leggibile");
    } finally {
      setReading(false);
    }
  }

  const groups = rows ? [...new Set(rows.map((r) => r.categoria || "Senza gruppo"))] : [];

  return (
    <div className="rounded-lg border border-dashed border-border-strong p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <FileSpreadsheet className="h-4 w-4 text-accent" /> {title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        PDF o Excel nel formato della bolla Malastrana (sezione, gruppo, NOME, PREP, check, NOTE). Le quantità scritte come «Vademecum, 80» vengono riconosciute.
      </p>
      <input
        type="file"
        accept=".pdf,.xlsx,.xls,.csv,.ods"
        className="mt-3 block w-full text-sm"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void read(f);
          e.target.value = "";
        }}
      />
      {reading && <p className="mt-2 text-sm text-muted-foreground">Lettura del file…</p>}
      {rows && (
        <div className="mt-4">
          <p className="text-sm">
            <strong>{rows.length}</strong> voci in <strong>{groups.length}</strong> gruppi lette da {fileName}. Controlla prima di caricarle:
          </p>
          <div className="mt-2 max-h-80 overflow-auto rounded border border-border bg-surface">
            {groups.map((g) => (
              <div key={g}>
                <p className="sticky top-0 bg-secondary px-2 py-1 text-xs font-semibold text-primary">{g}</p>
                <ul className="text-xs">
                  {rows
                    .filter((r) => (r.categoria || "Senza gruppo") === g)
                    .map((r, i) => (
                      <li key={i} className="border-t border-border px-2 py-1">
                        {r.quantita > 1 && <strong>{r.quantita}× </strong>}
                        {r.item}
                        {r.note && <span className="block text-muted-foreground">{r.note}</span>}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" disabled={busy} onClick={() => onImport(rows)} className="flex-1">
              Carica {rows.length} voci
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

/** Versione per il modulo "Nuovo evento": legge il file e passa le voci al modulo. */
export function BollaFilePicker({ value, onChange }: { value: ParsedRow[]; onChange: (rows: ParsedRow[]) => void }) {
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  const groups = [...new Set(value.map((r) => r.categoria || "Senza gruppo"))];
  return (
    <div>
      <input
        type="file"
        accept=".pdf,.xlsx,.xls,.csv,.ods"
        className="block w-full text-sm"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setReading(true);
          try {
            const rows = await readBollaFile(f);
            if (!rows.length) throw new Error("Non ho trovato voci nel file.");
            onChange(rows);
            setFileName(f.name);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "File non leggibile");
          } finally {
            setReading(false);
          }
        }}
      />
      {reading && <p className="mt-2 text-sm text-muted-foreground">Lettura del file…</p>}
      {value.length > 0 && (
        <div className="mt-3 rounded-lg bg-secondary p-3 text-sm">
          <p>
            <strong>{value.length}</strong> voci in <strong>{groups.length}</strong> gruppi{fileName && ` da ${fileName}`}:
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{groups.join(" · ")}</p>
          <button type="button" onClick={() => onChange([])} className="mt-2 text-xs font-semibold text-destructive underline">
            Togli il file
          </button>
        </div>
      )}
    </div>
  );
}
