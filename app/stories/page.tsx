import { db } from "@/lib/db";
import { thumb } from "@/lib/thumbnails";
import { TrendingUp, Filter } from "lucide-react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { [key: string]: string | undefined };
}

export async function generateMetadata({ searchParams }: PageProps) {
  const parts: string[] = [];
  if (searchParams.storyType) parts.push(searchParams.storyType === "tabu" ? "Taboo" : searchParams.storyType === "real" ? "Real" : "Fictional");
  if (searchParams.city) parts.push(`from ${searchParams.city}`);
  if (searchParams.location) parts.push(`at ${searchParams.location}`);
  if (searchParams.intensity) parts.push(`Intensity ${searchParams.intensity}/10`);

  const title = parts.length > 0
    ? `${parts.join(" ")} Stories – VelvetScripts`
    : "All Stories – VelvetScripts";

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
      label: searchParams.storyType === "tabu" ? "⚠️ Taboo" : searchParams.storyType === "real" ? "Real" : "Fictional",
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
    <main className="min-h-screen bg-[#111] text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-white">
              {hasFilters ? "Filtered Stories" : "All Stories"}
            </h1>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-500">Filters:</span>
              {activeFilters.map((f) => (
                <Link
                  key={f.label}
                  href={f.removeUrl}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-950/50 text-red-400 text-sm font-semibold rounded-full border border-red-800/30 hover:bg-red-900/50 transition-colors"
                >
                  {f.label}
                  <span className="ml-1 text-xs">✕</span>
                </Link>
              ))}
              <Link
                href="/stories"
                className="text-sm text-gray-500 hover:text-red-500 underline"
              >
                Remove all filters
              </Link>
            </div>
          )}

          <p className="text-gray-500">
            {stories.length} {stories.length === 1 ? "story" : "stories"} found
          </p>
        </header>

        {stories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-4">
              No stories found with these filters.
            </p>
            <Link
              href="/stories"
              className="text-red-500 font-semibold hover:underline"
            >
              Show all stories →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="group relative bg-gray-900/80 rounded-xl border border-gray-800 overflow-hidden hover:border-red-700/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all duration-300"
              >
                {(story as any).heroImage && (
                  <div className="absolute inset-0">
                    <img
                      src={thumb((story as any).heroImage)}
                      alt=""
                      className="w-full h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/60"></div>
                  </div>
                )}
                <div className="relative p-6">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      (story as any).storyType === "tabu"
                        ? "bg-red-950 text-red-400 border border-red-800/50"
                        : (story as any).storyType === "fictional"
                          ? "bg-purple-950 text-purple-400 border border-purple-800/50"
                          : "bg-red-950/50 text-red-400 border border-red-800/30"
                    }`}>
                      {(story as any).storyType === "tabu" ? "⚠️ Taboo" : (story as any).storyType === "fictional" ? "Fictional" : "Real"}
                    </span>
                    {(story as any).location && (
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full">
                        {(story as any).location.name}
                      </span>
                    )}
                    {(story as any).city && (
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full">
                        {(story as any).city}
                      </span>
                    )}
                    {(story as any).intensity && (
                      <span className="px-2 py-0.5 bg-orange-950/50 text-orange-400 text-xs font-semibold rounded-full">
                        🔥 {(story as any).intensity}/10
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-600 text-xs ml-auto">
                      <TrendingUp className="w-3 h-3" />
                      {story.views}
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-red-500 transition-colors">
                    {story.title}
                  </h2>

                  <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                    {story.excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">
                        {new Date(story.createdAt).toLocaleDateString("en-US")}
                      </span>
                      {(story as any).images?.length > 0 && (
                        <div className="flex -space-x-2">
                          {(story as any).images.slice(0, 4).map((img: any, i: number) => (
                            <img
                              key={i}
                              src={thumb(img.filename)}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border-2 border-gray-900"
                            />
                          ))}
                          {(story as any).images.length > 4 && (
                            <div className="w-7 h-7 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                              +{(story as any).images.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-red-500 font-semibold text-sm group-hover:underline">
                      Read →
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
