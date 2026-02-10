import { db } from "@/lib/db";
import { thumb } from "@/lib/thumbnails";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = 'force-dynamic';

const PER_PAGE = 24;

interface PageProps {
  searchParams: { [key: string]: string | undefined };
}

export async function generateMetadata({ searchParams }: PageProps) {
  const parts: string[] = [];
  if (searchParams.storyType) parts.push(searchParams.storyType === "tabu" ? "Taboo" : searchParams.storyType === "real" ? "Real" : "Fictional");
  if (searchParams.city) parts.push(`from ${searchParams.city}`);
  if (searchParams.location) parts.push(`at ${searchParams.location}`);
  if (searchParams.intensity) parts.push(`Intensity ${searchParams.intensity}/10`);
  if (searchParams.page && parseInt(searchParams.page) > 1) parts.push(`Page ${searchParams.page}`);

  const title = parts.length > 0
    ? `${parts.join(" ")} Stories – VelvetScripts`
    : "All Stories – VelvetScripts";

  return { title };
}

function buildPageUrl(searchParams: PageProps["searchParams"], pageNum: number) {
  const params = new URLSearchParams();
  if (searchParams.storyType) params.set("storyType", searchParams.storyType);
  if (searchParams.city) params.set("city", searchParams.city);
  if (searchParams.location) params.set("location", searchParams.location);
  if (searchParams.intensity) params.set("intensity", searchParams.intensity);
  if (pageNum > 1) params.set("page", String(pageNum));
  const qs = params.toString();
  return `/stories${qs ? `?${qs}` : ""}`;
}

export default async function StoriesPage({ searchParams }: PageProps) {
  // Load all published stories once, filter in-memory
  const allPublished = await db.stories.getPublished();

  // Apply filters
  let allStories = allPublished;
  if (searchParams.storyType) allStories = allStories.filter(s => (s as any).storyType === searchParams.storyType);
  if (searchParams.city) allStories = allStories.filter(s => (s as any).city === searchParams.city);
  if (searchParams.location) allStories = allStories.filter(s => (s as any).location?.slug === searchParams.location);
  if (searchParams.intensity) allStories = allStories.filter(s => (s as any).intensity === parseInt(searchParams.intensity!));

  // Compute reactive filter options: each dropdown shows values available with OTHER filters applied
  const withoutCity = allPublished
    .filter(s => (!searchParams.storyType || (s as any).storyType === searchParams.storyType))
    .filter(s => (!searchParams.location || (s as any).location?.slug === searchParams.location))
    .filter(s => (!searchParams.intensity || (s as any).intensity === parseInt(searchParams.intensity!)));
  const withoutLocation = allPublished
    .filter(s => (!searchParams.storyType || (s as any).storyType === searchParams.storyType))
    .filter(s => (!searchParams.city || (s as any).city === searchParams.city))
    .filter(s => (!searchParams.intensity || (s as any).intensity === parseInt(searchParams.intensity!)));
  const withoutIntensity = allPublished
    .filter(s => (!searchParams.storyType || (s as any).storyType === searchParams.storyType))
    .filter(s => (!searchParams.city || (s as any).city === searchParams.city))
    .filter(s => (!searchParams.location || (s as any).location?.slug === searchParams.location));

  const availableCities = [...new Set(withoutCity.map(s => (s as any).city).filter(Boolean))].sort() as string[];
  const availableLocations = [...new Map(
    withoutLocation.filter(s => (s as any).location).map(s => [(s as any).location.slug, (s as any).location.name])
  ).entries()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
  const availableIntensities = [...new Set(withoutIntensity.map(s => (s as any).intensity))].sort((a, b) => a - b);

  // Pagination
  const page = Math.max(1, parseInt(searchParams.page || "1") || 1);
  const totalPages = Math.ceil(allStories.length / PER_PAGE);
  const stories = allStories.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Dynamic H1 title
  const intensityNum = searchParams.intensity ? parseInt(searchParams.intensity) : 0;
  const intensityLabel = intensityNum >= 9 ? "Hardcore" : intensityNum >= 7 ? "Hot" : intensityNum >= 5 ? "Spicy" : intensityNum >= 3 ? "Sensual" : intensityNum >= 1 ? "Soft" : "";
  const typeLabel = searchParams.storyType === "tabu" ? "Taboo" : searchParams.storyType === "fictional" ? "Fictional" : searchParams.storyType === "real" ? "Real" : "";
  const locName = searchParams.location ? (availableLocations.find((l: any) => l.slug === searchParams.location)?.name || searchParams.location) : "";
  const cityName = searchParams.city || "";

  let dynamicTitle = "All Stories";
  const hasAnyFilter = typeLabel || cityName || locName || intensityLabel;
  if (hasAnyFilter) {
    const parts: string[] = [];
    if (intensityLabel) parts.push(intensityLabel);
    if (typeLabel) parts.push(typeLabel);
    parts.push("Stories");
    if (locName && cityName) {
      dynamicTitle = `${parts.join(" ")} from ${cityName} ${locName}s`;
    } else if (cityName) {
      dynamicTitle = `${parts.join(" ")} from ${cityName}`;
    } else if (locName) {
      dynamicTitle = `${parts.join(" ")} at the ${locName}`;
    } else {
      dynamicTitle = parts.join(" ");
    }
    if (intensityNum) dynamicTitle += ` 🔥 ${intensityNum}/10`;
  }

  return (
    <main className="min-h-screen bg-[#111] text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader filterOptions={{ cities: availableCities, locations: availableLocations, intensities: availableIntensities }} />

        <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {dynamicTitle}
          </h1>
          <p className="text-gray-500">
            {allStories.length} {allStories.length === 1 ? "story" : "stories"} found
            {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
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
          <>
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
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/40"></div>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Link
                  href={buildPageUrl(searchParams, page - 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:border-red-700 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce((acc: (number | string)[], p, i, arr) => {
                  if (i > 0 && typeof arr[i - 1] === "number" && (p as number) - (arr[i - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  typeof p === "string" ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-600">...</span>
                  ) : (
                    <Link
                      key={p}
                      href={buildPageUrl(searchParams, p)}
                      className={`px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        p === page
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-gray-800 text-gray-400 border-gray-700 hover:border-red-700 hover:text-white"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}

              {page < totalPages && (
                <Link
                  href={buildPageUrl(searchParams, page + 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:border-red-700 hover:text-white transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
          </>
        )}
        </div>
      </div>
    </main>
  );
}
