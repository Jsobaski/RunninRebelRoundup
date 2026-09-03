import Link from "next/link";
import type { Game } from "@/lib/data/types";

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function GameCard({ game }: { game: Game }) {
  const { day, time } = formatDateTime(game.date);
  const isPast = game.status === "final";

  return (
    <Link
      href={`/schedule/${game.id}`}
      className={`flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-unlv-red ${
        isPast ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">{day}</span>
        <span className="font-semibold">
          {game.isHome ? "vs" : game.isNeutralSite ? "v." : "@"} {game.opponent.shortName}
        </span>
        <span className="text-xs text-foreground/60">{game.venue}</span>
      </div>
      <div className="flex flex-col items-end">
        {game.result ? (
          <span className={`text-sm font-bold ${game.result.won ? "text-emerald-600" : "text-unlv-red"}`}>
            {game.result.won ? "W" : "L"} {game.result.unlvScore}-{game.result.opponentScore}
          </span>
        ) : (
          <span className="text-sm font-medium">{time}</span>
        )}
        {game.broadcast && <span className="text-xs text-foreground/50">{game.broadcast}</span>}
      </div>
    </Link>
  );
}
