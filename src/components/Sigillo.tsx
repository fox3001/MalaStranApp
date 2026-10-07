import { useMemo } from "react";
import { GLYPH_BOUNDS } from "@/lib/glyph-bounds";

/*
 * Il "sigillo" al posto della foto: due iniziali in gotico, sempre centrate,
 * dentro un anello con una finta scrittura magica a inchiostro.
 * La scrittura non significa nulla ed è diversa per ogni nome (dipende dal nome).
 */

const BOR = "#5B1A1E";
const PAPER = "#F3ECDD";
const GOLD = "#E2C88F";
const UPM = 2048;

function hashName(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed || 1;
  return {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    uni(lo: number, hi: number) {
      return lo + (hi - lo) * this.next();
    },
    int(lo: number, hi: number) {
      return Math.floor(lo + (hi - lo + 1) * this.next());
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)]!;
    },
  };
}
type Rng = ReturnType<typeof rng>;
const f = (n: number) => n.toFixed(2);

/** Una "parola" corsiva inventata: gobbe, occhielli, aste, code. */
function word(r: Rng): [number, string] {
  let x = 0;
  const d = ["M0,0"];
  let extra = "";
  const n = r.int(3, 7);
  for (let i = 0; i < n; i++) {
    const k = r.pick(["hump", "hump", "loop", "desc", "e", "e", "spike", "flat"]);
    let w = 1.5;
    if (k === "hump") { d.push(`C${f(x + 0.3)},-2.6 ${f(x + 1.3)},-2.6 ${f(x + 1.6)},0`); w = 1.6; }
    else if (k === "loop") { d.push(`C${f(x + 0.2)},-2 ${f(x + 1.7)},-5.2 ${f(x + 0.9)},-5.2 C${f(x + 0.1)},-5.2 ${f(x + 0.4)},-1 ${f(x + 1.5)},0`); }
    else if (k === "desc") { d.push(`C${f(x + 0.6)},1 ${f(x + 0.7)},3.4 ${f(x + 0.1)},3.4 C${f(x - 0.5)},3.4 ${f(x + 0.6)},.6 ${f(x + 1.5)},0`); }
    else if (k === "e") { d.push(`C${f(x + 0.9)},-.5 ${f(x + 1.3)},-1.9 ${f(x + 0.6)},-1.9 C${f(x - 0.1)},-1.9 ${f(x)},0 ${f(x + 1.3)},0`); w = 1.3; }
    else if (k === "spike") { d.push(`L${f(x + 0.4)},-3.2 L${f(x + 0.9)},0`); w = 0.9; }
    else { d.push(`C${f(x + 0.4)},.8 ${f(x + 1.1)},.8 ${f(x + 1.5)},0`); }
    if (r.next() < 0.15) extra += `<circle fill="none" cx="${f(x + w / 2)}" cy="-3.6" r=".38"/>`;
    if (r.next() < 0.08) extra += `<path d="M${f(x - 0.4)},-2.4 H${f(x + w + 0.4)}"/>`;
    x += w;
  }
  return [x, `<path d="${d.join(" ")}"/>${extra}`];
}

function sep(r: Rng): [number, string] {
  if (r.next() < 0.5) return [2.6, '<circle fill="none" cx="1.3" cy="-1.3" r="1.1"/><path d="M1.3,-3.8 V1.4"/>'];
  return [2.4, '<path d="M1.2,-2.8 V.4 M-.2,-1.2 H2.6 M.2,-2.3 L2.2,-.1 M2.2,-2.3 L.2,-.1"/>'];
}

function fakeScript(seed: number, rad = 47.5): string {
  const r = rng(seed);
  const circ = 2 * Math.PI * rad;
  const items: [number, string][] = [];
  let total = 0;
  for (;;) {
    const it = word(r);
    items.push(it);
    total += it[0] + 2.2;
    if (r.next() < 0.45) {
      const s = sep(r);
      items.push(s);
      total += s[0] + 2.2;
    }
    if (total > circ - 14) break;
  }
  const scale = (circ - 1) / total;
  let pos = 0;
  let out = "";
  for (const [w, g] of items) {
    const a = (((pos + w / 2) * scale) / circ) * 360;
    const x = 60 + rad * Math.sin((a * Math.PI) / 180);
    const y = 60 - rad * Math.cos((a * Math.PI) / 180);
    out += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(a)}) translate(${f(-w / 2)},1.2)">${g}</g>`;
    pos += w + 2.2;
  }
  return `<g fill="none" stroke="${GOLD}" stroke-width=".55" stroke-linecap="round" stroke-linejoin="round">${out}</g>`;
}

function bounds(ch: string): [number, number] {
  return GLYPH_BOUNDS[ch] ?? [60, 1400];
}

/** Le due iniziali centrate esattamente (misure prese dal font). */
function letters(a: string, b: string, fs0: number, maxw: number): string {
  const ba = bounds(a);
  const bb = bounds(b);
  const wa = (ba[1] - ba[0]) / UPM;
  const wb = (bb[1] - bb[0]) / UPM;
  const fs = Math.min(fs0, maxw / (wa + wb + 0.24));
  const gap = 0.24 * fs;
  const total = (wa + wb) * fs + gap;
  const x0 = 60 - total / 2;
  const s = fs / UPM;
  const base = 60 + 730 * s;
  const xa = x0 - ba[0] * s;
  const xd = x0 + wa * fs + gap / 2;
  const xb = x0 + wa * fs + gap - bb[0] * s;
  const font = "'UnifrakturMaguntia', serif";
  return (
    `<text x="${f(xa)}" y="${f(base)}" font-family="${font}" font-size="${fs.toFixed(1)}" fill="${PAPER}">${a}</text>` +
    `<path d="M${f(xd)} 57.4 l2 2.6 -2 2.6 -2 -2.6z" fill="${GOLD}"/>` +
    `<text x="${f(xb)}" y="${f(base)}" font-family="${font}" font-size="${fs.toFixed(1)}" fill="${GOLD}">${b}</text>`
  );
}

export function initialsOf(name: string): [string, string] {
  const clean = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = (clean[0]?.[0] ?? "M").toUpperCase();
  const second = (clean.length > 1 ? clean[clean.length - 1]![0] : clean[0]?.[1] ?? "S")!.toUpperCase();
  return [first, second];
}

export function sigilloSvg(name: string, ring = true): string {
  const [a, b] = initialsOf(name);
  const inner = ring
    ? `<circle cx="60" cy="60" r="56" fill="none" stroke="${GOLD}" stroke-width="0.8"/><circle cx="60" cy="60" r="41" fill="none" stroke="${GOLD}" stroke-width="0.8"/>` +
      fakeScript(hashName(name)) +
      letters(a, b, 36, 62)
    : `<circle cx="60" cy="60" r="54" fill="none" stroke="${GOLD}" stroke-width="2"/>` + letters(a, b, 52, 84);
  return `<circle cx="60" cy="60" r="59" fill="${BOR}"/>${inner}`;
}

/**
 * Sigillo con le iniziali. Sotto i 44px si usa la versione "mini" (solo lettere e bordo),
 * perché la scrittura magica diventerebbe una macchia.
 */
export function Sigillo({ name, size = 52, className }: { name: string; size?: number; className?: string }) {
  const ring = size >= 44;
  const markup = useMemo(() => sigilloSvg(name || "?", ring), [name, ring]);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Sigillo di ${name}`}
      className={className}
      style={{ flex: "none", display: "block" }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
