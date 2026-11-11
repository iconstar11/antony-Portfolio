/** Placeholder helpers: any string containing "TODO" is treated as unfinished. */
export const hasTodo = (s?: string) => !!s && s.includes("TODO");

/** Splits "Real text. TODO: note" → { text: "Real text.", todo: "note" }. */
export function splitTodo(s: string): { text: string; todo: string | null } {
  const i = s.indexOf("TODO");
  if (i === -1) return { text: s, todo: null };
  return {
    text: s.slice(0, i).trim(),
    todo: s.slice(i + 4).replace(/^[:\s]+/, "").trim(),
  };
}

/** A link is usable if it has a real href (not empty / not a TODO). */
export const isLive = (href?: string) => !!href && !hasTodo(href);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-04" → { y: 2025, m: 3 }, "2022" → month defaults to start/end of year. */
export function parseYm(s: string, edge: "start" | "end") {
  if (s === "present") {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), hasMonth: true, present: true };
  }
  const [y, m] = s.split("-").map(Number);
  return {
    y,
    m: m ? m - 1 : edge === "start" ? 0 : 11,
    hasMonth: !!m,
    present: false,
  };
}

export function formatYm(s: string, edge: "start" | "end") {
  const p = parseYm(s, edge);
  if (p.present) return "Present";
  return p.hasMonth ? `${MONTHS[p.m]} ${p.y}` : `${p.y}`;
}

/** Fractional year, used to position timeline bars. */
export function toYearFloat(s: string, edge: "start" | "end") {
  const p = parseYm(s, edge);
  return p.y + (edge === "end" ? p.m + 1 : p.m) / 12;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
