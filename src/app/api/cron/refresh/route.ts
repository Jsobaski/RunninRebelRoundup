import { NextRequest, NextResponse } from "next/server";
import { revalidateAllData } from "@/lib/revalidate";

/**
 * Triggered by Vercel Cron (see vercel.json) to proactively refresh the ISR
 * cache for data-backed pages, instead of waiting for the first visitor
 * request after a page's `revalidate` window expires. See also
 * /api/refresh, the user-facing equivalent behind the in-app refresh button.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const revalidated = revalidateAllData();
  return NextResponse.json({ revalidated, timestamp: new Date().toISOString() });
}
