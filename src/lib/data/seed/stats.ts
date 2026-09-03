import type { PlayerSeasonStats, RankTrendPoint, TeamSeasonStats } from "@/lib/data/types";

/**
 * Fallback stats used only when the live ESPN adapter is unavailable.
 * Deliberately zeroed/empty rather than plausible-looking numbers — a
 * fabricated "#24 AP, 3-1" used to be shown here as if it were real, which
 * is exactly the kind of wrong-but-believable data this project should
 * never present. The UI shows an "unavailable" state for empty arrays
 * instead of these placeholders.
 */
export const seedUnlvTeamStats: TeamSeasonStats = {
  teamId: "unlv",
  season: "----",
  gamesPlayed: 0,
  pointsPerGame: 0,
  reboundsPerGame: 0,
  assistsPerGame: 0,
  fieldGoalPct: 0,
  threePointPct: 0,
  turnoversPerGame: 0,
  pace: 0,
};

export const seedOpponentTeamStats: Record<string, TeamSeasonStats> = {};

export const seedPlayerStats: PlayerSeasonStats[] = [];

export const seedRankTrend: RankTrendPoint[] = [];
