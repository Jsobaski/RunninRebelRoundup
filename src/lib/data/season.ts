/**
 * The current college basketball season, in ESPN's convention (labeled by
 * the calendar year the season *ends* in — the 2025-26 season is "2026").
 *
 * This is computed from the current date rather than hardcoded, on purpose:
 * a fixed value like "2026" is only correct for a few months and then
 * silently starts returning last season's schedule/stats once the season
 * rolls over. Season the returned label with NEXT_PUBLIC_SEASON only if you
 * need to pin it (e.g. testing against a specific past season).
 */
export function currentEspnSeason(now: Date = new Date()): string {
  if (process.env.NEXT_PUBLIC_SEASON) return process.env.NEXT_PUBLIC_SEASON;

  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  // Aug-Dec: the season starting this fall is the "current" one, and it's
  // labeled by the year it concludes in (next calendar year).
  // Jan-Jul: the season that started last fall is still the most recent
  // one, labeled by this calendar year.
  return String(month >= 8 ? year + 1 : year);
}
