"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(from);
      } else {
        setError("Wrong password");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-red-900/30 rounded-full">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
        autoFocus
      />

      <button
        type="submit"
        disabled={loading || !password}
        className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? "..." : "Login"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-sm mx-4">
        <Suspense fallback={<div className="text-gray-500 text-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
