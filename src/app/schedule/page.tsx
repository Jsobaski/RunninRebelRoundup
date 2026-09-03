import { ScheduleView } from "@/components/ScheduleView";
import { getSchedule } from "@/lib/data/services/schedule-service";

export const revalidate = 1800;

export default async function SchedulePage() {
  const { games } = await getSchedule();
  return <ScheduleView games={games} />;
}
