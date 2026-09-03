/**
 * Recruiting adapter — scrapes a public 247Sports (or On3) team commitment
 * page. Like the roster adapter, this is a scrape of markup Claude has not
 * verified live (no outbound network access at build time in this
 * environment) — treat the selectors as a starting point to verify and
 * adjust against the real page, not a guarantee.
 *
 * Recruiting pages change often and are the most likely of all adapters to
 * need maintenance; the graceful fallback (seed JSON, manually updated a
 * few times a season) is a legitimate permanent choice, not just a stopgap
 * — see the project's "Open Decisions" note on this tradeoff.
 */
import * as cheerio from "cheerio";
import type { FetchResult, RecruitingProspect } from "@/lib/data/types";

const RECRUITING_URL =
  process.env.UNLV_RECRUITING_URL ?? "https://247sports.com/college/unlv/Season/2027-Basketball/Commits/";

function parseStars(el: cheerio.Cheerio<import("domhandler").Element>): number | undefined {
  const filled = el.find(".rating .icon-starsolid, .yellow").length;
  return filled > 0 ? filled : undefined;
}

export async function fetchRecruiting(): Promise<FetchResult<RecruitingProspect[]>> {
  try {
    const res = await fetch(RECRUITING_URL, {
      next: { revalidate: 60 * 60 * 24 }, // 24h — recruiting boards update daily at most
      headers: { "User-Agent": "RunninRebelRoundup/1.0 (personal fan recruiting tracker)" },
    });
    if (!res.ok) throw new Error(`Recruiting request failed: ${res.status} ${res.statusText}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const now = new Date().toISOString();

    // 247Sports list pages typically render one row per prospect under
    // `.ri-page__list-item` (or `.recruit-count-list li`). Verify and adjust
    // against the live page.
    const prospects: RecruitingProspect[] = [];
    $(".ri-page__list-item").each((i, el) => {
      const row = $(el);
      const name = row.find(".recruit__name a").text().trim() || row.find(".name a").text().trim();
      if (!name) return;

      const position = row.find(".position").text().trim();
      const hometown = row.find(".meta").text().trim();
      const link = row.find(".recruit__name a, .name a").attr("href");
      const statusText = row.find(".status").text().trim().toLowerCase();

      let status: RecruitingProspect["status"] = "Target";
      if (statusText.includes("commit")) status = "Committed";
      if (statusText.includes("sign")) status = "Signed";
      if (statusText.includes("enroll")) status = "Enrolled";

      prospects.push({
        id: `recruit-${i}-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        position: position || "--",
        status,
        classYear: (RECRUITING_URL.match(/Season\/(\d{4})/)?.[1] ?? "----"),
        stars: parseStars(row),
        hometown: hometown || undefined,
        sourceUrl: link ? new URL(link, RECRUITING_URL).toString() : RECRUITING_URL,
        sourceName: RECRUITING_URL.includes("on3.com") ? "On3" : "247Sports",
        lastUpdated: now,
      });
    });

    if (prospects.length === 0) {
      throw new Error("Recruiting scrape found no prospects — selectors likely need updating for the current site markup");
    }

    return { ok: true, data: prospects, fetchedAt: now };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message, fetchedAt: new Date().toISOString() };
  }
}
