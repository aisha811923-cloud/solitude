/**
 * Ambient Soundboard Popover Panel (components/ambient/AmbientSoundboard.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Aesthetic: Frosted glass hardware fader console (.glass-popover)
 * 
 * Channels:
 * 1. Rain on Glass (Master continuous rain loop)
 * 2. Distant Thunder (Sub-bass atmospheric rumbles)
 * 3. Vinyl Surface Noise (Analog shellac needle crackle)
 * 
 * Invariants:
 * - Directly controls independent GainNodes connected to AudioContext.destination.
 * - Bypasses Lo-Fi biquad filter so weather soundscape remains crisp.
 * - Tactile sliders, mute toggles, and percentage readouts.
 * - Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React, { useRef, useEffect } from "react";
import { CloudRain, CloudLightning, Disc, Volume2, VolumeX, X, CloudOff } from "lucide-react";
import { AmbientStemKey, AmbientState } from "@/types/contracts";
import { AMBIENT_CHANNELS } from "@/lib/constants/ambient";

interface AmbientSoundboardProps {
  isOpen: boolean;
  onClose: () => void;
  ambientVolumes: AmbientState;
  setAmbientVolume: (stem: AmbientStemKey, val: number) => void;
  toggleAmbientMute: (stem: AmbientStemKey) => void;
  isAmbientMuted?: boolean;
  onToggleMasterAmbientMute?: () => void;
  className?: string;
}

const STEM_ICONS: Record<AmbientStemKey, React.ReactNode> = {
  rain: <CloudRain className="w-4 h-4 text-sky-400" />,
  thunder: <CloudLightning className="w-4 h-4 text-amber-400" />,
  vinyl: <Disc className="w-4 h-4 text-neutral-400" />,
};

export const AmbientSoundboard: React.FC<AmbientSoundboardProps> = ({
  isOpen,
  onClose,
  ambientVolumes,
  setAmbientVolume,
  toggleAmbientMute,
  isAmbientMuted = false,
  onToggleMasterAmbientMute,
  className = "",
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Ambient soundscape faders"
      className={`absolute bottom-24 sm:bottom-28 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-[92vw] max-w-[340px] sm:max-w-[380px] p-5 rounded-2xl glass-popover z-40 select-none shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
          <h2 className="text-xs uppercase tracking-widest font-mono text-neutral-300 font-semibold">
            Ambient Soundscape
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Close soundboard"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Master Ambience Mute Switch */}
      {onToggleMasterAmbientMute && (
        <div className="flex items-center justify-between p-2.5 mb-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2">
            {isAmbientMuted ? (
              <CloudOff className="w-4 h-4 text-neutral-500" />
            ) : (
              <CloudRain className="w-4 h-4 text-amber-400" />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">Weather Bed</span>
              <span className="text-[10px] text-neutral-400">
                {isAmbientMuted ? "All stems silenced" : "Atmospheric loop active"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleMasterAmbientMute}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150 active:scale-95 ${
              isAmbientMuted
                ? "bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white"
                : "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
            }`}
            aria-label={isAmbientMuted ? "Unmute all ambient stems" : "Mute all ambient stems"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAmbientMuted ? "bg-neutral-600" : "bg-amber-400 shadow-[0_0_6px_#F59E0B]"
              }`}
            />
            <span>{isAmbientMuted ? "Unmute All" : "Mute All"}</span>
          </button>
        </div>
      )}

      {/* Fader Channels */}
      <div className="flex flex-col gap-3.5">
        {AMBIENT_CHANNELS.map((ch) => {
          const rawVolume = ambientVolumes[ch.volKey] as number;
          const isMuted = ambientVolumes[ch.muteKey] as boolean;
          const displayPercent = isMuted ? 0 : Math.round(rawVolume * 100);

          return (
            <div
              key={ch.key}
              className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] transition-all hover:bg-white/[0.04]"
            >
              {/* Channel Label & Telemetry Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white/[0.05]">
                    {STEM_ICONS[ch.key]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">
                      {ch.label}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {ch.sublabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-400 tabular-nums w-8 text-right">
                    {displayPercent}%
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAmbientMute(ch.key)}
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white active:scale-90 transition-all"
                    aria-label={`Toggle mute for ${ch.label}`}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Hardware Knurled Slider Track */}
              <div className="relative flex items-center mt-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : rawVolume}
                  onChange={(e) => setAmbientVolume(ch.key, parseFloat(e.target.value))}
                  aria-label={`${ch.label} volume`}
                  className="w-full h-1.5 bg-neutral-900 rounded-full appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${displayPercent}%, #1E293B ${displayPercent}%, #1E293B 100%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
