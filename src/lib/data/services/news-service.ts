import { fetchAllNews } from "@/lib/data/adapters/rss";
import type { NewsItem, NewsSource } from "@/lib/data/types";

export interface NewsFeedStatus {
  source: NewsSource;
  ok: boolean;
  error?: string;
}

export interface NewsResult {
  items: NewsItem[];
  feedStatus: NewsFeedStatus[];
}

export async function getNews(): Promise<NewsResult> {
  const feeds = await fetchAllNews();

  const items = feeds
    .flatMap(({ result }) => (result.ok ? result.data : []))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const feedStatus: NewsFeedStatus[] = feeds.map(({ source, result }) => ({
    source,
    ok: result.ok,
    error: result.ok ? undefined : result.error,
  }));

  return { items, feedStatus };
}
