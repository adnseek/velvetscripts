"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, X, Trash2, Eye, Clock, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface Submission {
  id: string;
  authorName: string;
  authorEmail: string | null;
  title: string;
  content: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setSubmissions(prev =>
        prev.map(s => (s.id === id ? { ...s, status } : s))
      );
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Delete this submission permanently?")) return;
    try {
      await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const filtered = filter === "all"
    ? submissions
    : submissions.filter(s => s.status === filter);

  const statusCounts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    approved: submissions.filter(s => s.status === "approved").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Submissions</h1>
            <p className="text-gray-400 text-sm mt-1">
              {statusCounts.pending} pending review
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                filter === f
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({statusCounts[f]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No {filter === "all" ? "" : filter} submissions yet.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(sub => (
              <div
                key={sub.id}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
              >
                {/* Header row */}
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white truncate">
                        {sub.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          sub.status === "pending"
                            ? "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50"
                            : sub.status === "approved"
                              ? "bg-green-900/50 text-green-400 border border-green-700/50"
                              : "bg-red-900/50 text-red-400 border border-red-700/50"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>by <span className="text-gray-300">{sub.authorName}</span></span>
                      {sub.authorEmail && <span>{sub.authorEmail}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sub.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      <span>{sub.content.length.toLocaleString()} chars</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Preview"
                    >
                      {expandedId === sub.id ? <ChevronUp className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {sub.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(sub.id, "approved")}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    {sub.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(sub.id, "rejected")}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteSubmission(sub.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {expandedId === sub.id && (
                  <div className="px-6 pb-6 border-t border-gray-700">
                    <div className="mt-4 max-h-96 overflow-y-auto bg-gray-900 rounded-xl p-6 text-gray-300 font-serif leading-relaxed whitespace-pre-wrap text-sm">
                      {sub.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
