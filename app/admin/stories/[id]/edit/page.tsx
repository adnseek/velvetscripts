"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditStoryPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [portraitImage, setPortraitImage] = useState<string | null>(null);
  const [characterName, setCharacterName] = useState("");
  const [faceDescription, setFaceDescription] = useState("");
  const [quote, setQuote] = useState("");
  const [regeneratingPortrait, setRegeneratingPortrait] = useState(false);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [generatingComposite, setGeneratingComposite] = useState(false);
  const [postingToX, setPostingToX] = useState(false);
  const [threadUrl, setThreadUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [genCurrent, setGenCurrent] = useState(0);
  const [genTotal, setGenTotal] = useState(0);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [regeneratingSingle, setRegeneratingSingle] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    published: false,
  });

  useEffect(() => {
    loadStory();
  }, []);

  const loadStory = async () => {
    try {
      const response = await fetch(`/api/admin/stories/${params.id}`);
      if (!response.ok) throw new Error("Story not found");
      const data = await response.json();
      setFormData({
        title: data.story.title || "",
        slug: data.story.slug || "",
        excerpt: data.story.excerpt || "",
        content: data.story.content || "",
        seoTitle: data.story.seoTitle || "",
        seoDescription: data.story.seoDescription || "",
        published: data.story.published || false,
      });
      setImages(data.story.images || []);
      setHeroImage(data.story.heroImage || null);
      setPortraitImage(data.story.portraitImage || null);
      setCharacterName(data.story.characterName || "");
      setFaceDescription(data.story.faceDescription || "");
      setQuote(data.story.quote || "");
      // Check if X composite exists
      const compPath = `/images/stories/${params.id}/x-composite.webp`;
      try {
        const compRes = await fetch(compPath, { method: "HEAD" });
        if (compRes.ok) setCompositeImage(compPath);
      } catch {}
    } catch (error) {
      alert("Error loading story");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateImages = async (mode: "all" | "hero" | "sections" = "all") => {
    const messages = {
      all: "This will delete ALL images and regenerate them. Continue?",
      hero: "This will regenerate the hero image only. Continue?",
      sections: "This will regenerate all section images (girls) only. Continue?",
    };
    if (!confirm(messages[mode])) return;
    setGenerating(true);
    setGenProgress(`Starting (${mode})...`);
    setGenCurrent(0);
    setGenTotal(0);
    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: params.id, mode }),
      });

      const reader = response.body?.getReader();
      if (!reader) { setGenProgress("Error: No stream"); setGenerating(false); return; }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.total) setGenTotal(data.total);
              if (data.current) setGenCurrent(data.current);

              if (currentEvent === "status") {
                setGenProgress(data.detail ? `${data.message} — "${data.detail}"` : data.message);
              } else if (currentEvent === "done") {
                setGenProgress(`Done! ${data.generated} section images + ${data.heroGenerated ? "1 hero" : "hero failed"}`);
                setCacheBuster(Date.now());
                await loadStory();
              } else if (currentEvent === "error") {
                setGenProgress(`Error: ${data.message}`);
              }
            } catch {}
          }
        }
      }
    } catch (error: any) {
      setGenProgress(`Error: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateSingle = async (sectionIdx: number) => {
    setRegeneratingSingle(sectionIdx);
    try {
      const res = await fetch("/api/generate-single-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: params.id, sectionIdx }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Failed: ${data.error}`);
      } else {
        setCacheBuster(Date.now());
        await loadStory();
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setRegeneratingSingle(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/stories/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/stories");
      } else {
        alert("Error saving");
      }
    } catch (error) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin/stories"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to overview
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
          Edit Story
        </h1>

        <div className="max-w-4xl space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Story Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL-Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                />
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={20}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              SEO
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Character & Portrait Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Character & Portrait</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Passport Photo</p>
                {portraitImage ? (
                  <img
                    src={`${portraitImage}?t=${cacheBuster}`}
                    alt="Portrait"
                    className="w-40 h-40 rounded-lg object-cover shadow-md border-2 border-gray-200 dark:border-gray-600"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }}
                  />
                ) : null}
                <div className={`w-40 h-40 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs text-center px-2 ${portraitImage ? "hidden" : ""}`}>No portrait yet</div>
                <button
                  onClick={async () => {
                    if (!confirm(portraitImage ? "Regenerate passport photo?" : "Generate passport photo?")) return;
                    setRegeneratingPortrait(true);
                    try {
                      const res = await fetch("/api/generate-portrait", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ storyId: params.id, faceDescription }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setPortraitImage(data.portraitImage);
                        setCacheBuster(Date.now());
                      } else {
                        alert(`Failed: ${data.error}`);
                      }
                    } catch (e: any) {
                      alert(`Error: ${e.message}`);
                    } finally {
                      setRegeneratingPortrait(false);
                    }
                  }}
                  disabled={regeneratingPortrait || !faceDescription}
                  className="mt-2 w-40 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-1.5 px-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  {regeneratingPortrait ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {regeneratingPortrait ? "Generating..." : portraitImage ? "Regenerate" : "Generate"}
                </button>
              </div>
              <div className="flex-1 space-y-3">
                {characterName && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{characterName}</p>
                  </div>
                )}
                {quote && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quote</p>
                    <p className="text-gray-700 dark:text-gray-300 italic">&ldquo;{quote}&rdquo;</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Face Description</p>
                  <textarea
                    value={faceDescription}
                    onChange={(e) => setFaceDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="Detailed face description for passport photo generation (e.g. round face, brown eyes, freckles, short grey hair...)"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Edit this and click Generate to create a portrait photo</p>
                </div>
              </div>
            </div>
          </div>

          {/* X/Twitter Composite */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">X / Twitter Post Image</h2>
            {compositeImage ? (
              <div className="mb-4">
                <img
                  src={`${compositeImage}?t=${cacheBuster}`}
                  alt="X Composite"
                  className="w-full max-w-2xl rounded-lg border border-gray-700 shadow-md"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No composite image yet. Requires hero image + portrait photo.</p>
            )}
            <button
              onClick={async () => {
                setGeneratingComposite(true);
                try {
                  const res = await fetch("/api/generate-composite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ storyId: params.id }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setCompositeImage(data.compositeImage);
                    setCacheBuster(Date.now());
                  } else {
                    alert(`Failed: ${data.error}`);
                  }
                } catch (e: any) {
                  alert(`Error: ${e.message}`);
                } finally {
                  setGeneratingComposite(false);
                }
              }}
              disabled={generatingComposite}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {generatingComposite ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {generatingComposite ? "Generating..." : compositeImage ? "Regenerate Composite" : "Generate Composite"}
            </button>

            {compositeImage && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Post Thread to X</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Posts a 5-tweet thread: composite image + quote → 3 AI-generated teaser tweets → link to story on velvetscripts.com
                </p>
                <button
                  onClick={async () => {
                    if (!confirm("Post this story as a thread to X/Twitter?")) return;
                    setPostingToX(true);
                    setThreadUrl(null);
                    try {
                      const res = await fetch("/api/post-to-x", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ storyId: params.id }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setThreadUrl(data.threadUrl);
                        alert("Thread posted successfully!");
                      } else {
                        alert(`Failed: ${data.error}`);
                      }
                    } catch (e: any) {
                      alert(`Error: ${e.message}`);
                    } finally {
                      setPostingToX(false);
                    }
                  }}
                  disabled={postingToX}
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white font-bold py-2 px-5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {postingToX ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  )}
                  {postingToX ? "Posting..." : "Post to X"}
                </button>
                {threadUrl && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Thread posted! <a href={threadUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">{threadUrl}</a>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Images
            </h2>

            {/* Current images */}
            {(heroImage || images.length > 0) ? (
              <div className="mb-6">
                {heroImage && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Hero Image</p>
                    <img src={`${heroImage}?t=${cacheBuster}`} alt="Hero" className="w-full max-w-md rounded-lg border border-gray-700" />
                  </div>
                )}
                {images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Section Images ({images.length})</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.map((img: any, i: number) => (
                        <div key={i} className="relative group">
                          <img src={`${img.filename}?t=${cacheBuster}`} alt={img.heading || `Section ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-gray-700" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg truncate">
                            {img.heading || `Section ${i + 1}`}
                          </div>
                          <button
                            onClick={() => handleRegenerateSingle(img.sectionIdx)}
                            disabled={regeneratingSingle !== null || generating}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-pink-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                            title="Regenerate this image"
                          >
                            {regeneratingSingle === img.sectionIdx ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {regeneratingSingle === img.sectionIdx && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                              <div className="text-center">
                                <Loader2 className="w-6 h-6 animate-spin text-pink-400 mx-auto mb-1" />
                                <span className="text-xs text-white">Regenerating...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-6">No images generated yet.</p>
            )}

            {/* Generate / Regenerate buttons */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleRegenerateImages("all")}
                  disabled={generating}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {images.length > 0 ? "Regenerate All" : "Generate All"}
                </button>
                <button
                  onClick={() => handleRegenerateImages("sections")}
                  disabled={generating}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Girls Only
                </button>
                <button
                  onClick={() => handleRegenerateImages("hero")}
                  disabled={generating}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Hero Only
                </button>
              </div>
              {(generating || genProgress) && (
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                  {genTotal > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((genCurrent / genTotal) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {genCurrent}/{genTotal}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300">{genProgress}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Published
                </span>
              </label>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
