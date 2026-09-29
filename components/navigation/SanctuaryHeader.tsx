/**
 * Sanctuary Master Top Navigation Header (components/navigation/SanctuaryHeader.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Layout: Top navigation bar with brand wordmark, presence telemetry beacon, 
 *         catalogue counter, and atmospheric drawer triggers.
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React from "react";
import { Sliders, ListMusic } from "lucide-react";
import { PresenceBeacon } from "@/components/presence/PresenceBeacon";

interface SanctuaryHeaderProps {
  trackCount: number;
  isSoundboardOpen: boolean;
  isMobileControlsOpen: boolean;
  isQueueOpen: boolean;
  isAmbientMuted?: boolean;
  onToggleSoundboard: () => void;
  onToggleQueue: () => void;
  onOpenMobileControls: () => void;
  className?: string;
}

export const SanctuaryHeader: React.FC<SanctuaryHeaderProps> = ({
  trackCount,
  isSoundboardOpen,
  isMobileControlsOpen,
  isQueueOpen,
  isAmbientMuted = false,
  onToggleSoundboard,
  onToggleQueue,
  onOpenMobileControls,
  className = "",
}) => {
  return (
    <>
      {/* -------------------------------------------------------------------- */}
      {/* TOP NAVIGATION BAR                                                   */}
      {/* -------------------------------------------------------------------- */}
      <header
        className={`relative z-20 w-full px-4 sm:px-8 pt-4 sm:pt-5 flex items-center justify-between select-none ${className}`}
        role="banner"
      >
        {/* Brand Wordmark */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-mono font-bold tracking-[0.25em] text-white">
              SOLITUDE
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_#F59E0B]" />
          </div>
          <span className="text-[10px] text-neutral-400 font-mono tracking-wider">
            midnight sad songs
          </span>
        </div>

        {/* Communal Presence Beacon (Tablet & Desktop) */}
        <div className="hidden sm:flex items-center">
          <PresenceBeacon />
        </div>

        {/* Quick Drawer & Soundboard Action Triggers */}
        <div className="flex items-center gap-2">
          {/* Ambient Soundboard Trigger Button */}
          <button
            type="button"
            onClick={onToggleSoundboard}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border backdrop-blur-md transition-all duration-150 active:scale-95 focus:outline-none ${
              isSoundboardOpen || isMobileControlsOpen
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "bg-white/[0.04] border-white/10 hover:border-white/20 text-neutral-300 hover:text-white"
            }`}
            aria-label="Toggle ambient weather soundboard"
            title="Ambient Soundboard"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Ambient</span>
          </button>

          {/* Track Catalogue Drawer Trigger Button */}
          <button
            type="button"
            onClick={onToggleQueue}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border backdrop-blur-md transition-all duration-150 active:scale-95 focus:outline-none ${
              isQueueOpen
                ? "bg-white/15 border-white/30 text-white"
                : "bg-white/[0.04] border-white/10 hover:border-white/20 text-neutral-300 hover:text-white"
            }`}
            aria-label="Toggle track catalogue queue"
            title="Catalogue Queue [Q]"
          >
            <ListMusic className="w-3.5 h-3.5 text-neutral-300" />
            <span className="hidden md:inline">Catalogue</span>
            <span className="text-[10px] text-neutral-400 font-mono">
              ({trackCount})
            </span>
          </button>
        </div>
      </header>

      {/* Mobile-only Presence Pill */}
      <div className="relative z-20 flex sm:hidden justify-center mt-1">
        <PresenceBeacon />
      </div>

      {/* Mobile Right-Edge Pull Tab (Tactile Atmosphere Drawer) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 md:hidden">
        <button
          type="button"
          onClick={onOpenMobileControls}
          className="flex items-center py-3.5 px-1.5 rounded-l-xl glass-dock border-r-0 border-white/10 text-neutral-300 hover:text-white shadow-xl active:scale-95 transition-all focus:outline-none"
          aria-label="Open atmosphere and soundboard controls"
          title="Atmosphere & Weather Controls"
        >
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAmbientMuted
                  ? "bg-neutral-600"
                  : "bg-amber-400 shadow-[0_0_6px_#F59E0B]"
              }`}
            />
            <Sliders className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </>
  );
};
