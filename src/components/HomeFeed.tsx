"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/data/types";
import type { NewsFeedStatus } from "@/lib/data/services/news-service";
import { NewsFeed } from "@/components/NewsFeed";
import { XTimeline } from "@/components/XTimeline";

type Filter = "all" | "news" | "social";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "news", label: "News" },
  { key: "social", label: "Social" },
];

export function HomeFeed({ items, feedStatus }: { items: NewsItem[]; feedStatus: NewsFeedStatus[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex rounded-full border border-border bg-surface p-0.5 text-sm w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 font-medium ${
              filter === f.key ? "bg-unlv-red text-white" : "text-foreground/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter !== "social" && <NewsFeed items={items} feedStatus={feedStatus} />}
      {filter !== "news" && <XTimeline />}
    </div>
  );
}
