"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Story {
  id: string;
  title: string;
  slug: string;
  theme: string;
  style: string;
  published: boolean;
  views: number;
  createdAt: string;
}

export default function StoriesManagementPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await fetch("/api/admin/stories");
      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error("Error loading stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        loadStories();
      }
    } catch (error) {
      console.error("Error updating story:", error);
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm("Really delete this story?")) return;

    try {
      const response = await fetch(`/api/admin/stories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadStories();
      }
    } catch (error) {
      console.error("Error deleting story:", error);
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
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Manage Stories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {stories.length} stories total
            </p>
          </div>

          <Link
            href="/admin/stories/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            New Story
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No stories yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first story!
            </p>
            <Link
              href="/admin/stories/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Story
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {story.title}
                      </h2>
                      {story.published ? (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                          Published
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-full">
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                        {story.theme}
                      </span>
                      <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded">
                        {story.style}
                      </span>
                      <span>👁 {story.views} views</span>
                      <span>📅 {new Date(story.createdAt).toLocaleDateString("en-US")}</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      /story/{story.slug}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/story/${story.slug}`}
                      target="_blank"
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title={story.published ? "View (Live)" : "Preview"}
                    >
                      <Eye className="w-5 h-5" />
                    </Link>

                    <button
                      onClick={() => togglePublish(story.id, story.published)}
                      className={`p-2 rounded-lg transition-colors ${
                        story.published
                          ? "text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                          : "text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                      }`}
                      title={story.published ? "Unpublish" : "Publish"}
                    >
                      {story.published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>

                    <Link
                      href={`/admin/stories/${story.id}/edit`}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>

                    <button
                      onClick={() => deleteStory(story.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
