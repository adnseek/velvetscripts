"use client";

import { useState } from "react";
import { Flame, BookOpen, PenLine, Menu, X } from "lucide-react";
import Link from "next/link";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative mb-10 pt-4">
      {/* Mobile header */}
      <div className="flex items-center justify-between md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link href="/" className="group flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Flame className="w-7 h-7 text-red-600 group-hover:text-red-500 transition-colors" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">
              Velvet<span className="text-red-600">Scripts</span>
            </h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] mt-0.5">
              Hot Story Magazine
            </p>
          </div>
        </Link>

        <div className="w-10" />
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <nav className="md:hidden mt-4 flex flex-col gap-2 bg-gray-900/95 border border-gray-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <Link
            href="/stories"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
          >
            <BookOpen className="w-4 h-4" />
            All Stories
          </Link>
          <Link
            href="/stories?storyType=real"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-all"
          >
            🔥 Real Stories
          </Link>
          <Link
            href="/stories?storyType=fictional"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2.5 text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-lg transition-all"
          >
            ✨ Fictional
          </Link>
          <Link
            href="/stories?storyType=tabu"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-all"
          >
            ⚠️ Taboo
          </Link>
          <hr className="border-gray-800 my-1" />
          <Link
            href="/submit"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all"
          >
            <PenLine className="w-4 h-4" />
            Tell us your Story!
          </Link>
        </nav>
      )}

      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between">
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
      </div>
    </header>
  );
}
