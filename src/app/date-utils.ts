// Centralized date utility helpers used by multiple components (announcements, events, etc.)
// Keeping them as pure functions (no Angular injection needed) for easy tree-shaking.

/** Parse an ISO (YYYY-MM-DD or full ISO) date string into a Date object.
 *  If only a date part is provided (length 10), append T00:00:00 to avoid timezone shifting.
 */
export function parseIsoDate(str: string): Date {
  if (!str) return new Date('Invalid');
  return new Date(str + (str.length === 10 ? 'T00:00:00' : ''));
}

/** Return a Date at the start of the day (midnight) in local time. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Compute midnight timestamp for today (local). */
export function todayMidnightTs(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/** True if the given ISO date string is today. */
export function isIsoToday(str: string): boolean {
  const d = parseIsoDate(str);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

/** True if the ISO date is strictly in the past (before today's midnight). */
export function isIsoPast(str: string): boolean {
  const d = parseIsoDate(str);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < todayMidnightTs();
}

/** Days from today until the ISO date (0 if past). */
export function daysUntilIso(str: string): number {
  const d = parseIsoDate(str);
  if (isNaN(d.getTime())) return NaN;
  const target = startOfDay(d).getTime();
  const today = todayMidnightTs();
  if (target < today) return 0;
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

/** True if the ISO date is within next N days (exclusive of today & past). */
export function isIsoWithinNextDays(str: string, days: number): boolean {
  const d = parseIsoDate(str);
  if (isNaN(d.getTime())) return false;
  const target = startOfDay(d).getTime();
  const today = todayMidnightTs();
  if (target <= today) return false;
  const diffDays = (target - today) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

/** Format ISO date into a short readable display (fallback: original string). */
export function formatIsoDisplay(str: string | undefined): string {
  if (!str) return '';
  const d = parseIsoDate(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
