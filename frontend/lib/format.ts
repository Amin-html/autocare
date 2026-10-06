export function fmtWhen(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const day = s.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const t = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day} · ${t(s)}–${t(new Date(endIso))}`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}