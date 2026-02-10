import { Flame, PenLine } from "lucide-react";
import Link from "next/link";
import { MobileMenuProvider, MobileMenuButton, MobileMenuPanel, Dropdown } from "./HeaderClient";

interface FilterOptions {
  cities: string[];
  locations: { slug: string; name: string }[];
  intensities: number[];
}

interface SiteHeaderProps {
  filterOptions?: FilterOptions;
  searchParams?: { [key: string]: string | undefined };
}

function buildUrl(current: SiteHeaderProps["searchParams"], key: string, value?: string) {
  const params = new URLSearchParams();
  const base = current || {};
  if (key !== "storyType" && base.storyType) params.set("storyType", base.storyType);
  if (key !== "city" && base.city) params.set("city", base.city);
  if (key !== "location" && base.location) params.set("location", base.location);
  if (key !== "intensity" && base.intensity) params.set("intensity", base.intensity);
  if (value) params.set(key, value);
  const qs = params.toString();
  return `/stories${qs ? `?${qs}` : ""}`;
}

export default function SiteHeader({ filterOptions, searchParams }: SiteHeaderProps) {
  const sp = searchParams || {};
  const currentType = sp.storyType || "";
  const currentCity = sp.city || "";
  const currentLocation = sp.location || "";
  const currentIntensity = sp.intensity || "";
  const hasFilters = !!filterOptions;

  const typeOptions = [
    { value: "", label: "All Stories" },
    { value: "real", label: "Real" },
    { value: "fictional", label: "Fictional" },
    { value: "tabu", label: "⚠️ Taboo" },
  ];

  return (
    <header className="relative mb-10 pt-4">
      {/* Mobile header */}
      <MobileMenuProvider>
        <div className="flex items-center justify-between md:hidden">
          <MobileMenuButton />

          <Link href="/" className="group flex items-center gap-2">
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

        {/* Mobile menu - renders below logo row */}
        <MobileMenuPanel>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {typeOptions.map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl(sp, "storyType", opt.value || undefined)}
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
                <Link href={buildUrl(sp, "city")} className={`px-2 py-1 text-xs rounded-full border ${!currentCity ? "bg-red-600 text-white border-red-600" : "bg-gray-800/50 text-gray-400 border-gray-700"}`}>All</Link>
                {filterOptions.cities.map(c => (
                  <Link key={c} href={buildUrl(sp, "city", c)} className={`px-2 py-1 text-xs rounded-full border ${currentCity === c ? "bg-red-600 text-white border-red-600" : "bg-gray-800/50 text-gray-400 border-gray-700"}`}>{c}</Link>
                ))}
              </div>
            </div>
          )}
          {hasFilters && filterOptions.locations.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 px-2">Location</p>
              <div className="flex flex-wrap gap-1.5">
                <Link href={buildUrl(sp, "location")} className={`px-2 py-1 text-xs rounded-full border ${!currentLocation ? "bg-red-600 text-white border-red-600" : "bg-gray-800/50 text-gray-400 border-gray-700"}`}>All</Link>
                {filterOptions.locations.map(loc => (
                  <Link key={loc.slug} href={buildUrl(sp, "location", loc.slug)} className={`px-2 py-1 text-xs rounded-full border ${currentLocation === loc.slug ? "bg-red-600 text-white border-red-600" : "bg-gray-800/50 text-gray-400 border-gray-700"}`}>{loc.name}</Link>
                ))}
              </div>
            </div>
          )}
          {hasFilters && filterOptions.intensities.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 px-2">Intensity</p>
              <div className="flex flex-wrap gap-1.5">
                <Link href={buildUrl(sp, "intensity")} className={`px-2 py-1 text-xs rounded-full border ${!currentIntensity ? "bg-red-600 text-white border-red-600" : "bg-gray-800/50 text-gray-400 border-gray-700"}`}>All</Link>
                {filterOptions.intensities.map(level => (
                  <Link key={level} href={buildUrl(sp, "intensity", String(level))} className={`px-2 py-1 text-xs rounded-full border ${currentIntensity === String(level) ? "bg-red-600 text-white border-red-600" : "bg-gray-800/50 text-gray-400 border-gray-700"}`}>🔥 {level}/10</Link>
                ))}
              </div>
            </div>
          )}
          <hr className="border-gray-800 my-1" />
          <Link
            href="/submit"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all"
          >
            <PenLine className="w-4 h-4" />
            Tell us your Story!
          </Link>
        </MobileMenuPanel>
      </MobileMenuProvider>

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
          {/* Story Type pills - all rendered as <a> tags in HTML source */}
          {typeOptions.map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl(sp, "storyType", opt.value || undefined)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                currentType === opt.value
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-red-700 hover:text-gray-200"
              }`}
            >
              {opt.label}
            </Link>
          ))}

          {/* Filter dropdowns - links inside are SSR-rendered */}
          {hasFilters && filterOptions.cities.length > 0 && (
            <Dropdown label={currentCity ? `📍 ${currentCity}` : "📍 City"} active={!!currentCity}>
              <Link href={buildUrl(sp, "city")} className="block px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">All Cities</Link>
              {filterOptions.cities.map(city => (
                <Link key={city} href={buildUrl(sp, "city", city)} className={`block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white ${currentCity === city ? "text-red-400 bg-gray-800/50" : "text-gray-400"}`}>{city}</Link>
              ))}
            </Dropdown>
          )}

          {hasFilters && filterOptions.locations.length > 0 && (
            <Dropdown label={currentLocation ? `🏠 ${filterOptions.locations.find(l => l.slug === currentLocation)?.name || currentLocation}` : "🏠 Location"} active={!!currentLocation}>
              <Link href={buildUrl(sp, "location")} className="block px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">All Locations</Link>
              {filterOptions.locations.map(loc => (
                <Link key={loc.slug} href={buildUrl(sp, "location", loc.slug)} className={`block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white ${currentLocation === loc.slug ? "text-red-400 bg-gray-800/50" : "text-gray-400"}`}>{loc.name}</Link>
              ))}
            </Dropdown>
          )}

          {hasFilters && filterOptions.intensities.length > 0 && (
            <Dropdown label={currentIntensity ? `🔥 ${currentIntensity}/10` : "🔥 Intensity"} active={!!currentIntensity}>
              <Link href={buildUrl(sp, "intensity")} className="block px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">All Levels</Link>
              {filterOptions.intensities.map(level => (
                <Link key={level} href={buildUrl(sp, "intensity", String(level))} className={`block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white ${currentIntensity === String(level) ? "text-red-400 bg-gray-800/50" : "text-gray-400"}`}>🔥 {level}/10</Link>
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
