"use client";

import { useState } from "react";
import { Send, CheckCircle, Flame } from "lucide-react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function SubmitStoryPage() {
  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    title: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#111] text-gray-200">
        <div className="container mx-auto px-4 py-8">
          <SiteHeader />
          <div className="max-w-2xl mx-auto text-center py-20">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Story Submitted!</h1>
            <p className="text-gray-400 mb-8">
              Thank you for sharing your story. Our team will review it and get back to you.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111] text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3">
              Upload Your Story
            </h1>
            <p className="text-gray-400">
              Share your erotic story with the VelvetScripts community. 
              All submissions are reviewed before publishing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 md:p-8 space-y-5">
              {/* Author Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name / Pen Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-colors"
                  placeholder="e.g. Anonymous Writer"
                />
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-gray-500">(optional — only for feedback)</span>
                </label>
                <input
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorEmail: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-colors"
                  placeholder="Give your story a captivating title"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Story *
                </label>
                <textarea
                  required
                  rows={16}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-colors resize-y font-serif leading-relaxed"
                  placeholder="Write or paste your story here... (minimum 100 characters)"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.content.length} characters
                  {formData.content.length > 0 && formData.content.length < 100 && (
                    <span className="text-red-400"> — minimum 100 required</span>
                  )}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-950/50 border border-red-800/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? "Submitting..." : "Submit Story"}
            </button>

            <p className="text-xs text-gray-600 text-center">
              By submitting, you confirm this is your original work and you grant VelvetScripts 
              the right to publish it. All stories are reviewed before publishing.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
