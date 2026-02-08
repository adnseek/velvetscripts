import { Flame, Heart } from "lucide-react";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="text-center mb-12">
      <Link href="/" className="inline-block">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Flame className="w-10 h-10 text-red-500" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            RedStory
          </h1>
          <Heart className="w-10 h-10 text-pink-500" />
        </div>
      </Link>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Entdecke fesselnde erotische Geschichten mit passenden Live-Cam-Empfehlungen
      </p>
    </header>
  );
}
