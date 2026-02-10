"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Flame, ShieldAlert } from "lucide-react";

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setVerified(true);
      return;
    }
    const stored = localStorage.getItem("age_verified");
    setVerified(stored === "true");
  }, [pathname]);

  const handleConfirm = () => {
    localStorage.setItem("age_verified", "true");
    setVerified(true);
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.com";
  };

  // Always render children in DOM for SSR/SEO — overlay blocks visually
  return (
    <>
      {children}

      {/* Age gate overlay — only shown when not yet verified (client-side only) */}
      {verified !== true && (
        <div className="fixed inset-0 z-[9999] bg-[#111] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-950 to-gray-900 px-8 py-6 text-center border-b border-red-900/30">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Flame className="w-10 h-10 text-red-600" />
                <h1 className="text-3xl font-black text-white">
                  Velvet<span className="text-red-600">Scripts</span>
                </h1>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                Hot Story Magazine
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-8 text-center">
              <div className="flex justify-center mb-4">
                <ShieldAlert className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                Age Verification Required
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                This website contains adult content including explicit erotic literature and imagery. 
                You must be at least <span className="text-white font-semibold">18 years old</span> to enter.
              </p>
              <p className="text-gray-500 text-xs mb-8">
                By entering, you confirm that you are of legal age in your jurisdiction 
                and that viewing adult content is legal where you reside.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirm}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors text-sm uppercase tracking-wider"
                >
                  I am 18 or older — Enter
                </button>
                <button
                  onClick={handleDeny}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-medium rounded-xl transition-colors text-sm"
                >
                  I am under 18 — Leave
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-950/50 border-t border-gray-800">
              <p className="text-[10px] text-gray-600 text-center">
                18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
