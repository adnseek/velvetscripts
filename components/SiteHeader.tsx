"use client";

import { useState, useRef, useEffect } from "react";
import { Flame, PenLine, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface FilterOptions {
  cities: string[];
  locations: { slug: string; name: string }[];
  intensities: number[];
}

interface SiteHeaderProps {
  filterOptions?: FilterOptions;
}

function Dropdown({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
          active
            ? "bg-red-600 text-white border-red-600"
            : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-red-700 hover:text-gray-200"
        }`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto min-w-[180px]" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

function buildUrl(params: URLSearchParams, key: string, value?: string) {
  const newParams = new URLSearchParams(params.toString());
  newParams.delete("page");
  if (value) {
    newParams.set(key, value);
  } else {
    newParams.delete(key);
  }
  const qs = newParams.toString();
  return `/stories${qs ? `?${qs}` : ""}`;
}

export default function SiteHeader({ filterOptions }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isStoriesPage = pathname === "/stories" || pathname === "/";
  const hasFilters = !!filterOptions && isStoriesPage;

  const currentType = searchParams.get("storyType") || "";
  const currentCity = searchParams.get("city") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentIntensity = searchParams.get("intensity") || "";

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
        <nav className="md:hidden mt-4 flex flex-col gap-2 bg-gray-900/95 border border-gray-800 rounded-xl p-4">
          {/* Type filters */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              { value: "", label: "All" },
              { value: "real", label: "Real" },
              { value: "fictional", label: "Fictional" },
              { value: "tabu", label: "⚠️ Taboo" },
            ].map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl(searchParams, "storyType", opt.value || undefined)}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                  currentType === opt.value
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-gray-800/50 text-gray-400 border-gray-700"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
          {hasFilters && filterOptions.cities.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 px-2">City</p>
              <div className="flex flex-wrap gap-1.5">
                <Link href={buildUrl(searchParams, "city")} onClick={() => setMenuOpen(false)} className={`px-2 py-1 text-xs rounded-full border ${!currentCity ? "bg-red-600 text-white border-red-600" : "bg-gray-800/50 text-gray-400 border-gray-700"}`}>All</Link>
                {filterOptions.cities.map(c => (
                  <Link key={c} href={buildUrl(searchParams, "city", c)} onClick={() => setMenuOpen(false)} className={`px-2 py-1 text-xs rounded-full border ${currentCity === c ? "bg-red-600 text-white border-red-600" : "bg-gray-800/50 text-gray-400 border-gray-700"}`}>{c}</Link>
                ))}
              </div>
            </div>
          )}
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
        <Link href="/" className="group flex items-center gap-3 shrink-0">
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

        <nav className="flex items-center gap-2">
          {/* Story Type pills */}
          {[
            { value: "", label: "All Stories" },
            { value: "real", label: "Real" },
            { value: "fictional", label: "Fictional" },
            { value: "tabu", label: "⚠️ Taboo" },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl(searchParams, "storyType", opt.value || undefined)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                currentType === opt.value
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-red-700 hover:text-gray-200"
              }`}
            >
              {opt.label}
            </Link>
          ))}

          {/* Filter dropdowns - only show when we have options */}
          {hasFilters && filterOptions.cities.length > 0 && (
            <Dropdown label={currentCity ? `📍 ${currentCity}` : "📍 City"} active={!!currentCity}>
              <Link href={buildUrl(searchParams, "city")} className="block px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">All Cities</Link>
              {filterOptions.cities.map(city => (
                <Link key={city} href={buildUrl(searchParams, "city", city)} className={`block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white ${currentCity === city ? "text-red-400 bg-gray-800/50" : "text-gray-400"}`}>{city}</Link>
              ))}
            </Dropdown>
          )}

          {hasFilters && filterOptions.locations.length > 0 && (
            <Dropdown label={currentLocation ? `🏠 ${filterOptions.locations.find(l => l.slug === currentLocation)?.name || currentLocation}` : "🏠 Location"} active={!!currentLocation}>
              <Link href={buildUrl(searchParams, "location")} className="block px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">All Locations</Link>
              {filterOptions.locations.map(loc => (
                <Link key={loc.slug} href={buildUrl(searchParams, "location", loc.slug)} className={`block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white ${currentLocation === loc.slug ? "text-red-400 bg-gray-800/50" : "text-gray-400"}`}>{loc.name}</Link>
              ))}
            </Dropdown>
          )}

          {hasFilters && filterOptions.intensities.length > 0 && (
            <Dropdown label={currentIntensity ? `🔥 ${currentIntensity}/10` : "🔥 Intensity"} active={!!currentIntensity}>
              <Link href={buildUrl(searchParams, "intensity")} className="block px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">All Levels</Link>
              {filterOptions.intensities.map(level => (
                <Link key={level} href={buildUrl(searchParams, "intensity", String(level))} className={`block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white ${currentIntensity === String(level) ? "text-red-400 bg-gray-800/50" : "text-gray-400"}`}>🔥 {level}/10</Link>
              ))}
            </Dropdown>
          )}

          <Link
            href="/submit"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-full transition-all ml-1"
          >
            <PenLine className="w-4 h-4" />
            Tell us your Story!
          </Link>
        </nav>
      </div>
    </header>
  );
}
