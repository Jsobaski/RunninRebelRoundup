import { fetchPlayerSeasonStats, fetchRankings, fetchTeamSeasonStats, UNLV_ESPN_TEAM_ID } from "@/lib/data/adapters/espn";
import { CURRENT_SEASON } from "@/lib/data/services/schedule-service";
import { seedOpponentTeamStats, seedPlayerStats, seedRankTrend, seedUnlvTeamStats } from "@/lib/data/seed/stats";
import type { PlayerSeasonStats, RankingEntry, RankTrendPoint, TeamSeasonStats } from "@/lib/data/types";

export async function getTeamSeasonStats(teamId: string): Promise<{ stats: TeamSeasonStats; source: "live" | "seed" }> {
  const result = await fetchTeamSeasonStats(teamId, CURRENT_SEASON);
  if (result.ok) return { stats: result.data, source: "live" };
  const seed = teamId === UNLV_ESPN_TEAM_ID ? seedUnlvTeamStats : seedOpponentTeamStats[teamId];
  return { stats: seed ?? { ...seedUnlvTeamStats, teamId }, source: "seed" };
}

export async function getPlayerSeasonStats(): Promise<{ players: PlayerSeasonStats[]; source: "live" | "seed" }> {
  const result = await fetchPlayerSeasonStats(UNLV_ESPN_TEAM_ID, CURRENT_SEASON);
  if (result.ok && result.data.length > 0) return { players: result.data, source: "live" };
  return { players: seedPlayerStats, source: "seed" };
}

export async function getRankings(): Promise<{ rankings: RankingEntry[]; source: "live" | "seed" }> {
  const result = await fetchRankings(UNLV_ESPN_TEAM_ID);
  if (result.ok && result.data.length > 0) return { rankings: result.data, source: "live" };
  return {
    rankings: [
      { poll: "AP", rank: 24, record: "3-1", date: new Date().toISOString() },
      { poll: "NET", rank: 30, date: new Date().toISOString() },
    ],
    source: "seed",
  };
}

export async function getRankTrend(): Promise<{ trend: RankTrendPoint[]; source: "seed" }> {
  // ESPN doesn't expose a historical rank-trend endpoint, so this stays
  // seed-only until it's tracked over a real season (e.g. persisted weekly
  // via a Vercel Cron job).
  return { trend: seedRankTrend, source: "seed" };
}
