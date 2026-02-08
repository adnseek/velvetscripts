"use client";

import { useState, useEffect } from "react";
import { Wand2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STORY_TYPES, INTENSITY_LEVELS } from "@/lib/story-config";

interface LocationData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  storyType: string;
}

export default function NewStoryPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    theme: "romantisch",
    style: "leidenschaftlich",
    length: "medium",
    femaleAppearance: "",
    storyType: "real",
    intensity: 5,
    locationId: "",
    city: "",
    excerpt: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    published: false,
    sadomaso: false,
  });

  useEffect(() => {
    fetch(`/api/admin/locations?storyType=${formData.storyType}`)
      .then(r => r.json())
      .then(d => {
        setLocations(d.locations || []);
        setFormData(prev => ({ ...prev, locationId: "" }));
      });
  }, [formData.storyType]);

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlugFromTitle(newTitle),
    }));
  };

  const generateStory = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          theme: formData.theme,
          style: formData.style,
          length: formData.length,
          femaleAppearance: formData.femaleAppearance,
          storyType: formData.storyType,
          intensity: formData.intensity,
          locationName: locations.find(l => l.id === formData.locationId)?.name || "",
          city: formData.city,
          sadomaso: formData.sadomaso,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);
      if (data.error) {
        alert("API-Fehler: " + data.error);
        return;
      }
      if (data.story) {
        const newTitle = data.title || formData.title || "Neue Geschichte";
        setFormData(prev => ({
          ...prev,
          content: data.story,
          excerpt: data.story.substring(0, 200) + "...",
          title: newTitle,
          slug: prev.slug || generateSlugFromTitle(newTitle),
          femaleAppearance: data.femaleAppearance || prev.femaleAppearance,
          city: data.city || prev.city,
          seoTitle: data.seoTitle || newTitle,
          seoDescription: data.seoDescription || "",
        }));
      } else {
        alert("Keine Geschichte generiert. Prüfe die Konsole für Details.");
      }
    } catch (error: any) {
      console.error("Generate error:", error);
      alert("Fehler beim Generieren: " + (error.message || "Unbekannter Fehler"));
    } finally {
      setIsGenerating(false);
    }
  };

  const saveStory = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      alert("Bitte fülle alle Pflichtfelder aus");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/stories");
      } else {
        alert("Fehler beim Speichern");
      }
    } catch (error) {
      alert("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
          Neue Geschichte erstellen
        </h1>

        <div className="max-w-4xl space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Story-Generator
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titel (optional – AI erfindet einen)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Leer lassen = AI erfindet einen kreativen Titel"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leer lassen und die AI erfindet einen einzigartigen Titel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Art der Geschichte
                </label>
                <select
                  value={formData.storyType}
                  onChange={(e) => setFormData({ ...formData, storyType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {STORY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intensität
                </label>
                <select
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {INTENSITY_LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {INTENSITY_LEVELS.find(l => l.value === formData.intensity)?.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ort / Schauplatz
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Kein bestimmter Ort</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                {formData.locationId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {locations.find(l => l.id === formData.locationId)?.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stadt (optional – AI wählt eine)
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Leer lassen = AI wählt eine passende Stadt"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weibliche Figur (optional – AI erfindet eine)
              </label>
              <textarea
                value={formData.femaleAppearance}
                onChange={(e) => setFormData({ ...formData, femaleAppearance: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Leer lassen = AI erfindet eine diverse, kreative Figur (dick, dünn, alt, jung, Brille, Tattoos...)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leer lassen und die AI erfindet eine kreative, diverse Figur
              </p>
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <label htmlFor="sadomaso" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sadomaso
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.sadomaso ? "SM-Elemente werden eingebaut" : "Kein Sadomaso in der Geschichte"}
                </p>
              </div>
              <button
                type="button"
                id="sadomaso"
                onClick={() => setFormData({ ...formData, sadomaso: !formData.sadomaso })}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  formData.sadomaso ? "bg-red-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    formData.sadomaso ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={generateStory}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isGenerating ? (
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Story-Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titel (bereits oben eingegeben)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="z.B. Meine Tante Frieda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL-Slug (automatisch generiert)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                  placeholder="wird-automatisch-erstellt"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Wird automatisch aus dem Titel generiert
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Kurze Zusammenfassung für die Übersicht"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Story-Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="Die generierte Geschichte erscheint hier..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Für Google (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Meta-Description für Google (optional)"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sofort veröffentlichen
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={saveStory}
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Speichere...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Geschichte speichern
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
