import { Flame, BookOpen, PenLine } from "lucide-react";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between mb-10 pt-4">
      <Link href="/" className="group flex items-center gap-3">
        <Flame className="w-8 h-8 text-red-600 group-hover:text-red-500 transition-colors" />
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white leading-none">
            Velvet<span className="text-red-600">Scripts</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-0.5">
            Hot Story Magazine
          </p>
        </div>
      </Link>

      <nav className="flex items-center gap-2 md:gap-3">
        <Link
          href="/stories"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white border border-gray-700/50 rounded-full hover:border-red-600/50 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          All Stories
        </Link>
        <Link
          href="/stories?storyType=real"
          className="px-3 py-1.5 text-sm font-medium text-red-400/80 hover:text-red-300 border border-red-800/30 rounded-full hover:border-red-600/50 hover:bg-red-950/30 transition-all"
        >
          Real
        </Link>
        <Link
          href="/stories?storyType=fictional"
          className="px-3 py-1.5 text-sm font-medium text-purple-400/80 hover:text-purple-300 border border-purple-800/30 rounded-full hover:border-purple-600/50 hover:bg-purple-950/30 transition-all"
        >
          Fictional
        </Link>
        <Link
          href="/stories?storyType=tabu"
          className="px-3 py-1.5 text-sm font-medium text-red-500/80 hover:text-red-400 border border-red-900/40 rounded-full hover:border-red-600/50 hover:bg-red-950/40 transition-all"
        >
          ⚠️ Taboo
        </Link>
        <Link
          href="/submit"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-full transition-all"
        >
          <PenLine className="w-4 h-4" />
          Tell us your Story!
        </Link>
      </nav>
    </header>
  );
}
