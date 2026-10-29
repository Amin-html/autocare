const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "client" | "manager" | "master" | "admin";
  avatar_url: string | null;
}

const NETWORK_ERROR = "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.";

/** fetch, который при сетевой ошибке даёт понятное сообщение вместо «Failed to fetch». */
async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(NETWORK_ERROR);
  }
}

/** Достаёт текст ошибки из ответа FastAPI (detail бывает строкой или списком, например при 422). */
async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  const detail = body && typeof body === "object" ? (body as { detail?: unknown }).detail : undefined;
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => (item && typeof item === "object" && "msg" in item ? String((item as { msg: unknown }).msg) : String(item)))
      .join("; ");
  }
  return fallback;
}

export async function register(data: { email: string; password: string; full_name: string }) {
  const res = await safeFetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await readError(res, "Не удалось зарегистрироваться. Попробуйте ещё раз."));
  return res.json() as Promise<User>;
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password });
  const res = await safeFetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(await readError(res, "Не удалось войти. Попробуйте ещё раз."));
  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data.access_token as string;
}

export async function getMe() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json() as Promise<User>;
}

export function logout() {
  localStorage.removeItem("token");
}