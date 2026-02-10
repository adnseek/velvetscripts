"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

import { createContext, useContext } from "react";

const MobileMenuContext = createContext<{ open: boolean; toggle: () => void }>({ open: false, toggle: () => {} });

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MobileMenuContext.Provider value={{ open, toggle: () => setOpen(o => !o) }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function MobileMenuButton() {
  const { open, toggle } = useContext(MobileMenuContext);
  return (
    <button
      onClick={toggle}
      className="p-2 text-gray-400 hover:text-white transition-colors md:hidden"
      aria-label="Toggle menu"
    >
      {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
}

export function MobileMenuPanel({ children }: { children: React.ReactNode }) {
  const { open, toggle } = useContext(MobileMenuContext);
  if (!open) return null;
  return (
    <nav
      className="md:hidden mt-4 flex flex-col gap-2 bg-gray-900/95 border border-gray-800 rounded-xl p-4"
      onClick={toggle}
    >
      {children}
    </nav>
  );
}

export function Dropdown({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
          active
            ? "bg-red-600 text-white border-red-600"
            : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-red-700 hover:text-gray-200"
        }`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto min-w-[180px]"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
