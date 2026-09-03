import type { Game } from "@/lib/data/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function offsetDate(days: number, hour: number): string {
  const d = new Date(Date.now() + days * DAY_MS);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/**
 * Fallback schedule used only when the live ESPN adapter is unavailable.
 * Deliberately generic ("Placeholder Opponent", "Venue TBD") and computed
 * relative to today rather than fixed dates — real-sounding team names and
 * hardcoded dates are exactly what made an earlier version of this file
 * mislead users when it silently served instead of live data. Never put a
 * real team name or score here.
 */
export function getSeedSchedule(): Game[] {
  return [
    {
      id: "seed-3",
      date: offsetDate(7, 19),
      status: "scheduled",
      venue: "Venue TBD",
      isHome: true,
      isNeutralSite: false,
      opponent: { id: "seed-opp-3", name: "Placeholder Opponent C", shortName: "Opponent C", abbreviation: "PHC" },
    },
    {
      id: "seed-4",
      date: offsetDate(14, 19),
      status: "scheduled",
      venue: "Venue TBD",
      isHome: false,
      isNeutralSite: false,
      opponent: { id: "seed-opp-4", name: "Placeholder Opponent D", shortName: "Opponent D", abbreviation: "PHD" },
    },
    {
      id: "seed-5",
      date: offsetDate(21, 19),
      status: "scheduled",
      venue: "Venue TBD",
      isHome: true,
      isNeutralSite: false,
      opponent: { id: "seed-opp-5", name: "Placeholder Opponent E", shortName: "Opponent E", abbreviation: "PHE" },
    },
  ];
}
