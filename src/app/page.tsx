import { HomeFeed } from "@/components/HomeFeed";
import { getNews } from "@/lib/data/services/news-service";

export const revalidate = 900;

export default async function Home() {
  const { items, feedStatus } = await getNews();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Home</h1>
      <HomeFeed items={items} feedStatus={feedStatus} />
    </div>
  );
}
