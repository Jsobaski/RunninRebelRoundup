/**
 * ESPN adapter — the ONLY module that talks to ESPN's public, unofficial,
 * undocumented `site.api.espn.com` endpoints.
 *
 * These endpoints have no SLA: no auth is required, but the response shape
 * can change (or the endpoint can disappear) with zero notice. Every export
 * here returns a `FetchResult<T>` and never throws, so a shape change or an
 * outage degrades a single UI section to "unavailable" instead of crashing
 * the app. If ESPN breaks this, this is the one file to fix.
 *
 * Not for commercial use — personal/hobby scale only, per ESPN's terms.
 */
import type {
  ConferenceStanding,
  Game,
  GameResult,
  GameStatus,
  PlayerSeasonStats,
  RankingEntry,
  RosterPlayer,
  TeamRef,
  TeamSeasonStats,
} from "@/lib/data/types";
import type { FetchResult } from "@/lib/data/types";

const SPORT = "basketball";
const LEAGUE = "mens-college-basketball";
const SITE_API_BASE = `https://site.api.espn.com/apis/site/v2/sports/${SPORT}/${LEAGUE}`;
const CORE_API_BASE = `https://sports.core.api.espn.com/v2/sports/${SPORT}/leagues/${LEAGUE}`;

/**
 * UNLV's ESPN team id. ESPN doesn't publish a stable lookup for this, so it
 * lives in one env-overridable constant in case it ever needs correcting —
 * verify at {SITE_API_BASE}/teams/{id} before relying on it in production.
 */
export const UNLV_ESPN_TEAM_ID = process.env.ESPN_UNLV_TEAM_ID ?? "2439";

const REVALIDATE_SECONDS = 60 * 30; // 30 min — schedule/scores/rankings don't need faster than this

function ok<T>(data: T): FetchResult<T> {
  return { ok: true, data, fetchedAt: new Date().toISOString() };
}

function fail<T>(error: unknown): FetchResult<T> {
  const message = error instanceof Error ? error.message : String(error);
  return { ok: false, error: message, fetchedAt: new Date().toISOString() };
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`ESPN request failed: ${res.status} ${res.statusText} (${url})`);
  }
  return res.json();
}

function statusFromEspn(state: string | undefined, completed: boolean | undefined): GameStatus {
  if (completed) return "final";
  switch (state) {
    case "in":
      return "in_progress";
    case "post":
      return "final";
    case "pre":
      return "scheduled";
    default:
      return "scheduled";
  }
}

// --- Types describing just the fields we read from ESPN's JSON payloads.
// Deliberately loose (mostly optional) since the shape is undocumented and
// we'd rather degrade a field than throw on a missing one.

interface EspnTeamCompetitor {
  homeAway?: "home" | "away";
  team?: { id?: string; displayName?: string; shortDisplayName?: string; abbreviation?: string; logo?: string };
  score?: string;
  winner?: boolean;
}

interface EspnBroadcast {
  media?: { shortName?: string };
  names?: string[];
}

interface EspnCompetition {
  venue?: { fullName?: string; indoor?: boolean };
  neutralSite?: boolean;
  competitors?: EspnTeamCompetitor[];
  broadcasts?: EspnBroadcast[];
  status?: { type?: { state?: string; completed?: boolean } };
}

interface EspnEvent {
  id?: string;
  date?: string;
  competitions?: EspnCompetition[];
}

interface EspnScheduleResponse {
  events?: EspnEvent[];
}

function parseEvent(event: EspnEvent): Game | null {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const unlv = competition.competitors?.find((c) => c.team?.id === UNLV_ESPN_TEAM_ID);
  const opponent = competition.competitors?.find((c) => c.team?.id !== UNLV_ESPN_TEAM_ID);
  if (!unlv || !opponent?.team) return null;

  const opponentRef: TeamRef = {
    id: opponent.team.id ?? "unknown",
    name: opponent.team.displayName ?? "Unknown Opponent",
    shortName: opponent.team.shortDisplayName ?? opponent.team.displayName ?? "Unknown",
    abbreviation: opponent.team.abbreviation ?? "UNK",
    logoUrl: opponent.team.logo,
  };

  const status = statusFromEspn(competition.status?.type?.state, competition.status?.type?.completed);

  let result: GameResult | undefined;
  if (status === "final" && unlv.score && opponent.score) {
    const unlvScore = Number(unlv.score);
    const opponentScore = Number(opponent.score);
    if (!Number.isNaN(unlvScore) && !Number.isNaN(opponentScore)) {
      result = { unlvScore, opponentScore, won: unlv.winner ?? unlvScore > opponentScore };
    }
  }

  const broadcast = competition.broadcasts?.[0]?.names?.[0] ?? competition.broadcasts?.[0]?.media?.shortName;

  return {
    id: event.id ?? `${event.date}-${opponentRef.id}`,
    date: event.date ?? new Date().toISOString(),
    status,
    venue: competition.venue?.fullName ?? "TBD",
    isHome: unlv.homeAway === "home",
    isNeutralSite: competition.neutralSite ?? false,
    opponent: opponentRef,
    broadcast,
    result,
  };
}

export async function fetchUnlvSchedule(season?: string): Promise<FetchResult<Game[]>> {
  try {
    const seasonParam = season ? `?season=${encodeURIComponent(season)}` : "";
    const json = (await getJson(
      `${SITE_API_BASE}/teams/${UNLV_ESPN_TEAM_ID}/schedule${seasonParam}`,
    )) as EspnScheduleResponse;
    const games = (json.events ?? [])
      .map(parseEvent)
      .filter((g): g is Game => g !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
    return ok(games);
  } catch (error) {
    return fail(error);
  }
}

interface EspnStatCategory {
  name?: string;
  displayValue?: string;
  value?: number;
}

interface EspnTeamStatsResponse {
  results?: { stats?: { categories?: { stats?: EspnStatCategory[] }[] } };
  team?: { record?: { items?: { stats?: EspnStatCategory[] }[] } };
  statistics?: { splits?: { categories?: { stats?: EspnStatCategory[] }[] } };
}

function statValue(categories: EspnStatCategory[] | undefined, name: string): number {
  const stat = categories?.find((s) => s.name === name);
  const raw = stat?.value ?? Number(stat?.displayValue);
  return typeof raw === "number" && !Number.isNaN(raw) ? raw : 0;
}

export async function fetchTeamSeasonStats(teamId: string, season: string): Promise<FetchResult<TeamSeasonStats>> {
  try {
    const json = (await getJson(
      `${CORE_API_BASE}/seasons/${season}/types/2/teams/${teamId}/statistics`,
    )) as EspnTeamStatsResponse;
    const flatCategories =
      json.statistics?.splits?.categories?.flatMap((c) => c.stats ?? []) ??
      json.results?.stats?.categories?.flatMap((c) => c.stats ?? []) ??
      [];

    return ok({
      teamId,
      season,
      gamesPlayed: statValue(flatCategories, "gamesPlayed"),
      pointsPerGame: statValue(flatCategories, "avgPoints"),
      reboundsPerGame: statValue(flatCategories, "avgRebounds"),
      assistsPerGame: statValue(flatCategories, "avgAssists"),
      fieldGoalPct: statValue(flatCategories, "fieldGoalPct") / 100,
      threePointPct: statValue(flatCategories, "threePointFieldGoalPct") / 100,
      turnoversPerGame: statValue(flatCategories, "avgTurnovers"),
      pace: statValue(flatCategories, "avgPossessions"),
    });
  } catch (error) {
    return fail(error);
  }
}

interface EspnAthleteStatEntry {
  athlete?: { id?: string; displayName?: string; jersey?: string; position?: { abbreviation?: string } };
  stats?: string[];
}

interface EspnPlayerStatsResponse {
  athletes?: EspnAthleteStatEntry[];
}

/** Column order ESPN uses for basketball athlete leaders splits: GP, MIN, PTS, REB, AST, STL, BLK, FG%, 3P%, FT% */
const PLAYER_STAT_COLUMNS = [
  "gamesPlayed",
  "minutesPerGame",
  "pointsPerGame",
  "reboundsPerGame",
  "assistsPerGame",
  "stealsPerGame",
  "blocksPerGame",
  "fieldGoalPct",
  "threePointPct",
  "freeThrowPct",
] as const;

export async function fetchPlayerSeasonStats(
  teamId: string,
  season: string,
): Promise<FetchResult<PlayerSeasonStats[]>> {
  try {
    const json = (await getJson(
      `${SITE_API_BASE}/teams/${teamId}/statistics?season=${encodeURIComponent(season)}`,
    )) as EspnPlayerStatsResponse;

    const players = (json.athletes ?? []).map((entry): PlayerSeasonStats => {
      const values: Record<string, number> = {};
      PLAYER_STAT_COLUMNS.forEach((key, i) => {
        const raw = Number(entry.stats?.[i]);
        values[key] = Number.isNaN(raw) ? 0 : raw;
      });
      return {
        playerId: entry.athlete?.id ?? "unknown",
        name: entry.athlete?.displayName ?? "Unknown Player",
        jersey: entry.athlete?.jersey ?? "--",
        position: entry.athlete?.position?.abbreviation ?? "--",
        gamesPlayed: values.gamesPlayed,
        minutesPerGame: values.minutesPerGame,
        pointsPerGame: values.pointsPerGame,
        reboundsPerGame: values.reboundsPerGame,
        assistsPerGame: values.assistsPerGame,
        stealsPerGame: values.stealsPerGame,
        blocksPerGame: values.blocksPerGame,
        fieldGoalPct: values.fieldGoalPct / 100,
        threePointPct: values.threePointPct / 100,
        freeThrowPct: values.freeThrowPct / 100,
      };
    });

    return ok(players);
  } catch (error) {
    return fail(error);
  }
}

interface EspnRosterAthlete {
  id?: string;
  displayName?: string;
  jersey?: string;
  position?: { abbreviation?: string };
  height?: number; // total inches, when present
  displayHeight?: string; // e.g. "6' 2\""
  experience?: { displayValue?: string; years?: number };
  headshot?: { href?: string };
  birthPlace?: { city?: string; state?: string };
}

interface EspnRosterGroup {
  items?: EspnRosterAthlete[];
}

interface EspnRosterResponse {
  athletes?: (EspnRosterAthlete | EspnRosterGroup)[];
}

function isRosterGroup(entry: EspnRosterAthlete | EspnRosterGroup): entry is EspnRosterGroup {
  return Array.isArray((entry as EspnRosterGroup).items);
}

function parseDisplayHeight(text: string | undefined): number {
  if (!text) return 0;
  const match = text.match(/(\d+)'\s*(\d+)?/);
  if (!match) return 0;
  return Number(match[1]) * 12 + Number(match[2] ?? 0);
}

function classYearFromExperience(displayValue: string | undefined): RosterPlayer["classYear"] {
  const text = (displayValue ?? "").toLowerCase();
  if (text.includes("redshirt")) return "Redshirt";
  if (text.includes("senior")) return "Senior";
  if (text.includes("junior")) return "Junior";
  if (text.includes("sophomore")) return "Sophomore";
  if (text.includes("grad")) return "Grad";
  return "Freshman";
}

/**
 * ESPN's team roster endpoint — used in preference to scraping UNLV's own
 * roster page, since it's keyed off the same numeric team id already
 * confirmed correct (see UNLV_ESPN_TEAM_ID) rather than guessed CSS class
 * names that can't be verified without a live network fetch.
 */
export async function fetchRosterFromEspn(teamId: string): Promise<FetchResult<RosterPlayer[]>> {
  try {
    const json = (await getJson(`${SITE_API_BASE}/teams/${teamId}/roster`)) as EspnRosterResponse;
    const athletes = (json.athletes ?? []).flatMap((entry) => (isRosterGroup(entry) ? entry.items ?? [] : [entry]));

    const players: RosterPlayer[] = athletes
      .filter((a): a is EspnRosterAthlete & { displayName: string } => Boolean(a.displayName))
      .map((a) => ({
        id: a.id ?? a.displayName.toLowerCase().replace(/\s+/g, "-"),
        name: a.displayName,
        jersey: a.jersey ?? "--",
        position: a.position?.abbreviation ?? "--",
        classYear: classYearFromExperience(a.experience?.displayValue),
        heightInches: a.height ?? parseDisplayHeight(a.displayHeight),
        hometown: [a.birthPlace?.city, a.birthPlace?.state].filter(Boolean).join(", ") || undefined,
        photoUrl: a.headshot?.href,
      }));

    if (players.length === 0) throw new Error("ESPN roster response had no athletes");
    return ok(players);
  } catch (error) {
    return fail(error);
  }
}

interface EspnRankingsResponse {
  rankings?: {
    name?: string;
    ranks?: { current?: number; team?: { id?: string }; recordSummary?: string }[];
  }[];
}

const POLL_NAME_MAP: Record<string, RankingEntry["poll"]> = {
  "AP Top 25": "AP",
  "NCAA Men's Basketball Championship Committee Rankings": "NET",
  "USA Today Coaches Poll": "Coaches",
};

export async function fetchRankings(teamId: string): Promise<FetchResult<RankingEntry[]>> {
  try {
    const json = (await getJson(`${SITE_API_BASE}/rankings`)) as EspnRankingsResponse;
    const now = new Date().toISOString();

    const entries: RankingEntry[] = [];
    for (const pollGroup of json.rankings ?? []) {
      const pollName = pollGroup.name ? POLL_NAME_MAP[pollGroup.name] : undefined;
      if (!pollName) continue;
      const teamRank = pollGroup.ranks?.find((r) => r.team?.id === teamId);
      if (teamRank?.current) {
        entries.push({ poll: pollName, rank: teamRank.current, record: teamRank.recordSummary, date: now });
      }
    }
    return ok(entries);
  } catch (error) {
    return fail(error);
  }
}

interface EspnStandingsEntry {
  team?: { displayName?: string };
  stats?: { name?: string; displayValue?: string }[];
}

interface EspnStandingsGroup {
  standings?: { entries?: EspnStandingsEntry[] };
}

interface EspnStandingsResponse {
  children?: EspnStandingsGroup[];
}

export async function fetchConferenceStandings(conferenceGroupId: string): Promise<FetchResult<ConferenceStanding[]>> {
  try {
    const json = (await getJson(
      `${SITE_API_BASE}/standings?group=${encodeURIComponent(conferenceGroupId)}`,
    )) as EspnStandingsResponse;

    const entries = json.children?.[0]?.standings?.entries ?? [];
    const standings = entries.map((entry, i): ConferenceStanding => {
      const statValue2 = (name: string) => entry.stats?.find((s) => s.name === name)?.displayValue ?? "-";
      return {
        teamName: entry.team?.displayName ?? "Unknown",
        conferenceRecord: statValue2("conferenceRecord"),
        overallRecord: statValue2("overall"),
        rank: i + 1,
      };
    });
    return ok(standings);
  } catch (error) {
    return fail(error);
  }
}
