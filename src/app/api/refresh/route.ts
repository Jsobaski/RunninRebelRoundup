import { NextResponse } from "next/server";
import { revalidateAllData } from "@/lib/revalidate";

const COOLDOWN_MS = 20_000;

// Best-effort, single-instance cooldown to stop the refresh button from
// hammering upstream sources (ESPN, RSS feeds, scrapers) if clicked
// repeatedly. Not a real rate limit — this resets whenever a new serverless
// instance is used — but fine for a personal-use, single-visitor app.
let lastRefreshAt = 0;

export async function POST() {
  const now = Date.now();
  if (now - lastRefreshAt < COOLDOWN_MS) {
    return NextResponse.json(
      { error: "Refreshed recently, try again shortly.", retryAfterMs: COOLDOWN_MS - (now - lastRefreshAt) },
      { status: 429 },
    );
  }
  lastRefreshAt = now;

  const revalidated = revalidateAllData();
  return NextResponse.json({ revalidated, timestamp: new Date().toISOString() });
}
