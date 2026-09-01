const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const TOKEN_KEY = "malastrana-auth-token";
const USER_KEY = "malastrana-auth-user";

export type AuthUser = { id: number | "admin"; nome: string; cognome: string; username: string; role: "admin" | "user" };

export function buildUsername(nome: string, cognome: string) {
  const normalize = (value: string) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();
  return `${normalize(nome)}.${normalize(cognome)}`;
}

export function getAuthToken(): string | null { return window.localStorage.getItem(TOKEN_KEY); }
export function clearAuth() { window.localStorage.removeItem(TOKEN_KEY); window.localStorage.removeItem(USER_KEY); }

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || `Errore API (${response.status})`);
  return data;
}

export async function login(username: string, password: string) {
  const data = await request<{ success: true; token: string; user: AuthUser }>("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
  window.localStorage.setItem(TOKEN_KEY, data.token); window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function validateSession() {
  if (!getAuthToken()) return null;
  try { const data = await request<{ success: true; user: AuthUser }>("/api/me"); window.localStorage.setItem(USER_KEY, JSON.stringify(data.user)); return data.user; }
  catch { clearAuth(); return null; }
}

export async function logout() {
  try { if (getAuthToken()) await request("/api/logout", { method: "POST", body: "{}" }); }
  finally { clearAuth(); }
}

export async function createCollaborator(input: { nome: string; cognome: string; email?: string; password?: string }) {
  return request<{ success: true; user: { id: number; nome: string; cognome: string; username: string; email: string | null; role: "user" } }>("/api/admin/users", { method: "POST", body: JSON.stringify(input) });
}

export async function getAdminCollaborator(id: string) {
  return request<{ success: true; user: { id: number; nome: string; cognome: string; username: string; email: string | null; ruolo: string; created_at: string } }>(`/api/admin/users/${encodeURIComponent(id)}`);
}

export async function changeCollaboratorPassword(id: string, password: string) {
  return request<{ success: true }>(`/api/admin/users/${encodeURIComponent(id)}/password`, { method: "PATCH", body: JSON.stringify({ password }) });
}
