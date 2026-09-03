import { fetchUnlvSchedule, UNLV_ESPN_TEAM_ID } from "@/lib/data/adapters/espn";
import { currentEspnSeason } from "@/lib/data/season";
import { getSeedSchedule } from "@/lib/data/seed/schedule";
import type { Game } from "@/lib/data/types";

/**
 * Returns the UNLV schedule, preferring live ESPN data and falling back to
 * the manually-seeded schedule if the adapter fails (offline dev, ESPN
 * outage, or a breaking shape change upstream).
 */
export async function getSchedule(): Promise<{ games: Game[]; source: "live" | "seed" }> {
  const result = await fetchUnlvSchedule(currentEspnSeason());
  if (result.ok && result.data.length > 0) {
    return { games: result.data, source: "live" };
  }
  return { games: getSeedSchedule(), source: "seed" };
}

export async function getGameById(id: string): Promise<{ game: Game | undefined; source: "live" | "seed" }> {
  const { games, source } = await getSchedule();
  return { game: games.find((g) => g.id === id), source };
}

export { UNLV_ESPN_TEAM_ID };
