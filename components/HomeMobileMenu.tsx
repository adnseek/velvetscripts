"use client";

import { useState } from "react";
import { Menu, X, PenLine } from "lucide-react";
import Link from "next/link";

export default function HomeMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-red-900/30 px-6 py-6 flex flex-col gap-4"
          onClick={() => setOpen(false)}
        >
          <Link href="/stories" className="text-sm font-bold uppercase tracking-[0.2em] text-white hover:text-[#bc002d] transition">
            The Collection
          </Link>
          <Link href="/stories?storyType=real" className="text-sm font-bold uppercase tracking-[0.2em] text-white hover:text-[#bc002d] transition">
            Real Stories
          </Link>
          <Link href="/stories?storyType=fictional" className="text-sm font-bold uppercase tracking-[0.2em] text-white hover:text-[#bc002d] transition">
            Fictional
          </Link>
          <Link href="/stories?storyType=tabu" className="text-sm font-bold uppercase tracking-[0.2em] text-white hover:text-[#bc002d] transition">
            Taboo
          </Link>
          <a href="/#subscribe" className="text-sm font-bold uppercase tracking-[0.2em] text-white hover:text-[#bc002d] transition">
            Subscribe
          </a>
          <hr className="border-gray-800" />
          <Link
            href="/submit"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-[#bc002d] hover:bg-red-700 rounded-lg transition"
          >
            <PenLine className="w-4 h-4" />
            Tell us your Story
          </Link>
        </div>
      )}
    </div>
  );
}
