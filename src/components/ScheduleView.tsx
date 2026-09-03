"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import type { Game } from "@/lib/data/types";
import { GameCard } from "@/components/GameCard";

export function ScheduleView({ games }: { games: Game[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState(() => (games[0] ? new Date(games[0].date) : new Date()));

  const now = new Date();
  const upcoming = games.filter((g) => g.status !== "final");
  const past = games.filter((g) => g.status === "final");

  const gamesByDay = useMemo(() => {
    const map = new Map<string, Game[]>();
    for (const game of games) {
      const key = format(new Date(game.date), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), game]);
    }
    return map;
  }, [games]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="flex rounded-full border border-border bg-surface p-0.5 text-sm">
          <button
            onClick={() => setView("list")}
            className={`rounded-full px-3 py-1 font-medium ${view === "list" ? "bg-unlv-red text-white" : "text-foreground/60"}`}
          >
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`rounded-full px-3 py-1 font-medium ${view === "calendar" ? "bg-unlv-red text-white" : "text-foreground/60"}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="flex flex-col gap-6">
          {upcoming.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">Upcoming</h2>
              <div className="flex flex-col gap-2">
                {upcoming.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">Past</h2>
              <div className="flex flex-col gap-2">
                {past.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMonth((m) => subMonths(m, 1))}
              className="rounded-md border border-border px-2 py-1 text-sm hover:bg-unlv-red/10"
            >
              ←
            </button>
            <span className="font-semibold">{format(month, "MMMM yyyy")}</span>
            <button
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="rounded-md border border-border px-2 py-1 text-sm hover:bg-unlv-red/10"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-foreground/50">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayGames = gamesByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, month);
              const isToday = isSameDay(day, now);
              return (
                <div
                  key={key}
                  className={`flex min-h-20 flex-col gap-1 rounded-md border border-border p-1 text-xs ${
                    inMonth ? "bg-surface" : "bg-transparent opacity-40"
                  } ${isToday ? "ring-2 ring-unlv-red" : ""}`}
                >
                  <span className="font-medium">{format(day, "d")}</span>
                  {dayGames.map((g) => (
                    <Link
                      key={g.id}
                      href={`/schedule/${g.id}`}
                      className="truncate rounded bg-unlv-red/10 px-1 py-0.5 text-[11px] font-medium text-unlv-red hover:bg-unlv-red/20"
                      title={`${g.isHome ? "vs" : "@"} ${g.opponent.shortName}`}
                    >
                      {g.isHome ? "vs" : "@"} {g.opponent.abbreviation}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
