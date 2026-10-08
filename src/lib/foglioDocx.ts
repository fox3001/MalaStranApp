import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { MONTHS } from "@/lib/format";

/*
 * Foglio Presenze 3.0 in Word (.docx), come il modello di Malastrana.
 * Si può aprire e modificare a mano (es. per aggiungere un secondo evento nello stesso giorno).
 */

export interface FoglioRiga {
  data: string;
  tipologia: string;
  location: string;
  ruolo: string;
  tariffa: string;
  diaria: string;
  pernotti: string;
  viaggi: string;
}

const TEAL = "31859B";
const RED = "953734";
const BLUE = "DCE6F1";
const MM = 56.69; // un millimetro in "twip" di Word
const mm = (v: number) => Math.round(v * MM);
// colonne come nel modello (mm): Gg, Tipologia, Location, Ruolo, Tariffa, Diaria, Pernotti, Viaggi
const COL_MM = [9.5, 32.1, 28, 24.8, 22.8, 22.3, 22.2, 22.9];
const COLS = COL_MM.map(mm);
const TABLE_W = COLS.reduce((a, b) => a + b, 0);

/** dimensione del testo (mezzi punti) perché stia su una riga sola nella colonna: i testi lunghi si rimpiccioliscono */
function fitSize(text: string, colMm: number) {
  const fits = Math.floor((colMm - 2.2) / 1.3); // caratteri che stanno a 8 pt
  if (text.length <= fits) return 16;
  return Math.max(10, Math.floor((16 * fits) / text.length));
}

const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: none, bottom: none, left: none, right: none };
const thin = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const thick = { style: BorderStyle.SINGLE, size: 12, color: "000000" };

async function testata(): Promise<ArrayBuffer | null> {
  try {
    return await (await fetch("/foglio-testata.png")).arrayBuffer();
  } catch {
    return null;
  }
}

const t = (text: string, o: { size?: number; bold?: boolean; color?: string; font?: string; smallCaps?: boolean } = {}) =>
  new TextRun({ text, size: o.size ?? 16, bold: o.bold, color: o.color, font: o.font ?? "Calibri", smallCaps: o.smallCaps });

/** etichetta con l'iniziale rossa: "Nome", "Cognome", "Mese" */
const label = (first: string, rest: string) => [t(first, { font: "Times New Roman", size: 22, color: RED }), t(rest, { font: "Times New Roman", size: 22, color: TEAL })];

function cell(children: Paragraph[], width: number, opts: { shade?: boolean; borders?: object; span?: number; rowSpan?: number } = {}) {
  return new TableCell({
    children,
    width: { size: width, type: WidthType.DXA },
    columnSpan: opts.span,
    rowSpan: opts.rowSpan,
    verticalAlign: VerticalAlign.CENTER,
    margins: { left: 60, right: 60, top: 0, bottom: 0 },
    shading: opts.shade ? { type: ShadingType.CLEAR, color: "auto", fill: BLUE } : undefined,
    borders: opts.borders as never,
  });
}

const p = (runs: TextRun[], center = false) => new Paragraph({ children: runs, alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: 0, after: 0 } });

export async function foglioDocx(mese: string, nome: string, cognome: string, righe: FoglioRiga[]) {
  const [y, m] = mese.split("-").map(Number) as [number, number];
  const img = await testata();

  // intestazione: titolo + mese, nome + cognome (tabella senza bordi, solo le righe sotto i valori)
  const under = { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } };
  const W1 = mm(16), W2 = mm(78), W3 = mm(25), W4 = TABLE_W - W1 - W2 - W3;
  const head = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: [W1, W2, W3, W4],
    borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
    rows: [
      new TableRow({
        height: { value: mm(9), rule: HeightRule.ATLEAST },
        children: [
          cell(
            [p([t("F", { font: "Times New Roman", size: 26, color: RED }), t("OGLIO ", { font: "Times New Roman", size: 20, color: TEAL }), t("P", { font: "Times New Roman", size: 26, color: RED }), t("RESENZE ", { font: "Times New Roman", size: 20, color: TEAL }), t("3.0", { font: "Times New Roman", size: 26, color: TEAL })])],
            W1 + W2,
            { span: 2, borders: noBorders },
          ),
          cell([p([t("del ", { font: "Times New Roman", size: 22, color: TEAL }), ...label("M", "ese di")])], W3, { borders: noBorders }),
          cell([p([t(`${MONTHS[m - 1] ?? ""} ${y}`, { font: "Times New Roman", size: 24 })])], W4, { borders: under }),
        ],
      }),
      new TableRow({
        height: { value: mm(9), rule: HeightRule.ATLEAST },
        children: [
          cell([p(label("N", "ome"))], W1, { borders: noBorders }),
          cell([p([t(nome, { font: "Times New Roman", size: 24 })])], W2, { borders: under }),
          cell([p(label("C", "ognome"))], W3, { borders: noBorders }),
          cell([p([t(cognome, { font: "Times New Roman", size: 24 })])], W4, { borders: under }),
        ],
      }),
    ],
  });

  // tabella dei giorni: una riga per giorno; se ci sono due eventi nello stesso giorno, il secondo si aggiunge a mano
  const byDay = new Map<number, FoglioRiga>();
  for (const r of righe) {
    const gg = Number(r.data.slice(8, 10));
    if (!byDay.has(gg)) byDay.set(gg, r);
  }
  const b = (left = thin, right = thin, top = thin, bottom = thin) => ({ top, bottom, left, right });
  const h = (x: string) => p([t(x, { bold: true })], true);
  const headerRows = [
    new TableRow({
      tableHeader: true,
      height: { value: mm(5.4), rule: HeightRule.EXACT },
      children: [
        cell([h("Gg")], COLS[0]!, { rowSpan: 2, borders: b(thick, thick, thick) }),
        cell([h("Tipologia Evento")], COLS[1]!, { rowSpan: 2, borders: b(thin, thin, thick) }),
        cell([h("Location")], COLS[2]!, { rowSpan: 2, borders: b(thin, thin, thick) }),
        cell([h("Ruolo")], COLS[3]!, { rowSpan: 2, borders: b(thin, thin, thick) }),
        cell([h("Tariffa")], COLS[4]!, { rowSpan: 2, borders: b(thin, thin, thick) }),
        cell([h("Rimborso Spese")], COLS[5]! + COLS[6]! + COLS[7]!, { span: 3, borders: b(thin, thick, thick) }),
      ],
    }),
    new TableRow({
      height: { value: mm(9.2), rule: HeightRule.EXACT },
      children: [
        cell([h("Diaria")], COLS[5]!, { borders: b(thin, thin, thin, thick) }),
        cell([h("Pernotti")], COLS[6]!, { borders: b(thin, thin, thin, thick) }),
        cell([h("Viaggi")], COLS[7]!, { borders: b(thin, thick, thin, thick) }),
      ],
    }),
  ];
  const bodyRows = Array.from({ length: 31 }, (_, i) => {
    const gg = i + 1;
    const r = byDay.get(gg);
    const shade = gg % 2 === 0;
    const vals = r ? [r.tipologia, r.location, r.ruolo, r.tariffa, r.diaria, r.pernotti, r.viaggi] : ["", "", "", "", "", "", ""];
    const last = gg === 31;
    return new TableRow({
      height: { value: mm(5.82), rule: HeightRule.EXACT },
      cantSplit: true,
      children: [
        cell([p([t(String(gg))], true)], COLS[0]!, { borders: b(thick, thick, thin, last ? thick : thin) }),
        ...vals.map((v, k) =>
          cell([p([t(v ?? "", { size: fitSize(v ?? "", COL_MM[k + 1]!) })], k >= 3)], COLS[k + 1]!, { shade, borders: b(k === 0 ? thick : thin, k === 6 ? thick : thin, thin, last ? thick : thin) }),
        ),
      ],
    });
  });
  const grid = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: COLS,
    rows: [...headerRows, ...bodyRows],
  });

  const doc = new Document({
    creator: "MalaStranApp",
    title: `Foglio Presenze ${mese} ${nome} ${cognome}`,
    sections: [
      {
        properties: { page: { size: { width: mm(210), height: mm(297) }, margin: { top: mm(3.5), bottom: mm(8), left: mm(10.8), right: mm(14.6) } } },
        children: [
          img
            ? new Paragraph({ children: [new ImageRun({ type: "png", data: img, transformation: { width: Math.round(185.6 * 3.7795), height: Math.round(22 * 3.7795) } })], spacing: { after: 60 } })
            : new Paragraph({ children: [] }),
          head,
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 160, after: 100 },
            children: [t("E’ categoricamente vietato andare a capo nelle caselle della tabella sottostante", { font: "Times New Roman", size: 18, bold: true })],
          }),
          grid,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Foglio_Presenze_${mese}_${cognome}_${nome}.docx`.replace(/\s+/g, "_");
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
