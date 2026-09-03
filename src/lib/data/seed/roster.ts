import type { RecruitingProspect, RosterPlayer } from "@/lib/data/types";

/**
 * Fallback roster/recruiting data used only when live sources (ESPN roster
 * JSON, then the UNLV site scrape) are unavailable. Deliberately generic
 * ("Placeholder Player") rather than real names — an earlier version of
 * this file used real former UNLV players' names as filler, which meant a
 * live-data outage silently displayed real people who hadn't played for
 * the team in years as if they were on the current roster.
 */
export const seedRoster: RosterPlayer[] = [
  {
    id: "seed-p1",
    name: "Placeholder Player A",
    jersey: "0",
    position: "G",
    classYear: "Senior",
    heightInches: 74,
  },
  {
    id: "seed-p2",
    name: "Placeholder Player B",
    jersey: "1",
    position: "F",
    classYear: "Junior",
    heightInches: 79,
  },
  {
    id: "seed-p3",
    name: "Placeholder Player C",
    jersey: "2",
    position: "C",
    classYear: "Grad",
    heightInches: 82,
  },
];

export const seedRecruiting: RecruitingProspect[] = [
  {
    id: "seed-r1",
    name: "Placeholder Prospect A",
    position: "SG",
    status: "Target",
    classYear: "----",
    sourceUrl: "https://247sports.com/",
    sourceName: "247Sports",
    lastUpdated: new Date().toISOString(),
  },
];
