import { RankTrendChart } from "@/components/RankTrendChart";
import { SeedNotice } from "@/components/SeedNotice";
import { Unavailable } from "@/components/Unavailable";
import { UNLV_ESPN_TEAM_ID } from "@/lib/data/services/schedule-service";
import { getPlayerSeasonStats, getRankTrend, getRankings, getTeamSeasonStats } from "@/lib/data/services/stats-service";
import type { PlayerSeasonStats } from "@/lib/data/types";

export const revalidate = 1800;

export default async function StatsPage() {
  const [
    { stats: teamStats, source: teamSource },
    { players, source: playerSource },
    { rankings },
    { trend },
  ] = await Promise.all([
    getTeamSeasonStats(UNLV_ESPN_TEAM_ID),
    getPlayerSeasonStats(),
    getRankings(),
    getRankTrend(),
  ]);

  const topScorers = [...players].sort((a, b) => b.pointsPerGame - a.pointsPerGame).slice(0, 5);
  const topRebounders = [...players].sort((a, b) => b.reboundsPerGame - a.reboundsPerGame).slice(0, 5);
  const topAssisters = [...players].sort((a, b) => b.assistsPerGame - a.assistsPerGame).slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Stats & Rankings</h1>
        <p className="text-sm text-foreground/60">Season {teamStats.season}</p>
      </div>

      {teamSource === "seed" && <SeedNotice label="stats" />}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">National Context</h2>
        {rankings.length === 0 ? (
          <Unavailable label="Rankings" />
        ) : (
          <div className="flex flex-wrap gap-3">
            {rankings.map((r) => (
              <div key={r.poll} className="rounded-lg border border-border bg-surface px-4 py-3 text-center">
                <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">{r.poll}</div>
                <div className="text-2xl font-bold text-unlv-red">#{r.rank}</div>
                {r.record && <div className="text-xs text-foreground/50">{r.record}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Rank Trend</h2>
        {trend.length === 0 ? <Unavailable label="Rank trend" /> : <RankTrendChart trend={trend} />}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Team Averages</h2>
        {teamSource === "seed" ? (
          <Unavailable label="Team stats" />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile label="PPG" value={teamStats.pointsPerGame.toFixed(1)} />
            <StatTile label="RPG" value={teamStats.reboundsPerGame.toFixed(1)} />
            <StatTile label="APG" value={teamStats.assistsPerGame.toFixed(1)} />
            <StatTile label="FG%" value={`${(teamStats.fieldGoalPct * 100).toFixed(1)}%`} />
            <StatTile label="3P%" value={`${(teamStats.threePointPct * 100).toFixed(1)}%`} />
            <StatTile label="TO/G" value={teamStats.turnoversPerGame.toFixed(1)} />
            <StatTile label="Pace" value={teamStats.pace.toFixed(1)} />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Player Leaders</h2>
        {playerSource === "seed" || players.length === 0 ? (
          <Unavailable label="Player stats" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <LeaderList title="Points" players={topScorers} statKey="pointsPerGame" />
            <LeaderList title="Rebounds" players={topRebounders} statKey="reboundsPerGame" />
            <LeaderList title="Assists" players={topAssisters} statKey="assistsPerGame" />
          </div>
        )}
      </section>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-foreground/50">{label}</div>
    </div>
  );
}

function LeaderList({
  title,
  players,
  statKey,
}: {
  title: string;
  players: PlayerSeasonStats[];
  statKey: "pointsPerGame" | "reboundsPerGame" | "assistsPerGame";
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <h3 className="mb-2 text-sm font-semibold text-foreground/70">{title}</h3>
      <ol className="flex flex-col gap-1 text-sm">
        {players.map((p) => (
          <li key={p.playerId} className="flex justify-between">
            <span>
              #{p.jersey} {p.name}
            </span>
            <span className="font-semibold">{p[statKey].toFixed(1)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
