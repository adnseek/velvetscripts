"use client";

import { useState, useEffect } from "react";
import { Wand2, Save, ArrowLeft, ImageIcon } from "lucide-react";
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
  const [generatedImages, setGeneratedImages] = useState<Array<{ sectionIdx: number; heading: string; prompt: string; b64: string }>>([]);
  const [heroImage, setHeroImage] = useState<{ prompt: string; b64: string } | null>(null);
  const [portraitImage, setPortraitImage] = useState<{ prompt: string; b64: string } | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [statusLog, setStatusLog] = useState<Array<{ step: string; message: string; detail?: string; time: string }>>([]);
  const [currentStatus, setCurrentStatus] = useState<{ message: string; detail?: string; progress?: { current: number; total: number } } | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    theme: "romantic",
    style: "passionate",
    length: "medium",
    femaleAppearance: "",
    characterName: "",
    faceDescription: "",
    quote: "",
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
    setStatusLog([]);
    setCurrentStatus({ message: "Starting...", detail: "Connecting to server" });
    setGeneratedImages([]);

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

      if (!response.ok) {
        const errorText = await response.text();
        const now = new Date().toLocaleTimeString("en-US", { hour12: false });
        setStatusLog(prev => [...prev, { step: "error", message: `HTTP ${response.status}`, detail: errorText.substring(0, 500), time: now }]);
        setCurrentStatus({ message: `HTTP Error ${response.status}`, detail: errorText.substring(0, 200) });
        setIsGenerating(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) {
        const now = new Date().toLocaleTimeString("en-US", { hour12: false });
        setStatusLog(prev => [...prev, { step: "error", message: "No response stream", detail: "The server returned no readable stream", time: now }]);
        setCurrentStatus({ message: "No response stream", detail: "Check server logs" });
        setIsGenerating(false);
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            const now = new Date().toLocaleTimeString("en-US", { hour12: false });

            if (event.type === "status") {
              setCurrentStatus({ message: event.message, detail: event.detail, progress: event.progress });
              setStatusLog(prev => [...prev, { step: event.step, message: event.message, detail: event.detail, time: now }]);
            }

            if (event.type === "result") {
              const newTitle = event.title || formData.title || "New Story";
              setFormData(prev => ({
                ...prev,
                content: event.story,
                excerpt: event.story.replace(/^#{1,6}\s+.*$/gm, "").replace(/^IMG_PROMPT:.*$/gm, "").replace(/\n{2,}/g, " ").replace(/\n/g, " ").replace(/\s{2,}/g, " ").trim().substring(0, 200) + "...",
                title: newTitle,
                slug: prev.slug || generateSlugFromTitle(newTitle),
                femaleAppearance: event.femaleAppearance || prev.femaleAppearance,
                characterName: event.characterName || prev.characterName,
                faceDescription: event.faceDescription || prev.faceDescription,
                quote: event.quote || prev.quote,
                city: event.city || prev.city,
                seoTitle: event.seoTitle || newTitle,
                seoDescription: event.seoDescription || "",
              }));
              if (event.images && event.images.length > 0) {
                setGeneratedImages(event.images);
              }
              if (event.heroImage) {
                setHeroImage(event.heroImage);
              }
              if (event.portraitImage) {
                setPortraitImage(event.portraitImage);
              }
              setCurrentStatus(null);
            }

            if (event.type === "error") {
              alert("Error: " + event.message);
              setCurrentStatus(null);
            }
          } catch (e) {
            console.error("SSE parse error:", e);
          }
        }
      }
    } catch (error: any) {
      console.error("Generate error:", error);
      const now = new Date().toLocaleTimeString("en-US", { hour12: false });
      setStatusLog(prev => [...prev, { step: "error", message: "Connection failed", detail: error.message || "Unknown error", time: now }]);
      setCurrentStatus({ message: "Connection failed", detail: error.message || "Unknown error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveStory = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      alert("Please fill in all required fields");
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
        const data = await response.json();
        const storyId = data.story?.id;

        // Save images to server one by one to avoid 413 errors
        if (storyId && (generatedImages.length > 0 || heroImage)) {
          // Save hero image first
          if (heroImage) {
            try {
              const heroRes = await fetch("/api/save-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storyId, images: [], heroImage }),
              });
              if (!heroRes.ok) console.error("Hero image save failed:", heroRes.status);
            } catch (imgErr) {
              console.error("Error saving hero image:", imgErr);
            }
          }
          // Save portrait image
          if (portraitImage) {
            try {
              const portraitRes = await fetch("/api/save-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storyId, images: [], heroImage: null, portraitImage }),
              });
              if (!portraitRes.ok) console.error("Portrait image save failed:", portraitRes.status);
            } catch (imgErr) {
              console.error("Error saving portrait image:", imgErr);
            }
          }
          // Save section images one by one
          for (const img of generatedImages) {
            try {
              const imgRes = await fetch("/api/save-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storyId, images: [img], heroImage: null }),
              });
              if (!imgRes.ok) console.error(`Image ${img.sectionIdx} save failed:`, imgRes.status);
            } catch (imgErr) {
              console.error(`Error saving image ${img.sectionIdx}:`, imgErr);
            }
          }
        }

        router.push("/admin/stories");
      } else {
        alert("Error saving story");
      }
    } catch (error) {
      alert("Error saving story");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

      {/* Live Status Overlay */}
      {(currentStatus || statusLog.length > 0) && (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-h-80 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? "animate-pulse bg-green-400" : "bg-gray-500"}`}></div>
            <span className="text-sm font-semibold text-white flex-1">Generation Progress</span>
            {!isGenerating && (
              <button onClick={() => { setStatusLog([]); setCurrentStatus(null); }} className="text-gray-400 hover:text-white text-xs">✕</button>
            )}
          </div>

          {/* Current status */}
          {currentStatus && (
            <div className="px-4 py-3 border-b border-gray-700/50">
              <p className="text-sm font-medium text-green-400">{currentStatus.message}</p>
              {currentStatus.detail && (
                <p className="text-xs text-gray-400 mt-1 break-words whitespace-pre-wrap">{currentStatus.detail}</p>
              )}
              {currentStatus.progress && (
                <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStatus.progress.current / currentStatus.progress.total) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {/* Log */}
          <div className="px-4 py-2 max-h-44 overflow-y-auto">
            {statusLog.map((log, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <span className="text-[10px] text-gray-500 font-mono shrink-0 mt-0.5">{log.time}</span>
                <span className={`text-xs ${
                  log.step.includes("done") ? "text-green-400" :
                  log.step.includes("error") ? "text-red-400" :
                  "text-gray-300"
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
          Create New Story
        </h1>

        <div className="max-w-4xl space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Story Generator
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title (optional – AI will create one)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Leave empty = AI creates a creative title"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty and AI will create a unique title
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Story Type
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
                  Intensity
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
                  Location / Setting
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">No specific location</option>
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
                  City (optional – AI will choose one)
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Leave empty = AI picks a fitting city"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Female Character (optional – AI will create one)
              </label>
              <textarea
                value={formData.femaleAppearance}
                onChange={(e) => setFormData({ ...formData, femaleAppearance: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Leave empty = AI creates a diverse, creative character (fat, thin, old, young, glasses, tattoos...)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty and AI will create a creative, diverse character
              </p>
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <label htmlFor="sadomaso" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  BDSM
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.sadomaso ? "BDSM elements will be included" : "No BDSM in the story"}
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
                  Generating story...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Story
                </>
              )}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Story Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title (entered above)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. The Neighbor Next Door"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL Slug (auto-generated)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                  placeholder="auto-generated-from-title"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Automatically generated from the title
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
                  placeholder="Short summary for the overview"
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
                  placeholder="The generated story will appear here..."
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
                  placeholder="For Google (optional)"
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
                  placeholder="Meta description for Google (optional)"
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
                  Publish immediately
                </label>
              </div>
            </div>
          </div>

          {generatedImages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-purple-500" />
                Generated Scene Images ({generatedImages.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedImages.map((img) => (
                  <div key={img.sectionIdx} className="relative rounded-lg overflow-hidden shadow-md">
                    <img
                      src={`data:image/jpeg;base64,${img.b64}`}
                      alt={img.heading}
                      className="w-full h-auto"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
                      <p className="text-white text-sm truncate">{img.heading}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={saveStory}
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving story &amp; images...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Story {generatedImages.length > 0 ? `& ${generatedImages.length} Images` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
