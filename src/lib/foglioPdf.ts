import { jsPDF } from "jspdf";
import { MONTHS } from "@/lib/format";

/*
 * Foglio Presenze 3.0 in PDF, disegnato come il modello di Malastrana:
 * righe colorate e logo in alto, titolo, mese, nome e cognome, tabella con un giorno per riga.
 * Misure in millimetri su un A4 verticale.
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

const TEAL: [number, number, number] = [49, 133, 155];
const RED: [number, number, number] = [149, 55, 52];
const BLUE: [number, number, number] = [220, 230, 241];
const COLS = [10.8, 20.3, 52.4, 80.4, 105.2, 128.0, 150.3, 172.5, 195.4];

async function logoDataUrl(): Promise<string | null> {
  try {
    const blob = await (await fetch("/foglio-logo.png")).blob();
    return await new Promise((ok, ko) => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result));
      r.onerror = ko;
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Testo che non va mai a capo: se è troppo lungo si rimpicciolisce, poi si taglia. */
function fit(doc: jsPDF, text: string, x: number, y: number, w: number, center = false, size = 8) {
  let s = size;
  doc.setFontSize(s);
  while (s > 5.5 && doc.getTextWidth(text) > w - 1.6) {
    s -= 0.5;
    doc.setFontSize(s);
  }
  let t = text;
  while (t.length > 1 && doc.getTextWidth(t) > w - 1.6) t = t.slice(0, -1);
  if (t !== text && t.length > 1) t = t.slice(0, -1) + "…";
  doc.text(t, center ? x + w / 2 : x + 0.8, y, { align: center ? "center" : "left" });
}

export async function foglioPdf(mese: string, nome: string, cognome: string, righe: FoglioRiga[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const [y, m] = mese.split("-").map(Number) as [number, number];

  // righe colorate e logo
  doc.setFillColor(...TEAL);
  doc.rect(0, 11.6, 136, 1.3, "F");
  doc.setFillColor(...RED);
  doc.rect(0, 13.6, 141, 1.3, "F");
  const logo = await logoDataUrl();
  if (logo) doc.addImage(logo, "PNG", 136.5, 3.5, 62, 18.6);

  // titolo con le iniziali rosse, come nel modello
  doc.setFont("times", "normal");
  let x = 12.7;
  for (const [txt, big, red] of [["F", 13, true], ["OGLIO ", 10, false], ["P", 13, true], ["RESENZE ", 10, false], ["3.0", 13, false]] as const) {
    doc.setFontSize(big);
    doc.setTextColor(...(red ? RED : TEAL));
    doc.text(txt, x, 29);
    x += doc.getTextWidth(txt);
  }

  const label = (first: string, rest: string, lx: number, ly: number) => {
    doc.setFontSize(11);
    doc.setTextColor(...RED);
    doc.text(first, lx, ly);
    const w = doc.getTextWidth(first);
    doc.setTextColor(...TEAL);
    doc.text(rest, lx + w, ly);
  };
  doc.setTextColor(...TEAL);
  doc.setFontSize(11);
  doc.text("del ", 105, 29);
  label("M", "ese di", 105 + doc.getTextWidth("del "), 29);
  label("N", "ome", 12.7, 39.4);
  label("C", "ognome", 105, 39.4);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.line(131, 31.8, 198, 31.8);
  doc.line(28, 42.3, 102, 42.3);
  doc.line(126.5, 42.3, 198, 42.3);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`${MONTHS[m - 1] ?? ""} ${y}`, 133, 30.6);
  doc.text(nome, 30, 41.1);
  doc.text(cognome, 128.5, 41.1);

  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.text("E' categoricamente vietato andare a capo nelle caselle della tabella sottostante", 103, 50, { align: "center" });

  // righe: un giorno per riga (1-31); se in un giorno ci sono più eventi, più righe per quel giorno
  const lines: Array<{ gg: number; r?: FoglioRiga }> = [];
  for (let gg = 1; gg <= 31; gg++) {
    const ofDay = righe.filter((r) => Number(r.data.slice(8, 10)) === gg);
    if (!ofDay.length) lines.push({ gg });
    else for (const r of ofDay) lines.push({ gg, r });
  }

  const top = 54.3;
  const headH = 14.6;
  const bodyH = 180.4;
  const rowH = Math.min(5.82, bodyH / lines.length);
  const left = COLS[0]!;
  const right = COLS[COLS.length - 1]!;

  // intestazione
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const heads = ["Gg", "Tipologia Evento", "Location", "Ruolo", "Tariffa"];
  heads.forEach((h, i) => doc.text(h, (COLS[i]! + COLS[i + 1]!) / 2, top + headH / 2 + 1, { align: "center" }));
  doc.text("Rimborso Spese", (COLS[5]! + COLS[8]!) / 2, top + 4, { align: "center" });
  ["Diaria", "Pernotti", "Viaggi"].forEach((h, i) => doc.text(h, (COLS[5 + i]! + COLS[6 + i]!) / 2, top + 10.6, { align: "center" }));

  // corpo
  const bodyTop = top + headH;
  lines.forEach((l, i) => {
    const ry = bodyTop + i * rowH;
    if (l.gg % 2 === 0) {
      doc.setFillColor(...BLUE);
      doc.rect(COLS[1]!, ry, right - COLS[1]!, rowH, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const ty = ry + rowH / 2 + 1.1;
    fit(doc, String(l.gg), COLS[0]!, ty, COLS[1]! - COLS[0]!, true);
    if (l.r) {
      const vals = [l.r.tipologia, l.r.location, l.r.ruolo, l.r.tariffa, l.r.diaria, l.r.pernotti, l.r.viaggi];
      vals.forEach((v, k) => fit(doc, v ?? "", COLS[k + 1]!, ty, COLS[k + 2]! - COLS[k + 1]!, k >= 3));
    }
  });

  // griglia
  const bottom = bodyTop + lines.length * rowH;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.15);
  for (let i = 0; i <= lines.length; i++) doc.line(left, bodyTop + i * rowH, right, bodyTop + i * rowH);
  doc.line(COLS[5]!, top + 5.4, right, top + 5.4);
  COLS.forEach((cx, i) => {
    const fromTop = i <= 5 || i === 8 ? top : top + 5.4;
    doc.setLineWidth(i === 0 || i === 8 || i === 1 ? 0.45 : 0.15);
    doc.line(cx, fromTop, cx, bottom);
  });
  doc.setLineWidth(0.45);
  doc.line(left, top, right, top);
  doc.line(left, bottom, right, bottom);
  doc.line(left, bodyTop, right, bodyTop);

  doc.save(`Foglio_Presenze_${mese}_${cognome}_${nome}.pdf`.replace(/\s+/g, "_"));
}
