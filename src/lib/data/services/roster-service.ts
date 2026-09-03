import { fetchRosterFromEspn, UNLV_ESPN_TEAM_ID } from "@/lib/data/adapters/espn";
import { fetchRecruiting } from "@/lib/data/adapters/recruiting-scraper";
import { fetchRoster } from "@/lib/data/adapters/roster-scraper";
import { seedRecruiting, seedRoster } from "@/lib/data/seed/roster";
import type { RecruitingProspect, RosterPlayer } from "@/lib/data/types";

/**
 * Tries ESPN's roster JSON first (keyed off the verified numeric team id,
 * so it can't accidentally scrape a different school), then the UNLV
 * athletics HTML scrape, then falls back to obviously-placeholder seed data.
 */
export async function getRoster(): Promise<{ players: RosterPlayer[]; source: "live" | "seed" }> {
  const espnResult = await fetchRosterFromEspn(UNLV_ESPN_TEAM_ID);
  if (espnResult.ok && espnResult.data.length > 0) {
    return { players: espnResult.data, source: "live" };
  }

  const scraped = await fetchRoster();
  if (scraped.ok && scraped.data.length > 0) {
    return { players: scraped.data, source: "live" };
  }

  return { players: seedRoster, source: "seed" };
}

export async function getRecruiting(): Promise<{ prospects: RecruitingProspect[]; source: "live" | "seed" }> {
  const result = await fetchRecruiting();
  if (result.ok && result.data.length > 0) return { prospects: result.data, source: "live" };
  return { prospects: seedRecruiting, source: "seed" };
}
