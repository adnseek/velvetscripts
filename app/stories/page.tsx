import { db } from "@/lib/db";
import { thumb } from "@/lib/thumbnails";
import { TrendingUp, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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

function buildFilterUrl(searchParams: PageProps["searchParams"], overrides: Record<string, string | undefined>, resetPage = true) {
  const params = new URLSearchParams();
  const merged = { ...searchParams, ...overrides };
  if (resetPage) delete merged.page;
  if (merged.storyType) params.set("storyType", merged.storyType);
  if (merged.city) params.set("city", merged.city);
  if (merged.location) params.set("location", merged.location);
  if (merged.intensity) params.set("intensity", merged.intensity);
  if (merged.page && merged.page !== "1") params.set("page", merged.page);
  const qs = params.toString();
  return `/stories${qs ? `?${qs}` : ""}`;
}

export default async function StoriesPage({ searchParams }: PageProps) {
  const [filterOptions, allStories] = await Promise.all([
    db.stories.getFilterOptions(),
    searchParams.storyType || searchParams.city || searchParams.location || searchParams.intensity
      ? db.stories.getFiltered({
          storyType: searchParams.storyType,
          city: searchParams.city,
          locationSlug: searchParams.location,
          intensity: searchParams.intensity ? parseInt(searchParams.intensity) : undefined,
        })
      : db.stories.getPublished(),
  ]);

  // Pagination
  const page = Math.max(1, parseInt(searchParams.page || "1") || 1);
  const totalPages = Math.ceil(allStories.length / PER_PAGE);
  const stories = allStories.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Active filter chips
  const activeFilters: { label: string; removeUrl: string }[] = [];
  if (searchParams.storyType) {
    activeFilters.push({
      label: searchParams.storyType === "tabu" ? "⚠️ Taboo" : searchParams.storyType === "real" ? "Real" : "Fictional",
      removeUrl: buildFilterUrl(searchParams, { storyType: undefined }),
    });
  }
  if (searchParams.city) {
    activeFilters.push({ label: `📍 ${searchParams.city}`, removeUrl: buildFilterUrl(searchParams, { city: undefined }) });
  }
  if (searchParams.location) {
    const locName = filterOptions.locations.find(l => l.slug === searchParams.location)?.name || searchParams.location;
    activeFilters.push({ label: `🏠 ${locName}`, removeUrl: buildFilterUrl(searchParams, { location: undefined }) });
  }
  if (searchParams.intensity) {
    activeFilters.push({ label: `🔥 ${searchParams.intensity}/10`, removeUrl: buildFilterUrl(searchParams, { intensity: undefined }) });
  }

  return (
    <main className="min-h-screen bg-[#111] text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-white">
              {activeFilters.length > 0 ? "Filtered Stories" : "All Stories"}
            </h1>
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-3 mb-5">
            {/* Story Type */}
            <div className="flex gap-1.5">
              {[
                { value: "", label: "All Types" },
                { value: "real", label: "Real" },
                { value: "fictional", label: "Fictional" },
                { value: "tabu", label: "⚠️ Taboo" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={buildFilterUrl(searchParams, { storyType: opt.value || undefined })}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                    (searchParams.storyType || "") === opt.value
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-red-700 hover:text-gray-200"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>

            {/* City dropdown */}
            {filterOptions.cities.length > 0 && (
              <div className="relative group">
                <button className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                  searchParams.city
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-red-700"
                }`}>
                  📍 {searchParams.city || "City"} ▾
                </button>
                <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 hidden group-hover:block max-h-64 overflow-y-auto min-w-[180px]">
                  <Link
                    href={buildFilterUrl(searchParams, { city: undefined })}
                    className="block px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    All Cities
                  </Link>
                  {filterOptions.cities.map((city) => (
                    <Link
                      key={city}
                      href={buildFilterUrl(searchParams, { city })}
                      className={`block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white ${
                        searchParams.city === city ? "text-red-400 bg-gray-800/50" : "text-gray-400"
                      }`}
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Location dropdown */}
            {filterOptions.locations.length > 0 && (
              <div className="relative group">
                <button className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                  searchParams.location
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-red-700"
                }`}>
                  🏠 {filterOptions.locations.find(l => l.slug === searchParams.location)?.name || "Location"} ▾
                </button>
                <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 hidden group-hover:block max-h-64 overflow-y-auto min-w-[180px]">
                  <Link
                    href={buildFilterUrl(searchParams, { location: undefined })}
                    className="block px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    All Locations
                  </Link>
                  {filterOptions.locations.map((loc) => (
                    <Link
                      key={loc.slug}
                      href={buildFilterUrl(searchParams, { location: loc.slug })}
                      className={`block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white ${
                        searchParams.location === loc.slug ? "text-red-400 bg-gray-800/50" : "text-gray-400"
                      }`}
                    >
                      {loc.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Intensity dropdown */}
            {filterOptions.intensities.length > 0 && (
              <div className="relative group">
                <button className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                  searchParams.intensity
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-red-700"
                }`}>
                  🔥 {searchParams.intensity ? `${searchParams.intensity}/10` : "Intensity"} ▾
                </button>
                <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 hidden group-hover:block min-w-[140px]">
                  <Link
                    href={buildFilterUrl(searchParams, { intensity: undefined })}
                    className="block px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    All Levels
                  </Link>
                  {filterOptions.intensities.map((level) => (
                    <Link
                      key={level}
                      href={buildFilterUrl(searchParams, { intensity: String(level) })}
                      className={`block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white ${
                        searchParams.intensity === String(level) ? "text-red-400 bg-gray-800/50" : "text-gray-400"
                      }`}
                    >
                      🔥 {level}/10
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-500">Active:</span>
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
                Clear all
              </Link>
            </div>
          )}

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
                      <Link
                        href={buildFilterUrl(searchParams, { location: (story as any).location.slug })}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        {(story as any).location.name}
                      </Link>
                    )}
                    {(story as any).city && (
                      <Link
                        href={buildFilterUrl(searchParams, { city: (story as any).city })}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        {(story as any).city}
                      </Link>
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
                  href={buildFilterUrl(searchParams, { page: String(page - 1) }, false)}
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
                      href={buildFilterUrl(searchParams, { page: String(p) }, false)}
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
                  href={buildFilterUrl(searchParams, { page: String(page + 1) }, false)}
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
