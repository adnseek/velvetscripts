"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Connection error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
      <div className="relative flex-1">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder="your@email.com"
          required
          className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#bc002d] transition"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-8 py-4 bg-[#bc002d] text-white font-bold uppercase tracking-widest rounded-sm hover:bg-red-700 disabled:opacity-50 transition whitespace-nowrap"
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
      {status === "success" && (
        <p className="sm:absolute sm:-bottom-8 text-green-400 text-sm mt-2 sm:mt-0">{message}</p>
      )}
      {status === "error" && (
        <p className="sm:absolute sm:-bottom-8 text-red-400 text-sm mt-2 sm:mt-0">{message}</p>
      )}
    </form>
  );
}
