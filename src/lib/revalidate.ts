import { revalidatePath } from "next/cache";

/** Every ISR-cached route, revalidated together by both the cron job and the manual refresh button. */
export function revalidateAllData(): string[] {
  const paths = ["/", "/schedule", "/stats", "/roster"];
  for (const path of paths) {
    revalidatePath(path);
  }
  revalidatePath("/schedule/[id]", "page");
  return [...paths, "/schedule/[id]"];
}
