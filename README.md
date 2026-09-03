# Runnin' Rebel Roundup

A personal-use web app for following UNLV Runnin' Rebels men's basketball: news, social posts, schedule, matchup comparisons, stats, and rankings. Built with Next.js (App Router), TypeScript, and Tailwind CSS, deployed on Vercel.

Unofficial fan project — not affiliated with UNLV Athletics.

## Features

- **Home** — reverse-chronological news feed (RSS) with a News / Social / All filter, plus an embedded X timeline.
- **Schedule** — month calendar and list views; click a game for a detail page with a season-average matchup comparison and final score once played.
- **Stats & Rankings** — team averages, player leaders, AP/NET rank, and a rank-trend chart.
- **Roster & Recruiting** — current roster with per-player stats, and a recruiting board (committed/target prospects).
- **Manual refresh** — a Refresh button in the nav bar re-fetches all data sources on demand (20s cooldown so repeat clicks don't hammer upstream sources), independent of the cron job below.

## Data sources

Every external source is isolated behind its own adapter module in `src/lib/data/adapters/`, each returning a `FetchResult<T>` (`{ ok: true, data }` or `{ ok: false, error }`) so one broken source degrades its own UI section instead of crashing the app. A `services/` layer wraps each adapter with a fallback to seed data in `src/lib/data/seed/` when the live source is unavailable.

| Data | Adapter | Notes |
|---|---|---|
| Scores, schedule, team/player stats, rankings | `adapters/espn.ts` | ESPN's public but **unofficial, undocumented** endpoints (`site.api.espn.com`, `sports.core.api.espn.com`). No auth, no SLA — the shape can change with zero notice. Not for commercial use. |
| News | `adapters/rss.ts` | RSS from UNLV Athletics, Las Vegas Review-Journal, Vegas Sun, and ESPN's general CBB feed (filtered to UNLV mentions). |
| Social | `components/XTimeline.tsx` | X's native embedded timeline widget, scoped to a curated List — client-side, free, no API key. |
| Roster | `adapters/roster-scraper.ts` | Scrapes UNLV's official athletics roster page. |
| Recruiting | `adapters/recruiting-scraper.ts` | Scrapes a public 247Sports team commits page. Treat as "last updated," not real-time. |

### A note on the ESPN and scraper adapters

This project was built in a sandboxed environment with no outbound network access to espn.com, unlvrebels.com, 247sports.com, or the RSS feed hosts, so **none of the ESPN endpoint calls or CSS selectors below have been exercised against live responses.** They're implemented against the well-documented public shape of ESPN's site API and typical Sidearm Sports / 247Sports markup, with defensive parsing (optional chaining, try/catch, empty-result fallback) so a wrong guess degrades to seed data instead of crashing — but budget time to verify and adjust:

- Confirm `ESPN_UNLV_TEAM_ID` (defaults to `2439`) against `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/2439`.
- Confirm the RSS feed URLs in `adapters/rss.ts` still resolve (news sites restructure feeds without warning).
- Verify the `.sidearm-roster-player` selectors in `adapters/roster-scraper.ts` against the live roster page — Sidearm Sports (what most college athletics sites, including UNLV's, run on) changes markup periodically.
- Verify the `.ri-page__list-item` selectors in `adapters/recruiting-scraper.ts` against the live 247Sports commits page.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values, see comments in the file
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example` for the full list with explanations. Key ones:

- `ESPN_UNLV_TEAM_ID` — ESPN's team id for UNLV men's basketball.
- `NEXT_PUBLIC_X_LIST_URL` — URL of the X List to embed on the home feed's Social tab. Without it, that section shows a setup placeholder instead of crashing.
- `UNLV_ROSTER_URL` / `UNLV_RECRUITING_URL` — scraper targets, overridable if the source sites move.
- `CRON_SECRET` — shared secret Vercel Cron sends to `/api/cron/refresh`; set it on Vercel so the endpoint isn't publicly triggerable.

## Deployment (Vercel)

1. Push this repo to GitHub and import it in Vercel.
2. Set the environment variables above in Project Settings → Environment Variables.
3. Deploy. Data-backed pages use ISR (`export const revalidate = ...` per route) so they're served from cache and refreshed in the background — no live fetch on every request.
4. `vercel.json` defines a cron job hitting `/api/cron/refresh` once daily (noon UTC) to proactively warm the ISR cache. **Vercel's Hobby plan rejects the deploy outright if a cron schedule would fire more than once a day**, so this stays daily by default — ISR's own on-demand revalidation (each page's `revalidate` window) covers refreshes in between. If you're on Pro and want tighter cache warming (e.g. every 6 hours during the season), change the schedule in `vercel.json` to `0 */6 * * *`.
5. The in-app Refresh button (`components/RefreshButton.tsx`) hits `/api/refresh`, a plain POST route — not a `vercel.json` cron entry — so it's unaffected by the Hobby cron limit above and works on any plan. Both refresh routes share the same revalidation logic in `lib/revalidate.ts`.

## Open decisions

These were flagged as decisions for you, not defaults baked in:

- **ESPN dependency risk.** If ESPN ever locks down these endpoints, the fallback is scraping NCAA.com or sports-reference.com instead — that would mean writing a new adapter in `adapters/`, not restructuring the app (the service layer and UI only know about the shared types in `lib/data/types.ts`).
- **Roster/recruiting scraping vs. manual updates.** The scrapers are wired up and isolated with graceful fallback, but if the selector-maintenance burden isn't worth it for a few-times-a-season roster/recruiting refresh, just edit `lib/data/seed/roster.ts` directly and skip fixing the scrapers — the service layer already prefers seed data whenever the live scrape fails or returns nothing.
- **Advanced efficiency metrics (KenPom-style).** Not implemented — no free structured source exists. Skipped per the spec's stretch-goal note rather than built as a fragile scrape.
