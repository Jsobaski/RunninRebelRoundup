import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchupComparison } from "@/components/MatchupComparison";
import { SeedNotice } from "@/components/SeedNotice";
import { Unavailable } from "@/components/Unavailable";
import { getGameById, UNLV_ESPN_TEAM_ID } from "@/lib/data/services/schedule-service";
import { getTeamSeasonStats } from "@/lib/data/services/stats-service";

export const revalidate = 1800;

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { game, source: gameSource } = await getGameById(id);
  if (!game) notFound();

  const [
    { stats: unlvStats, source: unlvSource },
    { stats: opponentStats, source: opponentSource },
  ] = await Promise.all([getTeamSeasonStats(UNLV_ESPN_TEAM_ID), getTeamSeasonStats(game.opponent.id)]);
  const matchupAvailable = unlvSource === "live" && opponentSource === "live";

  const gameDate = new Date(game.date);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/schedule" className="text-sm text-foreground/60 hover:text-unlv-red">
        ← Back to schedule
      </Link>

      {gameSource === "seed" && <SeedNotice label="schedule" />}

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-unlv-red">
          {game.status === "final" ? "Final" : game.isHome ? "Home" : game.isNeutralSite ? "Neutral Site" : "Away"}
        </span>
        <h1 className="text-2xl font-bold">
          UNLV {game.isHome ? "vs" : game.isNeutralSite ? "v." : "@"} {game.opponent.name}
        </h1>
        <p className="text-sm text-foreground/60">
          {gameDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          {" · "}
          {gameDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          {" · "}
          {game.venue}
        </p>
        {game.broadcast && <p className="text-sm text-foreground/60">Broadcast: {game.broadcast}</p>}
      </div>

      {game.result && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-center gap-6 text-3xl font-bold">
            <span className={game.result.won ? "text-unlv-red" : ""}>{game.result.unlvScore}</span>
            <span className="text-base font-normal text-foreground/40">final</span>
            <span>{game.result.opponentScore}</span>
          </div>
          {game.result.boxScoreUrl && (
            <div className="mt-2 text-center">
              <a
                href={game.result.boxScoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-unlv-red hover:underline"
              >
                Full box score →
              </a>
            </div>
          )}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Matchup Comparison</h2>
        <p className="text-xs text-foreground/50">Season averages entering this game.</p>
        {matchupAvailable ? (
          <MatchupComparison
            unlvName="UNLV"
            opponentName={game.opponent.shortName}
            unlvStats={unlvStats}
            opponentStats={opponentStats}
          />
        ) : (
          <Unavailable label="Matchup comparison" />
        )}
      </section>
    </div>
  );
}
