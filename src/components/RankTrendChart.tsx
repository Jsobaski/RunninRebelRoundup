"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RankTrendPoint } from "@/lib/data/types";

export function RankTrendChart({ trend }: { trend: RankTrendPoint[] }) {
  const data = trend.map((p) => ({
    ...p,
    dateLabel: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="h-64 w-full rounded-lg border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
          <YAxis reversed tick={{ fontSize: 12 }} allowDecimals={false} domain={[1, 25]} />
          <Tooltip
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="apRank" name="AP Rank" stroke="#cf0a2c" strokeWidth={2} connectNulls dot={false} />
          <Line type="monotone" dataKey="netRank" name="NET Rank" stroke="#333f48" strokeWidth={2} connectNulls dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
