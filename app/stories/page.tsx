import { db } from "@/lib/db";
import { TrendingUp, Filter } from "lucide-react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { [key: string]: string | undefined };
}

export async function generateMetadata({ searchParams }: PageProps) {
  const parts: string[] = [];
  if (searchParams.storyType) parts.push(searchParams.storyType === "real" ? "Reale" : "Fiktionale");
  if (searchParams.city) parts.push(`aus ${searchParams.city}`);
  if (searchParams.location) parts.push(`im ${searchParams.location}`);
  if (searchParams.intensity) parts.push(`Intensität ${searchParams.intensity}/10`);

  const title = parts.length > 0
    ? `${parts.join(" ")} Geschichten – RedStory`
    : "Alle Geschichten – RedStory";

  return { title };
}

export default async function StoriesPage({ searchParams }: PageProps) {
  const hasFilters = searchParams.storyType || searchParams.city || searchParams.location || searchParams.intensity;

  const stories = hasFilters
    ? await db.stories.getFiltered({
        storyType: searchParams.storyType,
        city: searchParams.city,
        locationSlug: searchParams.location,
        intensity: searchParams.intensity ? parseInt(searchParams.intensity) : undefined,
      })
    : await db.stories.getPublished();

  // Build active filter labels
  const activeFilters: { label: string; removeUrl: string }[] = [];
  const buildUrl = (exclude: string) => {
    const params = new URLSearchParams();
    if (searchParams.storyType && exclude !== "storyType") params.set("storyType", searchParams.storyType);
    if (searchParams.city && exclude !== "city") params.set("city", searchParams.city);
    if (searchParams.location && exclude !== "location") params.set("location", searchParams.location);
    if (searchParams.intensity && exclude !== "intensity") params.set("intensity", searchParams.intensity);
    const qs = params.toString();
    return `/stories${qs ? `?${qs}` : ""}`;
  };

  if (searchParams.storyType) {
    activeFilters.push({
      label: searchParams.storyType === "tabu" ? "⚠️ Tabu" : searchParams.storyType === "real" ? "Real" : "Fiktional",
      removeUrl: buildUrl("storyType"),
    });
  }
  if (searchParams.city) {
    activeFilters.push({ label: searchParams.city, removeUrl: buildUrl("city") });
  }
  if (searchParams.location) {
    activeFilters.push({ label: searchParams.location, removeUrl: buildUrl("location") });
  }
  if (searchParams.intensity) {
    activeFilters.push({ label: `🔥 ${searchParams.intensity}/10`, removeUrl: buildUrl("intensity") });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-rose-950 dark:to-red-950">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {hasFilters ? "Gefilterte Geschichten" : "Alle Geschichten"}
            </h1>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
              {activeFilters.map((f) => (
                <Link
                  key={f.label}
                  href={f.removeUrl}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  {f.label}
                  <span className="ml-1 text-xs">✕</span>
                </Link>
              ))}
              <Link
                href="/stories"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 underline"
              >
                Alle Filter entfernen
              </Link>
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-400">
            {stories.length} {stories.length === 1 ? "Geschichte" : "Geschichten"} gefunden
          </p>
        </header>

        {stories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Keine Geschichten mit diesen Filtern gefunden.
            </p>
            <Link
              href="/stories"
              className="text-red-600 dark:text-red-400 font-semibold hover:underline"
            >
              Alle Geschichten anzeigen →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="p-6">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      (story as any).storyType === "tabu"
                        ? "bg-gray-800 text-red-400"
                        : (story as any).storyType === "fictional"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    }`}>
                      {(story as any).storyType === "tabu" ? "⚠️ Tabu" : (story as any).storyType === "fictional" ? "Fiktional" : "Real"}
                    </span>
                    {(story as any).location && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                        {(story as any).location.name}
                      </span>
                    )}
                    {(story as any).city && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                        {(story as any).city}
                      </span>
                    )}
                    {(story as any).intensity && (
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full">
                        🔥 {(story as any).intensity}/10
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs ml-auto">
                      <TrendingUp className="w-3 h-3" />
                      {story.views}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {story.title}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                    {story.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(story.createdAt).toLocaleDateString("de-DE")}
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-semibold text-sm group-hover:underline">
                      Weiterlesen →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
