import { db } from "@/lib/db";
import { thumb } from "@/lib/thumbnails";
import { TrendingUp, PenLine, Flame } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const stories = await db.stories.getPublished();
  const sorted = stories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const latest = sorted.slice(0, 6);
  const newestStory = sorted[0];
  const realStories = sorted.filter(s => (s as any).storyType === "real");
  const fictionalStories = sorted.filter(s => (s as any).storyType === "fictional");
  const tabuStories = sorted.filter(s => (s as any).storyType === "tabu");

  // Pick a featured story per category (most views)
  const featuredReal = realStories.sort((a, b) => b.views - a.views)[0];
  const featuredFictional = fictionalStories.sort((a, b) => b.views - a.views)[0];
  const featuredTabu = tabuStories.sort((a, b) => b.views - a.views)[0];

  return (
    <main className="min-h-screen bg-[#050505] text-white antialiased selection:bg-red-600 selection:text-white">

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-900/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-3xl font-black tracking-tighter uppercase italic">
            Velvet<span className="text-[#bc002d] italic">Scripts</span>
          </Link>
          <div className="hidden lg:flex items-center space-x-10 text-xs font-bold uppercase tracking-[0.2em]">
            <Link href="/stories" className="hover:text-[#bc002d] transition">The Collection</Link>
            <Link href="/stories?storyType=real" className="hover:text-[#bc002d] transition">Real</Link>
            <Link href="/stories?storyType=fictional" className="hover:text-[#bc002d] transition">Fictional</Link>
            <Link href="/stories?storyType=tabu" className="hover:text-[#bc002d] transition">Taboo</Link>
            <Link href="/submit" className="bg-[#bc002d] px-5 py-2 rounded-full hover:bg-red-700 transition flex items-center gap-2">
              <PenLine className="w-3.5 h-3.5" />
              Tell us your Story
            </Link>
          </div>
          <Link href="/stories" className="lg:hidden text-[#bc002d]">
            <Flame className="w-7 h-7" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center overflow-hidden">
        {newestStory && (newestStory as any).heroImage ? (
          <img
            src={(newestStory as any).heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}
        <div className="absolute inset-0 hero-overlay"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
          <div className="max-w-3xl">
            {newestStory && (
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#bc002d] rounded-full mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-red-500">New Story Published Today</span>
              </div>
            )}
            <h1 className="text-7xl md:text-9xl font-black leading-none uppercase mb-6 italic tracking-tighter">
              Hot Story <br /><span className="text-[#bc002d]">Magazine.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 serif font-light leading-relaxed italic">
              &ldquo;The world&apos;s most provocative literary destination. Explore the depths of human desire through masterfully crafted narratives.&rdquo;
            </p>
            <div className="flex flex-wrap gap-5">
              <Link
                href="/stories"
                className="bg-[#bc002d] text-white px-10 py-5 rounded-sm font-black text-lg uppercase tracking-widest red-glow transition duration-300"
              >
                Start Reading
              </Link>
              <Link
                href="/submit"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-sm font-black text-lg uppercase tracking-widest hover:bg-white/20 transition"
              >
                Submit Your Story
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Value Props */}
      <section className="py-24 bg-[#080808] border-y border-red-950/50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16">
          <Link href="/stories?storyType=real" className="group space-y-4">
            <div className="text-[#bc002d] text-4xl serif italic">🔥</div>
            <h3 className="text-2xl font-bold uppercase tracking-tight italic group-hover:text-[#bc002d] transition">Real Stories</h3>
            <p className="text-gray-500 leading-relaxed">True encounters from real people. Raw, unfiltered confessions that blur the line between memory and desire.</p>
            <span className="text-[#bc002d] text-sm font-bold uppercase tracking-widest">{realStories.length} Stories →</span>
          </Link>
          <Link href="/stories?storyType=fictional" className="group space-y-4">
            <div className="text-[#bc002d] text-4xl serif italic">✨</div>
            <h3 className="text-2xl font-bold uppercase tracking-tight italic group-hover:text-[#bc002d] transition">Fictional</h3>
            <p className="text-gray-500 leading-relaxed">Masterfully crafted narratives that push the boundaries of imagination. Fantasy worlds where anything is possible.</p>
            <span className="text-[#bc002d] text-sm font-bold uppercase tracking-widest">{fictionalStories.length} Stories →</span>
          </Link>
          <Link href="/stories?storyType=tabu" className="group space-y-4">
            <div className="text-[#bc002d] text-4xl serif italic">⚠️</div>
            <h3 className="text-2xl font-bold uppercase tracking-tight italic group-hover:text-[#bc002d] transition">Taboo</h3>
            <p className="text-gray-500 leading-relaxed">Stories that dare to explore the forbidden. Not for the faint of heart — these tales push every boundary.</p>
            <span className="text-[#bc002d] text-sm font-bold uppercase tracking-widest">{tabuStories.length} Stories →</span>
          </Link>
        </div>
      </section>

      {/* Featured Stories - Current Obsessions */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
              Current <span className="text-[#bc002d]">Obsessions</span>
            </h2>
            <Link href="/stories" className="text-[#bc002d] font-bold uppercase tracking-widest border-b-2 border-[#bc002d] pb-1 hover:text-red-400 transition">
              View Full Library
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[featuredReal, featuredFictional, featuredTabu].filter(Boolean).map((story: any, i) => (
              <Link key={story.id} href={`/story/${story.slug}`} className="group cursor-pointer">
                <div className="relative h-[500px] overflow-hidden rounded-sm mb-6">
                  {story.heroImage ? (
                    <img src={story.heroImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="text-[#bc002d] uppercase font-bold text-xs tracking-[0.2em] mb-2 block">
                      {story.storyType === "tabu" ? "⚠️ Taboo" : story.storyType === "fictional" ? "✨ Fictional" : "🔥 Real"}
                      {story.city && ` · ${story.city}`}
                    </span>
                    <h4 className="text-3xl font-bold serif italic mb-2">{story.title}</h4>
                    <p className="text-gray-300 text-sm line-clamp-2">{story.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Stories */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              Latest <span className="text-[#bc002d]">Releases</span>
            </h2>
            <Link href="/stories" className="text-[#bc002d] font-bold uppercase tracking-widest border-b-2 border-[#bc002d] pb-1 hover:text-red-400 transition">
              See All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latest.map((story: any) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="group relative bg-gray-900/50 border border-gray-800/50 rounded-sm overflow-hidden hover:border-red-900/50 transition-all duration-300"
              >
                {story.heroImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={thumb(story.heroImage)}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] uppercase font-bold tracking-[0.2em] ${
                      story.storyType === "tabu" ? "text-red-500" : story.storyType === "fictional" ? "text-purple-400" : "text-[#bc002d]"
                    }`}>
                      {story.storyType === "tabu" ? "⚠️ Taboo" : story.storyType === "fictional" ? "Fictional" : "Real"}
                    </span>
                    {story.intensity && (
                      <span className="text-[10px] text-orange-400 font-bold">🔥 {story.intensity}/10</span>
                    )}
                    <div className="flex items-center gap-1 text-gray-600 text-[10px] ml-auto">
                      <TrendingUp className="w-3 h-3" />
                      {story.views}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-[#bc002d] transition">{story.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{story.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{new Date(story.createdAt).toLocaleDateString("en-US")}</span>
                    {story.city && <span>{story.city}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-crimson opacity-90"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-8 text-white">
            Share Your <br />Story.
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-red-100 font-light max-w-2xl mx-auto">
            Have a story that needs to be told? We publish the most captivating reader submissions every week.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-3 bg-black text-white px-12 py-6 font-black uppercase tracking-widest hover:bg-gray-900 transition"
          >
            <PenLine className="w-5 h-5" />
            Submit Your Story
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-20 px-6 border-t border-red-950/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="text-3xl font-black tracking-tighter uppercase italic mb-6">
              Velvet<span className="text-[#bc002d]">Scripts</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
              VelvetScripts is the premier destination for provocative storytelling. We believe in the power of words to ignite the imagination.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold uppercase tracking-widest mb-6">Explore</h5>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link href="/stories" className="hover:text-[#bc002d] transition">The Library</Link></li>
              <li><Link href="/stories?storyType=real" className="hover:text-[#bc002d] transition">Real Stories</Link></li>
              <li><Link href="/stories?storyType=fictional" className="hover:text-[#bc002d] transition">Fictional</Link></li>
              <li><Link href="/stories?storyType=tabu" className="hover:text-[#bc002d] transition">Taboo</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold uppercase tracking-widest mb-6">Community</h5>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link href="/submit" className="hover:text-[#bc002d] transition">Submit a Story</Link></li>
              <li><Link href="/stories" className="hover:text-[#bc002d] transition">Browse All</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-[10px] uppercase tracking-[0.4em]">
          © 2026 VelvetScripts. Adults Only (18+). All Rights Reserved.
        </div>
      </footer>
    </main>
  );
}
