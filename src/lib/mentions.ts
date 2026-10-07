/*
 * Tag "@Nome" della Taverna.
 * Un tag si crea SOLO scegliendo una persona dal menù: il menù prova a indovinare
 * chi si intende anche se il nome è scritto male (lettere mancanti, invertite, sbagliate).
 */

export interface MentionPerson {
  id: number | null;
  role: "admin" | "user";
  name: string;
}

/** minuscole e senza accenti, così "Èlena" e "elena" sono uguali */
export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** quante lettere bisogna cambiare per passare da a a b */
function distance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j]!;
      prev[j] = Math.min(up + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length]!;
}

/** quanto la parte scritta somiglia all'inizio di "target" (0 = uguale) */
function prefixDistance(q: string, target: string): number {
  let best = Infinity;
  // si confronta con inizi di lunghezza simile, per tollerare una lettera in più o in meno
  for (let len = Math.max(1, q.length - 1); len <= Math.min(target.length, q.length + 1); len++) {
    best = Math.min(best, distance(q, target.slice(0, len)));
  }
  return best;
}

function isSubsequence(q: string, target: string): boolean {
  let i = 0;
  for (const ch of target) if (ch === q[i]) i++;
  return i === q.length;
}

function strictRank<T extends MentionPerson>(q: string, people: T[]): Array<{ p: T; score: number }> {
  const qWords = q.split(" ");
  const qFlat = q.replace(/ /g, "");
  const scored: Array<{ p: T; score: number }> = [];
  for (const p of people) {
    const n = norm(p.name);
    const words = n.split(" ");
    const nFlat = n.replace(/ /g, "");
    let score = Infinity;
    if (n.startsWith(q)) score = 0;
    else if (qWords.every((w) => words.some((nw) => nw.startsWith(w)))) score = 1;
    else if (isSubsequence(qFlat, nFlat)) score = 2;
    else {
      // lettere sbagliate: si tollera circa una lettera ogni tre
      let d = prefixDistance(qFlat, nFlat);
      if (qWords.length === 1) d = Math.min(d, ...words.map((w) => prefixDistance(qFlat, w)));
      if (d <= Math.max(1, Math.floor(qFlat.length / 3))) score = 3 + d;
    }
    if (score < Infinity) scored.push({ p, score });
  }
  return scored.sort((a, b) => a.score - b.score);
}

/**
 * Le persone da proporre per quello che si è scritto dopo la @, dalla più probabile,
 * e quante lettere del testo scritto verranno sostituite dal nome scelto.
 * Se dopo il nome si è già continuato a scrivere ("@elena ciao"), si propone comunque Elena
 * e si sostituisce solo "elena". Restituisce null quando non si sta cercando un nome.
 */
export function rankPeople<T extends MentionPerson>(query: string, people: T[], max = 6): { people: T[]; length: number } | null {
  if (!query.trim()) return /^\s/.test(query) ? null : { people: people.slice(0, max), length: 0 };
  if (/^\s/.test(query)) return null; // "@ " da sola non è un tag
  const raw = query.split(/(\s+)/); // parole e spazi, per sapere quante lettere sostituire
  const words = raw.filter((_, i) => i % 2 === 0).filter(Boolean);
  for (let k = Math.min(words.length, 3); k >= 1; k--) {
    const q = norm(words.slice(0, k).join(" "));
    const found = strictRank(q, people);
    if (found.length) {
      const length = raw.slice(0, 2 * k - 1).join("").length;
      return { people: found.slice(0, max).map((f) => f.p), length };
    }
  }
  // nessuno somiglia: con una parola sola si propongono comunque i nomi più vicini
  if (words.length > 1) return null;
  const qFlat = norm(words[0] ?? "");
  const near = people
    .map((p) => ({ p, d: Math.min(...norm(p.name).split(" ").map((w) => prefixDistance(qFlat, w))) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((s) => s.p);
  return { people: near, length: query.length };
}

export interface TagRange {
  start: number; // posizione della @
  end: number; // subito dopo il nome
  person: MentionPerson;
}

/** Dove si trovano nel testo i tag scelti dal menù (ogni "@Nome" di una persona scelta). */
export function findTags(text: string, chosen: MentionPerson[]): TagRange[] {
  const out: TagRange[] = [];
  const names = [...chosen].sort((a, b) => b.name.length - a.name.length);
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "@" || (i > 0 && !/\s/.test(text[i - 1] ?? ""))) continue;
    const p = names.find((n) => text.startsWith("@" + n.name, i));
    if (p) {
      out.push({ start: i, end: i + 1 + p.name.length, person: p });
      i += p.name.length;
    }
  }
  return out;
}

/** La "@qualcosa" che si sta scrivendo dove c'è il cursore (esclusi i tag già fatti). */
export function mentionAt(text: string, caret: number, tags: TagRange[]): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const at = before.lastIndexOf("@");
  if (at < 0) return null;
  if (at > 0 && !/\s/.test(before[at - 1] ?? "")) return null; // la @ deve stare all'inizio di una parola
  if (tags.some((t) => t.start === at)) return null; // è un tag già scelto
  const query = before.slice(at + 1);
  if (query.length > 30 || /\n/.test(query)) return null;
  return { start: at, query };
}

export const samePerson = (a: MentionPerson, b: MentionPerson) => a.role === b.role && (a.role === "admin" || a.id === b.id);
