/**
 * 404 Nocturnal Not Found Boundary (app/not-found.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Layout: Minimalist nocturnal sanctuary viewport (.glass-popover)
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

import React from "react";
import Link from "next/link";
import { Disc, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#070B14] select-none">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl glass-popover border border-white/10 text-center shadow-2xl flex flex-col items-center">
        {/* Vinyl Disc Icon */}
        <div className="w-14 h-14 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
          <Disc className="w-7 h-7 text-amber-500/80 animate-[spin_12s_linear_infinite]" />
        </div>

        {/* 404 Header */}
        <span className="text-xs font-mono tracking-widest text-amber-500/80 uppercase mb-1">
          404 — Lost In The Rain
        </span>
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2">
          This Path Leads Nowhere
        </h1>

        {/* Poetic couplet */}
        <p className="text-xs sm:text-sm text-neutral-400 font-serif italic mb-6 leading-relaxed">
          &ldquo;Hum wahan dhoondh rahe the jahan kuch bhi na tha, sirf andhere the aur barish ka shor.&rdquo;
        </p>

        {/* Return to Sanctuary Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/15 text-neutral-200 hover:text-white font-mono text-xs tracking-wider uppercase transition-all duration-150 active:scale-95 focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Return to Sanctuary</span>
        </Link>
      </div>
    </main>
  );
}
