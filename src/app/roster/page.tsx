import { getRecruiting, getRoster } from "@/lib/data/services/roster-service";
import { Unavailable } from "@/components/Unavailable";

export const revalidate = 43200;

function formatHeight(inches: number) {
  if (!inches) return "--";
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

const STATUS_COLOR: Record<string, string> = {
  Committed: "bg-emerald-100 text-emerald-700",
  Signed: "bg-emerald-100 text-emerald-700",
  Enrolled: "bg-blue-100 text-blue-700",
  Target: "bg-amber-100 text-amber-700",
};

export default async function RosterPage() {
  const [{ players, source: rosterSource }, { prospects, source: recruitingSource }] = await Promise.all([
    getRoster(),
    getRecruiting(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Roster & Recruiting</h1>
        <p className="text-sm text-foreground/60">
          {rosterSource === "seed" ? "Showing seed roster data — live scrape unavailable." : "Current roster"}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Roster</h2>
        {players.length === 0 ? (
          <Unavailable label="Roster" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((p) => (
              <div key={p.id} className="flex gap-3 rounded-lg border border-border bg-surface p-3">
                {p.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photoUrl} alt={p.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-unlv-red/10 text-lg font-bold text-unlv-red">
                    #{p.jersey}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-xs text-foreground/60">
                    #{p.jersey} · {p.position} · {p.classYear}
                  </span>
                  <span className="text-xs text-foreground/60">{formatHeight(p.heightInches)}</span>
                  {p.hometown && <span className="text-xs text-foreground/50">{p.hometown}</span>}
                  {p.stats && (
                    <span className="mt-1 text-xs font-medium text-unlv-red">
                      {p.stats.pointsPerGame.toFixed(1)} PPG · {p.stats.reboundsPerGame.toFixed(1)} RPG ·{" "}
                      {p.stats.assistsPerGame.toFixed(1)} APG
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Recruiting</h2>
        <p className="text-xs text-foreground/50">
          Scraped data — treat as &quot;last updated,&quot; not real-time.
          {recruitingSource === "seed" && " Live scrape unavailable, showing seed data."}
        </p>
        {prospects.length === 0 ? (
          <Unavailable label="Recruiting" />
        ) : (
          <div className="flex flex-col gap-2">
            {prospects.map((r) => (
              <a
                key={r.id}
                href={r.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 hover:border-unlv-red"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {r.name} <span className="text-xs font-normal text-foreground/50">{r.position}</span>
                  </span>
                  <span className="text-xs text-foreground/50">
                    {r.hometown ?? "Hometown unknown"} · Class of {r.classYear} · via {r.sourceName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {r.stars && <span className="text-xs text-amber-500">{"★".repeat(r.stars)}</span>}
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLOR[r.status]}`}>
                    {r.status}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
