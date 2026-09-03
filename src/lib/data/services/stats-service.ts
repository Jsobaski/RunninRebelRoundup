import { fetchPlayerSeasonStats, fetchRankings, fetchTeamSeasonStats, UNLV_ESPN_TEAM_ID } from "@/lib/data/adapters/espn";
import { currentEspnSeason } from "@/lib/data/season";
import { seedOpponentTeamStats, seedPlayerStats, seedRankTrend, seedUnlvTeamStats } from "@/lib/data/seed/stats";
import type { PlayerSeasonStats, RankingEntry, RankTrendPoint, TeamSeasonStats } from "@/lib/data/types";

export async function getTeamSeasonStats(teamId: string): Promise<{ stats: TeamSeasonStats; source: "live" | "seed" }> {
  const result = await fetchTeamSeasonStats(teamId, currentEspnSeason());
  // gamesPlayed === 0 usually means the response shape didn't match what we
  // expected (every stat defaulted to 0) rather than a genuine 0-game
  // season — treat that as a failure so it falls back instead of showing
  // an all-zero "live" stat line.
  if (result.ok && result.data.gamesPlayed > 0) return { stats: result.data, source: "live" };
  const seed = teamId === UNLV_ESPN_TEAM_ID ? seedUnlvTeamStats : seedOpponentTeamStats[teamId];
  return { stats: seed ?? { ...seedUnlvTeamStats, teamId }, source: "seed" };
}

export async function getPlayerSeasonStats(): Promise<{ players: PlayerSeasonStats[]; source: "live" | "seed" }> {
  const result = await fetchPlayerSeasonStats(UNLV_ESPN_TEAM_ID, currentEspnSeason());
  if (result.ok && result.data.length > 0) return { players: result.data, source: "live" };
  return { players: seedPlayerStats, source: "seed" };
}

export async function getRankings(): Promise<{ rankings: RankingEntry[]; source: "live" | "seed" }> {
  const result = await fetchRankings(UNLV_ESPN_TEAM_ID);
  if (result.ok && result.data.length > 0) return { rankings: result.data, source: "live" };
  // No fabricated rank here — UNLV may also just be unranked, which is a
  // legitimate "no entries" result, not only an adapter failure.
  return { rankings: [], source: "seed" };
}

export async function getRankTrend(): Promise<{ trend: RankTrendPoint[]; source: "seed" }> {
  // ESPN doesn't expose a historical rank-trend endpoint, so this stays
  // seed-only until it's tracked over a real season (e.g. persisted weekly
  // via a Vercel Cron job).
  return { trend: seedRankTrend, source: "seed" };
}
