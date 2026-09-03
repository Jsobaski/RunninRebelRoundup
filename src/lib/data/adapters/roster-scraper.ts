/**
 * Roster adapter — scrapes the UNLV official athletics roster page.
 *
 * This is the module to fix when UNLV redesigns their site and the CSS
 * selectors below stop matching (Sidearm Sports sites, which most college
 * athletics sites run on, change markup occasionally). Nothing else in the
 * app depends on the scraping details — only on `RosterPlayer[]`.
 *
 * Since this is a scrape of data a human maintains, treat it as
 * "last updated" info, not real-time — cache aggressively.
 */
import * as cheerio from "cheerio";
import type { FetchResult, RosterPlayer } from "@/lib/data/types";

const ROSTER_URL = process.env.UNLV_ROSTER_URL ?? "https://unlvrebels.com/sports/mens-basketball/roster";
const REVALIDATE_SECONDS = 60 * 60 * 12; // 12h — roster changes rarely mid-season

const CLASS_YEAR_MAP: Record<string, RosterPlayer["classYear"]> = {
  fr: "Freshman",
  so: "Sophomore",
  jr: "Junior",
  sr: "Senior",
  gr: "Grad",
  rs: "Redshirt",
};

function parseHeight(text: string): number {
  const match = text.match(/(\d+)'\s*(\d+)?/);
  if (!match) return 0;
  const feet = Number(match[1]);
  const inches = Number(match[2] ?? 0);
  return feet * 12 + inches;
}

function normalizeClassYear(raw: string): RosterPlayer["classYear"] {
  const key = raw.trim().toLowerCase().slice(0, 2);
  return CLASS_YEAR_MAP[key] ?? "Freshman";
}

export async function fetchRoster(): Promise<FetchResult<RosterPlayer[]>> {
  try {
    const res = await fetch(ROSTER_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "User-Agent": "RunninRebelRoundup/1.0 (personal fan roster page)" },
    });
    if (!res.ok) throw new Error(`Roster request failed: ${res.status} ${res.statusText}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Sidearm Sports roster pages typically render one card per player under
    // `.sidearm-roster-player`. Selectors here are a best-effort default —
    // verify against the live page and adjust if UNLV's site changes.
    const players: RosterPlayer[] = [];
    $(".sidearm-roster-player").each((i, el) => {
      const card = $(el);
      const name = card.find(".sidearm-roster-player-name").text().trim();
      if (!name) return;

      const jersey = card.find(".sidearm-roster-player-jersey-number").text().trim().replace(/^#/, "");
      const position = card.find(".sidearm-roster-player-position .text-bold").first().text().trim();
      const heightText = card.find(".sidearm-roster-player-height").text().trim();
      const classText = card.find(".sidearm-roster-player-academic-year").text().trim();
      const hometown = card.find(".sidearm-roster-player-hometown").text().trim();
      const photoUrl = card.find("img").attr("src");

      players.push({
        id: `roster-${i}-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        jersey: jersey || "--",
        position: position || "--",
        classYear: normalizeClassYear(classText),
        heightInches: parseHeight(heightText),
        hometown: hometown || undefined,
        photoUrl: photoUrl || undefined,
      });
    });

    if (players.length === 0) {
      throw new Error("Roster scrape found no players — selectors likely need updating for the current site markup");
    }

    return { ok: true, data: players, fetchedAt: new Date().toISOString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message, fetchedAt: new Date().toISOString() };
  }
}
