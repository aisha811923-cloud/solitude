/**
 * Hardware Vinyl Turntable Platter & Animated Tonearm (components/player/VinylDisc.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Hardware Modeling:
 * - Concentric vinyl micro-grooves with light refraction.
 * - Center spindle & album art label (33⅓ RPM continuous rotation).
 * - Persistent rotation angle preserved across pause/play cycles (animationPlayState).
 * - Realistic metallic tonearm with counterweight, pivot gimbal, and dynamic needle drop.
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface VinylDiscProps {
  isPlaying: boolean;
  coverUrl: string;
  title?: string;
  artist?: string;
  className?: string;
}

export const VinylDisc: React.FC<VinylDiscProps> = ({
  isPlaying,
  coverUrl,
  title = "Untitled",
  artist = "Unknown Artist",
  className = "",
}) => {
  const vinylDiscRef = useRef<HTMLDivElement | null>(null);
  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    setHasImgError(false);
  }, [coverUrl]);

  return (
    <div
      className={`relative w-full h-[180px] xs:h-[200px] sm:h-[225px] md:h-[240px] lg:h-[260px] xl:h-[270px] flex items-center justify-center select-none ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* -------------------------------------------------------------------- */}
      {/* UNIFIED TURNTABLE PLATTER & TONEARM ASSEMBLY                        */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative w-[270px] h-[270px] flex items-center justify-center scale-[0.65] xs:scale-[0.72] sm:scale-85 md:scale-[0.88] lg:scale-[0.95] xl:scale-100 origin-center transition-transform duration-300 shrink-0">
        {/* Deep ambient drop shadow under the platter */}
        <div
          className="absolute -inset-4 rounded-full bg-black/60 blur-2xl pointer-events-none transition-all duration-700"
          style={{ transform: isPlaying ? "scale(1.05)" : "scale(1.0)" }}
        />

        {/* ------------------------------------------------------------------ */}
        {/* 1. ROTATING VINYL DISC                                             */}
        {/* ------------------------------------------------------------------ */}
        <div
          ref={vinylDiscRef}
          className="relative w-[260px] h-[260px] rounded-full vinyl-grooves flex items-center justify-center shadow-2xl transition-transform duration-500 vinyl-spinning"
          style={{
            animationPlayState: isPlaying ? "running" : "paused",
            willChange: "transform",
          }}
          aria-label={`Vinyl record playing ${title} by ${artist}`}
        >
          {/* Subtle Dynamic Light Sheen / Highlight (Simulating room reflections) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-25"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%, rgba(255,255,255,0.15) 100%)",
            }}
          />

          {/* Micro-groove lead-in rim */}
          <div className="absolute inset-1 rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-white/[0.03] pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-white/[0.03] pointer-events-none" />
          <div className="absolute inset-12 rounded-full border border-white/[0.04] pointer-events-none" />

          {/* Center Label (Album Artwork Container) */}
          <div className="relative w-[96px] h-[96px] rounded-full overflow-hidden border-2 border-neutral-900 shadow-inner flex items-center justify-center bg-neutral-950">
            {coverUrl && !hasImgError ? (
              <Image
                src={coverUrl}
                alt={`${title} album cover`}
                fill
                sizes="(max-width: 640px) 76px, (max-width: 1024px) 88px, 108px"
                className="object-cover pointer-events-none"
                priority
                onError={() => setHasImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-neutral-900 via-neutral-950 to-amber-950/40 flex items-center justify-center">
                <span className="text-[10px] text-amber-500 font-mono tracking-widest">SOLITUDE</span>
              </div>
            )}

            {/* Inner Label Dark Tint & Ring */}
            <div className="absolute inset-0 bg-black/20 rounded-full pointer-events-none border border-white/10" />

            {/* Brass Center Spindle Bushing */}
            <div className="absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-amber-800 via-amber-500 to-amber-200 border border-amber-900/60 shadow-md flex items-center justify-center z-10">
              {/* Spindle Center Hole */}
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-neutral-950 shadow-inner border border-black" />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2. TACTILE HARDWARE TONEARM                                        */}
        {/* ------------------------------------------------------------------ */}
        <div
          className="absolute -top-7 -right-7 w-28 h-52 pointer-events-none z-20 origin-top-right transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transform: isPlaying ? "rotate(23deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        >
          {/* Tonearm Base & Gimbal Bearing Mount */}
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-950 border border-white/15 shadow-xl flex items-center justify-center">
            {/* Gimbal Center Pin */}
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 border border-amber-700 shadow-sm" />
            {/* Cylindrical Counterweight */}
            <div className="absolute -top-3 right-1 w-5 h-4 bg-gradient-to-r from-neutral-600 via-neutral-700 to-neutral-800 rounded-sm border border-neutral-500/30 shadow-md" />
          </div>

          {/* Curved Metallic Tonearm Rod */}
          <svg
            className="absolute top-6 right-5 w-24 h-44 overflow-visible"
            viewBox="0 0 80 150"
            fill="none"
          >
            {/* Soft Ambient Drop Shadow under tonearm */}
            <path
              d="M 65 0 C 65 35, 30 75, 25 125 L 20 145"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Metallic Aluminum Chrome Rod */}
            <path
              d="M 65 0 C 65 35, 30 75, 25 125 L 20 145"
              stroke="url(#tonearmGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            <defs>
              <linearGradient id="tonearmGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="40%" stopColor="#94A3B8" />
                <stop offset="70%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
            </defs>
          </svg>

          {/* Cartridge & Headshell (Stylus Needle Housing) */}
          <div
            className="absolute bottom-3 left-3 w-4 h-7 rounded-sm bg-gradient-to-b from-neutral-800 to-neutral-950 border border-amber-500/40 shadow-lg transform -rotate-12 flex flex-col items-center justify-between py-1"
          >
            {/* Headshell Amber Accent Stripe */}
            <div className="w-2.5 h-[2px] bg-amber-400/80 rounded-full" />
            {/* Stylus Tip */}
            <div className="w-1 h-1.5 rounded-full bg-white shadow-[0_0_4px_#F59E0B]" />
          </div>
        </div>
      </div>
    </div>
  );
};
