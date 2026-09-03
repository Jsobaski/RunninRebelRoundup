// Shared types for all data domains. Every adapter (ESPN, RSS, scrapers)
// normalizes its source-specific shape into these before the UI ever sees it.

/** Wraps any fetched data so the UI can render "unavailable" instead of crashing
 * when a source (especially the unofficial ESPN endpoints or a scraper) breaks. */
export type FetchResult<T> =
  | { ok: true; data: T; fetchedAt: string }
  | { ok: false; error: string; fetchedAt: string };

export type GameStatus = "scheduled" | "in_progress" | "final" | "postponed" | "canceled";

export interface TeamRef {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  logoUrl?: string;
}

export interface GameResult {
  unlvScore: number;
  opponentScore: number;
  won: boolean;
  boxScoreUrl?: string;
}

export interface Game {
  id: string;
  date: string; // ISO 8601
  status: GameStatus;
  venue: string;
  isHome: boolean;
  isNeutralSite: boolean;
  opponent: TeamRef;
  broadcast?: string;
  result?: GameResult;
}

export interface TeamSeasonStats {
  teamId: string;
  season: string;
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  fieldGoalPct: number;
  threePointPct: number;
  turnoversPerGame: number;
  pace: number;
}

export interface PlayerSeasonStats {
  playerId: string;
  name: string;
  jersey: string;
  position: string;
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  fieldGoalPct: number;
  threePointPct: number;
  freeThrowPct: number;
  minutesPerGame: number;
}

export interface RankingEntry {
  poll: "AP" | "NET" | "Coaches";
  rank: number;
  record?: string;
  date: string; // ISO 8601, the date this rank was published
}

export interface ConferenceStanding {
  teamName: string;
  conferenceRecord: string;
  overallRecord: string;
  rank: number;
}

export interface RankTrendPoint {
  date: string;
  apRank: number | null;
  netRank: number | null;
  wins: number;
  losses: number;
}

export type NewsSource = "UNLV Athletics" | "Las Vegas Review-Journal" | "Vegas Sun" | "ESPN";

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: NewsSource;
  publishedAt: string; // ISO 8601
  summary?: string;
  imageUrl?: string;
}

export interface RosterPlayer {
  id: string;
  name: string;
  jersey: string;
  position: string;
  classYear: "Freshman" | "Sophomore" | "Junior" | "Senior" | "Grad" | "Redshirt";
  heightInches: number;
  hometown?: string;
  photoUrl?: string;
  stats?: Pick<PlayerSeasonStats, "pointsPerGame" | "reboundsPerGame" | "assistsPerGame">;
}

export type RecruitStatus = "Committed" | "Target" | "Signed" | "Enrolled";

export interface RecruitingProspect {
  id: string;
  name: string;
  position: string;
  status: RecruitStatus;
  classYear: string; // e.g. "2027"
  stars?: number;
  hometown?: string;
  sourceUrl: string;
  sourceName: "247Sports" | "On3";
  lastUpdated: string; // ISO 8601, this is scraped data, not real-time
}
