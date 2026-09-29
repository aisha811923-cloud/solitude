/**
 * Sanctuary Global Error Boundary (app/error.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Layout: Nocturnal glassmorphic error card (.glass-popover)
 * 
 * Invariants:
 * - Traps unhandled runtime rendering exceptions gracefully.
 * - Provides immediate tactile "Reconnect Sanctuary" recovery button.
 * - Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Solitude Runtime Exception]:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#070B14]/90 backdrop-blur-md select-none">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl glass-popover border border-amber-500/20 text-center shadow-2xl flex flex-col items-center">
        {/* Warning Icon with Pulsing Amber Glow */}
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>

        {/* Title & Poetic Description */}
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mb-2">
          Sanctuary Stream Disrupted
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mb-6 font-serif italic leading-relaxed">
          &ldquo;Even the quietest night occasionally stumbles into static. The rain continues outside.&rdquo;
        </p>

        {/* Technical Error Snippet (Subtle) */}
        {error.message && (
          <div className="w-full mb-6 p-3 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-neutral-500 truncate text-left">
            <code>{error.message}</code>
          </div>
        )}

        {/* Reconnect Sanctuary Action */}
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-neutral-950 font-semibold text-xs tracking-wider uppercase shadow-[0_0_16px_rgba(245,158,11,0.45)] hover:shadow-[0_0_24px_rgba(245,158,11,0.65)] active:scale-95 transition-all duration-150 focus:outline-none"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reconnect Sanctuary</span>
        </button>
      </div>
    </div>
  );
}
