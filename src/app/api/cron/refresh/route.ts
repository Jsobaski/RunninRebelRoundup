import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Triggered by Vercel Cron (see vercel.json) to proactively refresh the ISR
 * cache for data-backed pages, instead of waiting for the first visitor
 * request after a page's `revalidate` window expires.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paths = ["/", "/schedule", "/stats", "/roster"];
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: paths, timestamp: new Date().toISOString() });
}
