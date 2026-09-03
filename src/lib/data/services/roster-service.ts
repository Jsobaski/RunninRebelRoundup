import { fetchRecruiting } from "@/lib/data/adapters/recruiting-scraper";
import { fetchRoster } from "@/lib/data/adapters/roster-scraper";
import { seedRecruiting, seedRoster } from "@/lib/data/seed/roster";
import type { RecruitingProspect, RosterPlayer } from "@/lib/data/types";

export async function getRoster(): Promise<{ players: RosterPlayer[]; source: "live" | "seed" }> {
  const result = await fetchRoster();
  if (result.ok && result.data.length > 0) return { players: result.data, source: "live" };
  return { players: seedRoster, source: "seed" };
}

export async function getRecruiting(): Promise<{ prospects: RecruitingProspect[]; source: "live" | "seed" }> {
  const result = await fetchRecruiting();
  if (result.ok && result.data.length > 0) return { prospects: result.data, source: "live" };
  return { prospects: seedRecruiting, source: "seed" };
}
