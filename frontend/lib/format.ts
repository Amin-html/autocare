export function fmtWhen(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const day = s.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const t = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day} · ${t(s)}–${t(new Date(endIso))}`;
}