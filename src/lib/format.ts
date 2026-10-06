import type { EventStatus, ParticipantStatus } from "./api";

export const MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const WEEKDAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

function parse(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function formatDate(iso: string): string {
  const d = parse(iso);
  if (!d) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function formatDateLong(iso: string): string {
  const d = parse(iso);
  if (!d) return iso;
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function dayNumber(iso: string): string {
  const d = parse(iso);
  return d ? String(d.getDate()) : "";
}
export function monthShort(iso: string): string {
  const d = parse(iso);
  return d ? (MONTHS[d.getMonth()] ?? "").slice(0, 3) : "";
}
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function timeRange(start: string, end: string): string {
  if (start && end) return `${start}–${end}`;
  return start || end || "orario da definire";
}

/** "2 ore fa", "ieri"… a partire da una data del database (UTC). */
export function timeAgo(sqlDate: string): string {
  const t = new Date(sqlDate.includes("T") ? sqlDate : sqlDate.replace(" ", "T") + "Z").getTime();
  if (Number.isNaN(t)) return "";
  const min = Math.round((Date.now() - t) / 60000);
  if (min < 1) return "ora";
  if (min < 60) return `${min} min fa`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h fa`;
  const g = Math.round(h / 24);
  return g === 1 ? "ieri" : `${g} g fa`;
}

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  richiesta: "Disponibilità richiesta",
  da_definire: "Da definire",
  confermato: "Confermato",
  annullato: "Annullato",
  chiuso: "Chiuso",
};

export const PARTICIPANT_LABEL: Record<ParticipantStatus, string> = {
  pending: "In attesa di risposta",
  available: "Disponibile",
  unavailable: "Non disponibile",
  confirmed: "Confermato",
  rejected: "Non selezionato",
};

export const SKILL_SUGGESTIONS = [
  "Attore", "Attrice", "Performer", "Animatore", "Rievocatore", "Cavaliere", "Combattimento scenico", "Fuoco",
  "Giocoliere", "Trampoli", "Trucco", "Horror", "Medievale", "Pirata", "Magia", "Danza", "Canto", "Musicista",
  "Cosplayer", "Public speaking", "Gestione pubblico", "Bambini", "Tecnico", "Luci", "Audio", "Allestimenti", "Autista",
];
