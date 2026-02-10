import { db } from "@/lib/db";
import { thumb } from "@/lib/thumbnails";
import { BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const stories = await db.stories.getPublished();
  const sortedStories = stories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <main className="min-h-screen bg-[#111] text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <div className="max-w-6xl mx-auto">
          <div className="flex items-center flex-wrap gap-3 mb-8">
            <Link
              href="/stories"
              className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-semibold rounded-full border border-gray-700 hover:border-red-600 hover:text-white transition-all"
            >
              All Stories
            </Link>
            <Link
              href="/stories?storyType=real"
              className="px-4 py-2 bg-red-900/30 text-red-400 text-sm font-semibold rounded-full border border-red-800/50 hover:bg-red-900/50 hover:text-red-300 transition-all"
            >
              Real
            </Link>
            <Link
              href="/stories?storyType=fictional"
              className="px-4 py-2 bg-purple-900/20 text-purple-400 text-sm font-semibold rounded-full border border-purple-800/50 hover:bg-purple-900/40 transition-all"
            >
              Fictional
            </Link>
            <Link
              href="/stories?storyType=tabu"
              className="px-4 py-2 bg-gray-900 text-red-500 text-sm font-semibold rounded-full border border-red-900/50 hover:bg-red-950 transition-all"
            >
              ⚠️ Taboo
            </Link>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-400 mb-2">
                No stories available yet
              </h2>
              <p className="text-gray-500">
                Exciting content coming soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedStories.map((story) => (
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

        <footer className="text-center mt-16 text-sm text-gray-600">
          <div className="w-12 h-0.5 bg-red-800 mx-auto mb-3"></div>
          <p>Adults only (18+)</p>
        </footer>
      </div>
    </main>
  );
}
