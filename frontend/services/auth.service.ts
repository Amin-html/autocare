const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "client" | "manager" | "master" | "admin";
  avatar_url: string | null;
}

export async function register(data: { email: string; password: string; full_name: string }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Registration failed");
  return res.json() as Promise<User>;
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
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