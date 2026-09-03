import { ScheduleView } from "@/components/ScheduleView";
import { SeedNotice } from "@/components/SeedNotice";
import { getSchedule } from "@/lib/data/services/schedule-service";

export const revalidate = 1800;

export default async function SchedulePage() {
  const { games, source } = await getSchedule();
  return (
    <div className="flex flex-col gap-4">
      {source === "seed" && <SeedNotice label="schedule" />}
      <ScheduleView games={games} />
    </div>
  );
}
