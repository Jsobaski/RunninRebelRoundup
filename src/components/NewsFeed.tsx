import type { NewsItem } from "@/lib/data/types";
import type { NewsFeedStatus } from "@/lib/data/services/news-service";
import { Unavailable } from "@/components/Unavailable";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NewsFeed({ items, feedStatus }: { items: NewsItem[]; feedStatus: NewsFeedStatus[] }) {
  const failedFeeds = feedStatus.filter((f) => !f.ok);

  if (items.length === 0) {
    return <Unavailable label="News" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {failedFeeds.length > 0 && (
        <p className="text-xs text-foreground/40">
          Unavailable: {failedFeeds.map((f) => f.source).join(", ")}
        </p>
      )}
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-unlv-red"
        >
          <div className="flex items-center gap-2 text-xs text-foreground/50">
            <span className="font-medium text-unlv-red">{item.source}</span>
            <span>·</span>
            <span>{timeAgo(item.publishedAt)}</span>
          </div>
          <span className="font-semibold leading-snug">{item.title}</span>
          {item.summary && <span className="text-sm text-foreground/60 line-clamp-2">{item.summary}</span>}
        </a>
      ))}
    </div>
  );
}
