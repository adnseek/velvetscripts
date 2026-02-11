import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookOpen, Video, Heart } from "lucide-react";
import Link from "next/link";
import StoryContent from "@/components/StoryContent";
import CamgirlWidget from "@/components/CamgirlWidget";
import { mapAppearanceToCamFilters } from "@/lib/cam-filter-mapper";
import SiteHeader from "@/components/SiteHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const story = await db.stories.getBySlug(params.slug);
  
  if (!story) {
    return {
      title: "Story not found",
    };
  }

  return {
    title: story.seoTitle || story.title,
    description: story.seoDescription || story.excerpt,
  };
}

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const story = await db.stories.getBySlug(params.slug);

  if (!story) {
    notFound();
  }

  // Only increment views for published stories
  if (story.published) {
    await db.stories.incrementViews(params.slug);
  }

  const camFilters = mapAppearanceToCamFilters((story as any).femaleAppearance, story.title);

  return (
    <main className="min-h-screen bg-[#111] text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <article className="max-w-4xl mx-auto">
          {/* Hero Header */}
          <header className="relative mb-8 -mx-4 md:mx-0 rounded-none md:rounded-2xl overflow-hidden">
            {(story as any).heroImage ? (
              <div className="relative h-[350px] md:h-[450px]">
                <img
                  src={(story as any).heroImage}
                  alt={`${story.title} — atmosphere`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#111]/40 to-transparent h-24"></div>

                {/* Content over hero */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="flex items-center flex-wrap gap-2 mb-4">
                    <Link
                      href={`/stories?storyType=${(story as any).storyType || "real"}`}
                      className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider transition-colors backdrop-blur-sm ${
                        (story as any).storyType === "tabu"
                          ? "bg-red-950/80 text-red-400 border border-red-800/50"
                          : (story as any).storyType === "fictional"
                            ? "bg-purple-950/80 text-purple-400 border border-purple-800/50"
                            : "bg-red-950/60 text-red-400 border border-red-800/30"
                      }`}
                    >
                      {(story as any).storyType === "tabu" ? "⚠️ Taboo" : (story as any).storyType === "fictional" ? "Fictional" : "Real"}
                    </Link>
                    {(story as any).location && (
                      <Link
                        href={`/stories?location=${(story as any).location.slug}`}
                        className="px-3 py-1 bg-black/40 backdrop-blur-sm text-gray-300 text-xs font-semibold rounded-full border border-white/10 hover:border-red-700/50 transition-colors"
                      >
                        {(story as any).location.name}
                      </Link>
                    )}
                    {(story as any).city && (
                      <Link
                        href={`/stories?city=${encodeURIComponent((story as any).city)}`}
                        className="px-3 py-1 bg-black/40 backdrop-blur-sm text-gray-300 text-xs font-semibold rounded-full border border-white/10 hover:border-red-700/50 transition-colors"
                      >
                        {(story as any).city}
                      </Link>
                    )}
                    {(story as any).intensity && (
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border ${
                        (story as any).intensity >= 8
                          ? "bg-orange-950/80 text-orange-400 border-orange-800/50"
                          : (story as any).intensity >= 6
                            ? "bg-yellow-950/80 text-yellow-400 border-yellow-800/50"
                            : "bg-green-950/80 text-green-400 border-green-800/50"
                      }`}>
                        {(story as any).intensity >= 9 ? "🔥 Extreme" : (story as any).intensity >= 7 ? "🔥 Hardcore" : (story as any).intensity >= 5 ? "🔥 Steamy" : (story as any).intensity >= 4 ? "✨ Erotic" : "💕 Spicy Romance"} · Temperature {(story as any).intensity}/10
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg">
                    {story.title}
                  </h1>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {new Date(story.createdAt).toLocaleDateString("en-US")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {story.views} views
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback: no hero image */
              <div className="text-center py-10">
                <div className="flex items-center justify-center flex-wrap gap-2 mb-6">
                  <Link
                    href={`/stories?storyType=${(story as any).storyType || "real"}`}
                    className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider transition-colors ${
                      (story as any).storyType === "tabu"
                        ? "bg-red-950 text-red-400 border border-red-800/50 hover:bg-red-900/50"
                        : (story as any).storyType === "fictional"
                          ? "bg-purple-950 text-purple-400 border border-purple-800/50 hover:bg-purple-900/50"
                          : "bg-red-950/50 text-red-400 border border-red-800/30 hover:bg-red-900/30"
                    }`}
                  >
                    {(story as any).storyType === "tabu" ? "⚠️ Taboo" : (story as any).storyType === "fictional" ? "Fictional" : "Real"}
                  </Link>
                  {(story as any).location && (
                    <Link
                      href={`/stories?location=${(story as any).location.slug}`}
                      className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full border border-gray-700 hover:border-red-700/50 transition-colors"
                    >
                      {(story as any).location.name}
                    </Link>
                  )}
                  {(story as any).city && (
                    <Link
                      href={`/stories?city=${encodeURIComponent((story as any).city)}`}
                      className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full border border-gray-700 hover:border-red-700/50 transition-colors"
                    >
                      {(story as any).city}
                    </Link>
                  )}
                  {(story as any).intensity && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      (story as any).intensity >= 8
                        ? "bg-orange-950 text-orange-400 border-orange-800/50"
                        : (story as any).intensity >= 6
                          ? "bg-yellow-950 text-yellow-400 border-yellow-800/50"
                          : "bg-green-950 text-green-400 border-green-800/50"
                    }`}>
                      {(story as any).intensity >= 9 ? "🔥 Extreme" : (story as any).intensity >= 7 ? "🔥 Hardcore" : (story as any).intensity >= 5 ? "🔥 Steamy" : (story as any).intensity >= 4 ? "✨ Erotic" : "💕 Spicy Romance"} · Temperature {(story as any).intensity}/10
                    </span>
                  )}
                </div>
                <div className="w-12 h-0.5 bg-red-600 mx-auto mb-6"></div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                  {story.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {new Date(story.createdAt).toLocaleDateString("en-US")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {story.views} views
                  </div>
                </div>
                <div className="w-12 h-0.5 bg-red-600 mx-auto mt-6"></div>
              </div>
            )}
          </header>

          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 md:p-10 mb-8">
            <StoryContent
              content={story.content}
              images={((story as any).images || []).map((img: any) => ({
                sectionIdx: img.sectionIdx,
                heading: img.heading,
                filename: img.filename,
              }))}
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 border border-red-900/30">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-6 h-6 text-red-500" />
              <h3 className="text-2xl font-bold text-white">Want more live action?</h3>
            </div>
            <p className="mb-6 text-gray-300">
              Discover more models that match your preferences
            </p>
            <CamgirlWidget genders={["f"]} />
          </div>
        </article>
      </div>
    </main>
  );
}
