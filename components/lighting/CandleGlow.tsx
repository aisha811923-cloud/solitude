/**
 * Candle Glow Atmosphere & Nocturnal Vignette (components/lighting/CandleGlow.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Aesthetic: Ambient candlelight flicker, warm amber halo, and dynamic Lo-Fi vignette
 * 
 * Invariants:
 * - Pure CSS hardware-accelerated animations for flicker and flame physics.
 * - Dynamic atmospheric reactivity: deeper amber saturation and softer luminescence in Lo-Fi mode.
 * - Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React from "react";
import { LightingMode } from "@/types/contracts";

interface CandleGlowProps {
  isLit?: boolean;
  isLoFi?: boolean;
  lightingMode?: LightingMode;
  onToggleLit?: () => void;
  className?: string;
  showCandleGraphic?: boolean;
}

export const CandleGlow: React.FC<CandleGlowProps> = ({
  isLit = true,
  isLoFi = false,
  lightingMode = "candle",
  onToggleLit,
  className = "",
  showCandleGraphic = true,
}) => {
  // Theme color matrices based on lighting mode and Lo-Fi state
  const getAmbientRadialGlow = () => {
    if (!isLit) return "radial-gradient(circle at 50% 65%, rgba(15, 23, 42, 0.4) 0%, transparent 70%)";
    if (lightingMode === "void") return "none";

    if (isLoFi) {
      // Deeper, intimate amber warmth in Lo-Fi mode
      return "radial-gradient(ellipse 65% 55% at 50% 70%, rgba(245, 158, 11, 0.28) 0%, rgba(180, 83, 9, 0.15) 40%, transparent 75%)";
    }

    switch (lightingMode) {
      case "candle":
        return "radial-gradient(ellipse 60% 50% at 50% 68%, rgba(245, 158, 11, 0.20) 0%, rgba(217, 119, 6, 0.08) 45%, transparent 70%)";
      case "midnight":
        return "radial-gradient(ellipse 60% 50% at 50% 68%, rgba(56, 189, 248, 0.12) 0%, rgba(14, 116, 144, 0.05) 45%, transparent 70%)";
      case "rainy-dusk":
        return "radial-gradient(ellipse 60% 50% at 50% 68%, rgba(14, 116, 144, 0.18) 0%, rgba(8, 47, 73, 0.10) 45%, transparent 70%)";
      default:
        return "radial-gradient(ellipse 60% 50% at 50% 68%, rgba(245, 158, 11, 0.20) 0%, transparent 70%)";
    }
  };

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-10 overflow-hidden transition-all duration-700 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Global Peripheral Vignette */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: isLoFi
            ? "radial-gradient(circle at center, transparent 40%, rgba(2, 4, 8, 0.88) 100%)"
            : "radial-gradient(circle at center, transparent 55%, rgba(7, 11, 20, 0.75) 100%)",
        }}
      />

      {/* 2. Atmospheric Candlelight Radial Halo */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: getAmbientRadialGlow(),
          mixBlendMode: "screen",
        }}
      />

      {/* 3. Hardware Candle Graphic (Optional Dock or Canvas Integration) */}
      {showCandleGraphic && (
        <div
          onClick={onToggleLit}
          className={`absolute bottom-24 right-3 sm:bottom-6 sm:right-8 scale-75 sm:scale-100 origin-bottom-right pointer-events-auto cursor-pointer group flex flex-col items-center select-none transition-transform duration-300 active:scale-95 ${
            isLit ? "opacity-100" : "opacity-40"
          }`}
          title={isLit ? "Extinguish candle" : "Light candle"}
        >
          {/* Flame & Halos */}
          {isLit ? (
            <div className="relative flex items-center justify-center mb-1">
              {/* Outer Radiant Ambient Glow */}
              <div
                className={`absolute w-20 h-20 rounded-full blur-xl transition-all duration-700 pointer-events-none ${
                  isLoFi
                    ? "bg-amber-500/35 scale-125"
                    : "bg-amber-500/25 group-hover:bg-amber-500/35"
                }`}
              />

              {/* Inner Flame Flare */}
              <div className="w-4 h-7 relative candle-flame-flicker flex items-center justify-center">
                {/* Yellow Inner Core */}
                <div
                  className="absolute w-3 h-6 rounded-full bg-gradient-to-t from-amber-600 via-amber-400 to-amber-200"
                  style={{
                    borderRadius: "50% 50% 35% 35% / 60% 60% 40% 40%",
                    boxShadow: "0 0 12px rgba(245, 158, 11, 0.9), 0 0 24px rgba(217, 119, 6, 0.5)",
                  }}
                />
                {/* Blue Base of Flame */}
                <div
                  className="absolute bottom-0 w-2 h-2 rounded-full bg-blue-400/80 blur-[1px]"
                />
              </div>
            </div>
          ) : (
            /* Extinguished Thin Smoke Rising */
            <div className="relative h-8 w-1 mb-1 flex items-center justify-center">
              <div
                className="w-1.5 h-6 rounded-full bg-slate-400/40 blur-[1.5px]"
                style={{ animation: "smokeRise 2s ease-out infinite" }}
              />
            </div>
          )}

          {/* Candle Wick */}
          <div className="w-[1.5px] h-2 bg-neutral-900 rounded-t" />

          {/* Candle Body (Hardware Frosted Glass Pillar) */}
          <div className="w-7 h-10 rounded-t-sm rounded-b-md bg-gradient-to-b from-neutral-800/90 via-neutral-900/90 to-neutral-950/90 border border-white/10 shadow-lg relative overflow-hidden backdrop-blur-sm">
            {/* Wax Melt Edge */}
            <div className="absolute top-0 inset-x-0 h-1 bg-amber-500/20" />
            {/* Subtle Warm Reflections */}
            <div
              className={`absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent transition-opacity duration-500 ${
                isLit ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {/* Brass Base Holder */}
          <div className="w-10 h-1.5 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 rounded-full shadow-md -mt-0.5 border border-amber-500/20" />
        </div>
      )}
    </div>
  );
};
