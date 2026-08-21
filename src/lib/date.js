// Uses local calendar fields, never toISOString() — that converts to UTC and silently shifts
// the date backward in any timezone ahead of UTC (e.g. IST, +5:30).
export function todayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
