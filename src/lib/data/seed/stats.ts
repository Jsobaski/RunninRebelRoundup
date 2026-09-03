import type { PlayerSeasonStats, RankTrendPoint, TeamSeasonStats } from "@/lib/data/types";

export const seedUnlvTeamStats: TeamSeasonStats = {
  teamId: "unlv",
  season: "2025-26",
  gamesPlayed: 2,
  pointsPerGame: 83.5,
  reboundsPerGame: 38.0,
  assistsPerGame: 17.5,
  fieldGoalPct: 0.478,
  threePointPct: 0.361,
  turnoversPerGame: 11.0,
  pace: 71.2,
};

export const seedOpponentTeamStats: Record<string, TeamSeasonStats> = {
  "opp-3": {
    teamId: "opp-3",
    season: "2025-26",
    gamesPlayed: 3,
    pointsPerGame: 79.1,
    reboundsPerGame: 36.4,
    assistsPerGame: 15.9,
    fieldGoalPct: 0.451,
    threePointPct: 0.339,
    turnoversPerGame: 12.1,
    pace: 68.9,
  },
};

export const seedPlayerStats: PlayerSeasonStats[] = [
  {
    playerId: "p1",
    name: "Jailen Bedford",
    jersey: "3",
    position: "G",
    gamesPlayed: 2,
    pointsPerGame: 18.5,
    reboundsPerGame: 4.0,
    assistsPerGame: 5.5,
    stealsPerGame: 1.5,
    blocksPerGame: 0.0,
    fieldGoalPct: 0.489,
    threePointPct: 0.4,
    freeThrowPct: 0.833,
    minutesPerGame: 32.1,
  },
  {
    playerId: "p2",
    name: "Chuck Bailey II",
    jersey: "10",
    position: "F",
    gamesPlayed: 2,
    pointsPerGame: 15.0,
    reboundsPerGame: 8.5,
    assistsPerGame: 2.0,
    stealsPerGame: 1.0,
    blocksPerGame: 1.5,
    fieldGoalPct: 0.55,
    threePointPct: 0.0,
    freeThrowPct: 0.7,
    minutesPerGame: 28.4,
  },
  {
    playerId: "p3",
    name: "Rob Whaley Jr.",
    jersey: "12",
    position: "C",
    gamesPlayed: 2,
    pointsPerGame: 13.0,
    reboundsPerGame: 7.5,
    assistsPerGame: 1.0,
    stealsPerGame: 0.5,
    blocksPerGame: 2.0,
    fieldGoalPct: 0.6,
    threePointPct: 0.0,
    freeThrowPct: 0.65,
    minutesPerGame: 24.0,
  },
];

export const seedRankTrend: RankTrendPoint[] = [
  { date: "2025-11-03", apRank: null, netRank: null, wins: 0, losses: 0 },
  { date: "2025-11-10", apRank: 25, netRank: 41, wins: 2, losses: 0 },
  { date: "2025-11-17", apRank: 22, netRank: 33, wins: 2, losses: 0 },
  { date: "2025-11-24", apRank: 24, netRank: 30, wins: 3, losses: 1 },
];
