// Collegamento con il backend (Cloudflare Worker).
// Tutte le pagine leggono e salvano i dati SOLO da qui: niente dati finti.

import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

export const API_BASE_URL = (import.meta.env["VITE_API_BASE_URL"] || "/api").replace(/\/$/, "");
export const ADMIN_TOKEN_KEY = "malastrana-admin-token";
export const USER_TOKEN_KEY = "malastrana-user-token";

export type Area = "admin" | "user";

export function areaFromPath(pathname: string): Area | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/u")) return "user";
  return null;
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* archivio del browser non disponibile */
  }
}

export function getToken(area: Area): string | null {
  return safeGet(area === "admin" ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY);
}
export function setToken(area: Area, token: string | null) {
  safeSet(area === "admin" ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY, token);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Chiamata al backend. L'area decide quale "braccialetto" (token) usare. */
export async function api<T = unknown>(area: Area | null, path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const token = area ? getToken(area) : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : null,
    });
  } catch {
    throw new ApiError("Impossibile contattare il server. Controlla la connessione.", 0);
  }
  const data = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
  if (!response.ok || (data && data.success === false)) {
    if (response.status === 401 && area) {
      setToken(area, null);
      window.dispatchEvent(new CustomEvent("malastrana:logout", { detail: area }));
    }
    throw new ApiError(data?.error || `Errore ${response.status}`, response.status);
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Tipi dei dati che arrivano dal backend
// ---------------------------------------------------------------------------

export interface User {
  id: number;
  nome: string;
  cognome: string;
  username: string;
  email: string;
  telefono: string;
  bio: string;
  note: string;
  qualifica: string;
  attivo: boolean;
  competenze: string[];
  competenzeFlag: string[];
  costumi?: string[];
  created_at: string;
}

export interface Costume {
  id: number;
  nome: string;
  categoria: string | null;
  note: string | null;
}

export type EventStatus = "richiesta" | "da_definire" | "confermato" | "annullato" | "chiuso";
export type ParticipantStatus = "pending" | "available" | "unavailable" | "confirmed" | "rejected";

export interface MalEvent {
  id: number;
  code: string;
  nome: string;
  data: string;
  ora_ritrovo: string;
  ora_inizio: string;
  ora_fine: string;
  luogo: string;
  tipo: string;
  descrizione: string;
  info_operative: string;
  referente_nome: string;
  referente_telefono: string;
  compenso: string;
  compenso_visibile: boolean;
  note_admin: string;
  stato: EventStatus;
  motivo_annullamento: string;
  conteggi?: { invitati: number; in_attesa: number; disponibili: number; confermati: number; righe_bolla: number; danni: number };
}

export interface Participant {
  user_id: number;
  nome: string;
  cognome: string;
  username: string;
  qualifica: string | null;
  stato: ParticipantStatus;
  ruolo_evento: string | null;
  nota_user: string | null;
  nota_admin: string | null;
  responded_at: string | null;
}

export interface LoadRow {
  id: number;
  event_id: number;
  item: string;
  categoria: string;
  codice: string;
  taglia: string;
  quantita: number;
  assigned_user_id: number | null;
  assigned_name: string;
  present: boolean;
  returned: boolean;
  damaged: boolean;
  comment: string;
  updated_by: string;
  updated_at: string;
}

export interface MyEvent {
  id: number;
  code: string;
  nome: string;
  data: string;
  ora_ritrovo: string;
  ora_inizio: string;
  ora_fine: string;
  luogo: string;
  tipo: string;
  descrizione: string;
  stato: EventStatus;
  motivo_annullamento: string;
  info_operative: string;
  referente_nome: string;
  referente_telefono: string;
  compenso: string;
  mio_stato?: ParticipantStatus;
  ruolo_evento?: string;
  mie_righe_bolla?: number;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  event_code: string | null;
}

export interface ReportRow extends LoadRow {
  event_code: string;
  event_nome: string;
  event_data: string;
}

// ---------------------------------------------------------------------------
// Letture (si aggiornano da sole ogni 30 secondi)
// ---------------------------------------------------------------------------

const REFRESH = 30_000;

export function useApiQuery<T>(area: Area, key: QueryKey, path: string, enabled = true) {
  return useQuery<T, ApiError>({
    queryKey: [area, ...key],
    queryFn: () => api<T>(area, path),
    refetchInterval: REFRESH,
    refetchOnWindowFocus: true,
    retry: (count, err) => err.status !== 401 && err.status !== 403 && err.status !== 404 && count < 2,
    enabled,
  });
}

export const useAdminUsers = () => useApiQuery<{ users: User[] }>("admin", ["users"], "/admin/users");
export const useAdminUser = (id: string) =>
  useApiQuery<{ user: User; costumes: Costume[]; events: Array<{ code: string; nome: string; data: string; stato: ParticipantStatus; stato_evento: EventStatus }> }>(
    "admin",
    ["users", id],
    `/admin/users/${id}`,
  );
export const useAdminEvents = () => useApiQuery<{ events: MalEvent[] }>("admin", ["events"], "/admin/events");
export const useAdminEvent = (code: string) =>
  useApiQuery<{ event: MalEvent; participants: Participant[]; load_rows: LoadRow[] }>("admin", ["events", code], `/admin/events/${encodeURIComponent(code)}`);
export const useReport = (code: string, onlyIssues: boolean) =>
  useApiQuery<{ rows: ReportRow[] }>(
    "admin",
    ["report", code, onlyIssues],
    `/admin/report?${new URLSearchParams({ ...(code ? { event: code } : {}), ...(onlyIssues ? { solo_problemi: "1" } : {}) }).toString()}`,
  );

export const useProfile = () => useApiQuery<{ user: User }>("user", ["profile"], "/profile");
export const useMyCostumes = () => useApiQuery<{ costumes: Costume[] }>("user", ["costumes"], "/profile/costumes");
export const useMyEvents = () => useApiQuery<{ events: MyEvent[] }>("user", ["events"], "/my/events");
export const useMyEvent = (code: string) =>
  useApiQuery<{
    event: MyEvent;
    partecipazione: { stato: ParticipantStatus; ruolo_evento: string; nota_user: string; nota_admin: string };
    team: Array<{ nome: string; cognome: string; ruolo_evento: string | null }>;
    load_rows: LoadRow[];
  }>("user", ["events", code], `/my/events/${encodeURIComponent(code)}`);

export const useNotifications = (area: Area) =>
  useApiQuery<{ unread: number; notifications: Notification[] }>(area, ["notifications"], "/notifications");

// ---------------------------------------------------------------------------
// Scritture: dopo ogni salvataggio si ricaricano i dati collegati
// ---------------------------------------------------------------------------

export function useApiMutation<V>(area: Area, build: (vars: V) => { path: string; method: string; body?: unknown }, opts: { success?: string; invalidate?: QueryKey[] } = {}) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, V>({
    mutationFn: (vars) => {
      const req = build(vars);
      return api(area, req.path, { method: req.method, body: req.body });
    },
    onSuccess: () => {
      if (opts.success) toast.success(opts.success);
      const keys = opts.invalidate ?? [[]];
      for (const k of keys) void qc.invalidateQueries({ queryKey: [area, ...k] });
    },
    onError: (err) => toast.error(err.message),
  });
}
