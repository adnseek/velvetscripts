"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";

interface StoryGeneratorProps {
  onStoryGenerated: (story: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function StoryGenerator({ 
  onStoryGenerated, 
  isLoading, 
  setIsLoading 
}: StoryGeneratorProps) {
  const [theme, setTheme] = useState("romantisch");
  const [style, setStyle] = useState("leidenschaftlich");
  const [length, setLength] = useState("medium");
  const [error, setError] = useState<string | null>(null);

  const generateStory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme, style, length }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Generierung");
      }

      onStoryGenerated(data.story);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Erstelle deine Geschichte
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thema
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="romantisch">Romantisch</option>
            <option value="leidenschaftlich">Leidenschaftlich</option>
            <option value="verführerisch">Verführerisch</option>
            <option value="abenteuerlich">Abenteuerlich</option>
            <option value="geheimnisvoll">Geheimnisvoll</option>
            <option value="dominant">Dominant/Submissiv</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stil
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="poetisch">Poetisch</option>
            <option value="leidenschaftlich">Leidenschaftlich</option>
            <option value="direkt">Direkt</option>
            <option value="sinnlich">Sinnlich</option>
            <option value="intensiv">Intensiv</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Länge
          </label>
          <div className="flex gap-4">
            {[
              { value: "short", label: "Kurz" },
              { value: "medium", label: "Mittel" },
              { value: "long", label: "Lang" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setLength(option.value)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  length === option.value
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={generateStory}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generiere Geschichte...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Geschichte generieren
            </>
          )}
        </button>
      </div>
    </div>
  );
}
