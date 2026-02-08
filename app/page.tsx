import { db } from "@/lib/db";
import { BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const stories = await db.stories.getPublished();
  const sortedStories = stories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-rose-950 dark:to-red-950">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <div className="max-w-6xl mx-auto">
          <div className="flex items-center flex-wrap gap-3 mb-8">
            <Link
              href="/stories"
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-full shadow hover:shadow-md transition-all hover:text-red-600 dark:hover:text-red-400"
            >
              Alle Geschichten
            </Link>
            <Link
              href="/stories?storyType=real"
              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-full shadow hover:shadow-md transition-all hover:bg-red-200 dark:hover:bg-red-900/50"
            >
              Real
            </Link>
            <Link
              href="/stories?storyType=fictional"
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-semibold rounded-full shadow hover:shadow-md transition-all hover:bg-purple-200 dark:hover:bg-purple-900/50"
            >
              Fiktional
            </Link>
            <Link
              href="/stories?storyType=tabu"
              className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-red-400 text-sm font-semibold rounded-full shadow hover:shadow-md transition-all hover:bg-gray-700 dark:hover:bg-gray-600"
            >
              ⚠️ Tabu
            </Link>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Noch keine Geschichten verfügbar
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Bald gibt es hier spannende Inhalte zu entdecken!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedStories.map((story) => (
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

        <footer className="text-center mt-16 text-sm text-gray-500 dark:text-gray-400">
          <p className="mt-2">Nur für Erwachsene (18+)</p>
        </footer>
      </div>
    </main>
  );
}
