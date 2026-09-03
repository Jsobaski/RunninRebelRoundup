/**
 * RSS adapter — the only module that fetches and parses the news RSS feeds.
 * Each feed is fetched independently so one dead/broken feed doesn't take
 * down the others; failures are swallowed per-feed and reported via
 * `FetchResult`.
 */
import Parser from "rss-parser";
import type { FetchResult, NewsItem, NewsSource } from "@/lib/data/types";

const REVALIDATE_SECONDS = 60 * 15;

const FEEDS: { source: NewsSource; url: string }[] = [
  { source: "UNLV Athletics", url: "https://unlvrebels.com/rss.aspx?path=mbball" },
  { source: "Las Vegas Review-Journal", url: "https://www.reviewjournal.com/sports/unlv-rebels/unlv-basketball/feed/" },
  { source: "Vegas Sun", url: "https://lasvegassun.com/rss/headlines/sports/unlv-rebels/" },
  { source: "ESPN", url: "https://www.espn.com/espn/rss/ncb/news" },
];

const parser = new Parser();

function ok<T>(data: T): FetchResult<T> {
  return { ok: true, data, fetchedAt: new Date().toISOString() };
}

function fail<T>(error: unknown): FetchResult<T> {
  const message = error instanceof Error ? error.message : String(error);
  return { ok: false, error: message, fetchedAt: new Date().toISOString() };
}

function extractImage(item: Parser.Item & { "media:content"?: { $?: { url?: string } }; enclosure?: { url?: string } }) {
  return item.enclosure?.url ?? item["media:content"]?.$?.url;
}

async function fetchFeed(source: NewsSource, url: string): Promise<FetchResult<NewsItem[]>> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "User-Agent": "RunninRebelRoundup/1.0 (personal news aggregator)" },
    });
    if (!res.ok) throw new Error(`RSS request failed: ${res.status} ${res.statusText} (${url})`);
    const xml = await res.text();
    const feed = await parser.parseString(xml);

    const items: NewsItem[] = (feed.items ?? [])
      .filter((item) => item.link && item.title)
      .map((item, i) => ({
        id: item.guid ?? item.link ?? `${source}-${i}`,
        title: item.title as string,
        url: item.link as string,
        source,
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        summary: item.contentSnippet?.slice(0, 240),
        imageUrl: extractImage(item),
      }));

    return ok(items);
  } catch (error) {
    return fail(error);
  }
}

/** UNLV/general team-basketball filter applied to broad feeds like ESPN's general CBB feed. */
function isUnlvRelevant(item: NewsItem, source: NewsSource) {
  if (source !== "ESPN") return true;
  return /unlv|runnin.?rebels|rebels/i.test(item.title) || /unlv|runnin.?rebels/i.test(item.summary ?? "");
}

export interface NewsFeedResult {
  source: NewsSource;
  result: FetchResult<NewsItem[]>;
}

/** Fetches every configured feed in parallel; each feed's success/failure is independent. */
export async function fetchAllNews(): Promise<NewsFeedResult[]> {
  const results = await Promise.all(
    FEEDS.map(async ({ source, url }) => ({ source, result: await fetchFeed(source, url) })),
  );
  return results.map(({ source, result }) => {
    if (!result.ok) return { source, result };
    return { source, result: { ...result, data: result.data.filter((item) => isUnlvRelevant(item, source)) } };
  });
}
