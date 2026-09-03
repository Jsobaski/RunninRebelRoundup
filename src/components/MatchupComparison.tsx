import type { TeamSeasonStats } from "@/lib/data/types";

interface StatRow {
  label: string;
  key: keyof Omit<TeamSeasonStats, "teamId" | "season" | "gamesPlayed">;
  format: (v: number) => string;
  higherIsBetter: boolean;
}

const ROWS: StatRow[] = [
  { label: "Points / Game", key: "pointsPerGame", format: (v) => v.toFixed(1), higherIsBetter: true },
  { label: "Rebounds / Game", key: "reboundsPerGame", format: (v) => v.toFixed(1), higherIsBetter: true },
  { label: "Assists / Game", key: "assistsPerGame", format: (v) => v.toFixed(1), higherIsBetter: true },
  { label: "FG%", key: "fieldGoalPct", format: (v) => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
  { label: "3P%", key: "threePointPct", format: (v) => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
  { label: "Turnovers / Game", key: "turnoversPerGame", format: (v) => v.toFixed(1), higherIsBetter: false },
  { label: "Pace", key: "pace", format: (v) => v.toFixed(1), higherIsBetter: true },
];

export function MatchupComparison({
  unlvName,
  opponentName,
  unlvStats,
  opponentStats,
}: {
  unlvName: string;
  opponentName: string;
  unlvStats: TeamSeasonStats;
  opponentStats: TeamSeasonStats;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="grid grid-cols-3 border-b border-border bg-unlv-gray/5 px-4 py-2 text-sm font-semibold">
        <span className="text-unlv-red">{unlvName}</span>
        <span className="text-center text-foreground/50">Season Avg</span>
        <span className="text-right">{opponentName}</span>
      </div>
      <div className="flex flex-col divide-y divide-border">
        {ROWS.map((row) => {
          const unlvVal = unlvStats[row.key];
          const oppVal = opponentStats[row.key];
          const unlvBetter = row.higherIsBetter ? unlvVal > oppVal : unlvVal < oppVal;
          const oppBetter = row.higherIsBetter ? oppVal > unlvVal : oppVal < unlvVal;
          return (
            <div key={row.key} className="grid grid-cols-3 items-center px-4 py-2 text-sm">
              <span className={`font-medium ${unlvBetter ? "text-unlv-red" : ""}`}>{row.format(unlvVal)}</span>
              <span className="text-center text-xs text-foreground/50">{row.label}</span>
              <span className={`text-right font-medium ${oppBetter ? "text-unlv-red" : ""}`}>
                {row.format(oppVal)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
