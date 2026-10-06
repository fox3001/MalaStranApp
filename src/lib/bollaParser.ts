// Lettura di una bolla di carico da file (PDF o Excel) nel formato Malastrana:
// colonne SEZIONE (scritta in verticale) | GRUPPO | NOME | PREP | check entrata | check uscita | NOTE | (note extra)
// Il risultato è un elenco di voci pronte da caricare nell'evento.

export interface ParsedRow {
  categoria: string;
  item: string;
  quantita: number;
  note: string;
}

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  w: number;
  vertical: boolean;
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const norm = (s: string) =>
  clean(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function titleCase(s: string): string {
  const t = clean(s);
  if (t && t === t.toUpperCase() && /[A-Z]/.test(t)) return t.toLowerCase().replace(/(^|[\s(.'-])(\p{L})/gu, (_m, a: string, b: string) => a + b.toUpperCase());
  return t;
}

/** "Vademecum del detective, 80" → nome e quantità separati */
export function splitQuantity(name: string): { item: string; quantita: number } {
  const m = /^(.*?),\s*(\d+)\s*$/.exec(clean(name));
  if (m && m[1]) return { item: m[1].trim(), quantita: Number(m[2]) };
  return { item: clean(name), quantita: 1 };
}

function category(section: string, group: string): string {
  return [titleCase(section), titleCase(group)].filter(Boolean).join(" · ");
}

interface Row {
  item: PdfTextItem;
  y: number;
  h: number;
  note: string;
  extra: string;
}

/** Raggruppa le righe di testo vicine (stessa cella su più righe). */
function cells(frags: PdfTextItem[]): PdfTextItem[][] {
  const sorted = [...frags].sort((a, b) => b.y - a.y || a.x - b.x);
  const out: PdfTextItem[][] = [];
  for (const f of sorted) {
    const last = out[out.length - 1];
    if (last && last[last.length - 1]!.y - f.y <= 7.5) last.push(f);
    else out.push([f]);
  }
  return out;
}

/**
 * Assegna le righe alle etichette di gruppo (celle unite, testo centrato).
 * Le prime righe possono restare senza etichetta (continuazione dalla pagina prima) solo se separate da una riga vuota.
 */
function assignGroups(rows: Row[], labelsY: number[]): { prefix: number; seg: number[] } {
  const n = rows.length;
  const k = labelsY.length;
  if (!k) return { prefix: n, seg: [] };
  const top = (i: number) => rows[i]!.y + rows[i]!.h / 2;
  const bottom = (b: number) => (b + 1 < n ? top(b + 1) : rows[b]!.y - rows[b]!.h / 2);
  const blankAfter = (i: number) => i + 1 < n && rows[i]!.y - rows[i + 1]!.y > (rows[i]!.h + rows[i + 1]!.h) / 2 + 5;
  // una cella unita può finire con righe vuote, ma non ne ha in mezzo a voci scritte
  const inner = (a: number, b: number) => {
    for (let i = a; i < b; i++) if (blankAfter(i)) return 1000;
    return 0;
  };
  const cost = (a: number, b: number, j: number) => Math.abs((top(a) + bottom(b)) / 2 - labelsY[j]!) + inner(a, b);
  let best = { total: Number.POSITIVE_INFINITY, prefix: 0, seg: [] as number[] };
  for (let p = 0; p <= n - k; p++) {
    if (p > 0 && !blankAfter(p - 1)) continue;
    const m = n - p;
    const INF = Number.POSITIVE_INFINITY;
    const dp: number[][] = Array.from({ length: k + 1 }, () => Array(m + 1).fill(INF));
    const from: number[][] = Array.from({ length: k + 1 }, () => Array(m + 1).fill(-1));
    dp[0]![0] = 0;
    for (let j = 1; j <= k; j++)
      for (let i = j; i <= m; i++)
        for (let s = j - 1; s < i; s++) {
          const prev = dp[j - 1]![s]!;
          if (prev === INF) continue;
          const c = prev + cost(p + s, p + i - 1, j - 1);
          if (c < dp[j]![i]!) {
            dp[j]![i] = c;
            from[j]![i] = s;
          }
        }
    if (dp[k]![m]! < best.total) {
      const seg = Array(m).fill(0);
      let i = m;
      for (let j = k; j >= 1; j--) {
        const s = from[j]![i]!;
        for (let r = s; r < i; r++) seg[r] = j - 1;
        i = s;
      }
      best = { total: dp[k]![m]!, prefix: p, seg };
    }
  }
  return best;
}

/** Interpreta le scritte di un PDF (una lista per pagina). */
export function parseBollaPdf(pages: PdfTextItem[][]): ParsedRow[] {
  const result: ParsedRow[] = [];
  let section = "";
  let lastGroup = "";

  for (const items of pages) {
    const header = items.find((i) => norm(i.str) === "nome");
    const prep = items.find((i) => norm(i.str) === "prep");
    const noteH = items.find((i) => norm(i.str) === "note");
    if (!header || !noteH) continue;
    const nameCenter = header.x + header.w / 2;
    const prepX = prep ? prep.x : nameCenter + 60;
    const nameLeft = nameCenter - (prepX - nameCenter);
    const checks = items.filter((i) => /^(check|animatore|entrata|uscita)$/.test(norm(i.str)));
    const checksRight = checks.length ? Math.max(...checks.map((c) => c.x + c.w)) : prepX + 70;
    const noteCenter = noteH.x + noteH.w / 2;
    const noteRight = noteCenter + (noteCenter - checksRight) - 2;
    const headerBottom = Math.min(header.y, ...checks.map((c) => c.y)) - 2;

    const body = items.filter((i) => i.y < headerBottom && clean(i.str));
    const center = (i: PdfTextItem) => i.x + i.w / 2;
    const names = body.filter((i) => !i.vertical && center(i) > nameLeft && center(i) < prepX - 2).sort((a, b) => b.y - a.y);
    if (!names.length) continue;
    const noteCells = cells(body.filter((i) => !i.vertical && center(i) > checksRight && center(i) < noteRight));
    const extraCells = cells(body.filter((i) => !i.vertical && i.x >= noteRight));
    const groups = body.filter((i) => !i.vertical && center(i) <= nameLeft).sort((a, b) => b.y - a.y);
    const sections = body.filter((i) => i.vertical && !/^oac\d*$/i.test(norm(i.str)));

    const rows: Row[] = names.map((item) => ({ item, y: item.y, h: 9, note: "", extra: "" }));
    const nearest = (y: number) => rows.reduce((b, r) => (Math.abs(r.y - y) < Math.abs(b.y - y) ? r : b), rows[0]!);
    for (const c of noteCells) {
      const cy = (c[0]!.y + c[c.length - 1]!.y) / 2;
      const r = nearest(cy);
      r.note = clean([r.note, ...c.map((f) => f.str)].join(" "));
      r.h = Math.max(r.h, c.length * 7 + 2);
    }
    for (const c of extraCells) {
      const cy = (c[0]!.y + c[c.length - 1]!.y) / 2;
      const r = nearest(cy);
      r.extra = clean([r.extra, ...c.map((f) => f.str)].join(" "));
    }

    const { prefix, seg } = assignGroups(
      rows,
      groups.map((g) => g.y),
    );
    rows.forEach((row, i) => {
      // la sezione (scritta verticale) vale dalla prima riga sotto il suo inizio in poi
      const sec = sections.find((s) => row.y <= s.y + s.w && row.y > s.y + s.w - 40 && rows.findIndex((r) => r.y <= s.y + s.w) === i);
      if (sec) section = clean(sec.str);
      const group = i < prefix ? lastGroup : clean(groups[seg[i - prefix]!]!.str);
      const { item, quantita } = splitQuantity(row.item.str);
      result.push({ categoria: category(section, group), item, quantita, note: [row.note, row.extra].filter(Boolean).join(" — ") });
      if (i === rows.length - 1) lastGroup = group;
    });
  }
  return result;
}

/** Interpreta un foglio Excel/CSV: righe come matrici di celle. Riconosce sia il modulo Malastrana sia un elenco semplice. */
export function parseBollaSheet(rows: unknown[][]): ParsedRow[] {
  const txt = (v: unknown) => clean(String(v ?? ""));
  const headerIdx = rows.findIndex((r) => r.some((c) => ["nome", "oggetto", "articolo", "voce"].includes(norm(txt(c)))));
  if (headerIdx < 0) return [];
  const header = rows[headerIdx]!.map((c) => norm(txt(c)));
  const col = (...names: string[]) => header.findIndex((h) => names.some((n) => h === n || h.startsWith(n)));
  const nameCol = col("nome", "oggetto", "articolo", "voce");
  const qtyCol = col("quantita", "qta", "q.ta", "pezzi");
  const sectionCol = col("sezione");
  const groupCol = col("gruppo", "personaggio", "categoria");
  const noteCol = col("note", "destinazione");
  // colonne prima del nome senza intestazione: sezione e gruppo (celle unite → si ripete il valore sopra)
  const leftCols = Array.from({ length: Math.max(0, nameCol) }, (_, i) => i).filter((i) => i !== sectionCol && i !== groupCol);
  const sCol = sectionCol >= 0 ? sectionCol : leftCols.length >= 2 ? leftCols[0]! : -1;
  const gCol = groupCol >= 0 ? groupCol : leftCols.length >= 1 ? leftCols[leftCols.length - 1]! : -1;
  const checkCols = header.map((h, i) => (/^(prep|check|entrata|uscita|animatore)/.test(h) ? i : -1)).filter((i) => i >= 0);
  const lastKnown = Math.max(nameCol, noteCol, qtyCol, ...checkCols);

  const out: ParsedRow[] = [];
  let section = "";
  let group = "";
  for (const r of rows.slice(headerIdx + 1)) {
    const name = txt(r[nameCol]);
    const s = sCol >= 0 ? txt(r[sCol]) : "";
    const g = gCol >= 0 ? txt(r[gCol]) : "";
    if (s && !/^oac\d*$/i.test(s) && s !== section) {
      section = s;
      group = "";
    }
    if (g) group = g;
    if (!name) continue;
    if (["nome", "oggetto"].includes(norm(name))) continue; // intestazione ripetuta
    const split = splitQuantity(name);
    const q = qtyCol >= 0 ? Number(txt(r[qtyCol])) : NaN;
    const extra = r.slice(lastKnown + 1).map(txt);
    const note = [noteCol >= 0 ? txt(r[noteCol]) : "", ...extra].filter(Boolean).join(" — ");
    out.push({ categoria: category(section, group), item: split.item, quantita: Number.isInteger(q) && q > 0 ? q : split.quantita, note });
  }
  return out;
}
