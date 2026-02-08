import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookOpen, Video, Heart } from "lucide-react";
import Link from "next/link";
import StoryContent from "@/components/StoryContent";
import CamgirlWidget from "@/components/CamgirlWidget";
import { mapAppearanceToCamFilters } from "@/lib/cam-filter-mapper";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const story = await db.stories.getBySlug(params.slug);
  
  if (!story) {
    return {
      title: "Geschichte nicht gefunden",
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
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-rose-950 dark:to-red-950">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <Link
                href={`/stories?storyType=${(story as any).storyType || "real"}`}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                  (story as any).storyType === "tabu"
                    ? "bg-gray-800 text-red-400 hover:bg-gray-700"
                    : (story as any).storyType === "fictional"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                }`}
              >
                {(story as any).storyType === "tabu" ? "⚠️ Tabu" : (story as any).storyType === "fictional" ? "Fiktional" : "Real"}
              </Link>
              {(story as any).location && (
                <Link
                  href={`/stories?location=${(story as any).location.slug}`}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {(story as any).location.name}
                </Link>
              )}
              {(story as any).city && (
                <Link
                  href={`/stories?city=${encodeURIComponent((story as any).city)}`}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  {(story as any).city}
                </Link>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              {story.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {new Date(story.createdAt).toLocaleDateString("de-DE")}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {story.views} Aufrufe
              </div>
            </div>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <StoryContent content={story.content} />
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 border-2 border-red-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-6 h-6 text-red-500" />
              <h3 className="text-2xl font-bold text-white">Mehr Live-Action?</h3>
            </div>
            <p className="mb-6 text-gray-300">
              Entdecke weitere Models, die zu deinen Vorlieben passen
            </p>
            {/* <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-xs font-mono text-gray-400">
              <span className="text-yellow-400 font-bold">DEBUG Filter:</span>{" "}
              <span className="text-green-400">ages</span>={camFilters.ages.join(", ") || "–"} |{" "}
              <span className="text-green-400">ethnicities</span>={camFilters.ethnicities.join(", ") || "–"} |{" "}
              <span className="text-green-400">languages</span>={camFilters.languages.join(", ") || "–"} |{" "}
              <span className="text-green-400">genders</span>={camFilters.genders.join(", ")} |{" "}
              <span className="text-green-400">tags</span>={camFilters.tags.join(", ") || "–"}
              {(story as any).femaleAppearance && (
                <div className="mt-1 text-gray-500">
                  <span className="text-yellow-400">Source:</span> {(story as any).femaleAppearance}
                </div>
              )}
            </div> */}
            <CamgirlWidget
              theme={story.theme || "default"}
              genders={camFilters.genders}
              ages={camFilters.ages}
              ethnicities={camFilters.ethnicities}
              languages={camFilters.languages}
              tags={camFilters.tags}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
