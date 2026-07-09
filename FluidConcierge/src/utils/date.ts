export function calcDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  // Reset hours to midnight to compare only dates
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(e.getTime() - s.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}
