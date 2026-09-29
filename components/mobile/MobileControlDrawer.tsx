/**
 * Tactile Mobile Control & Ambient Soundscape Drawer (components/mobile/MobileControlDrawer.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Breakpoint Target: Mobile & Phablet (< 768px, < md)
 * 
 * Features:
 * - Right-edge spring sliding drawer powered by Framer Motion.
 * - Tactile swipe-to-dismiss threshold and top drag handle.
 * - Master Ambient Mute toggle (silencing weather loop without interrupting master track).
 * - Full Ambisonic Weather Soundboard (Rain on Glass, Distant Thunder, Vinyl Crackle faders).
 * - Quick Sanctuary hardware toggles (Lo-Fi 850Hz filter, Track Catalogue Queue trigger, Candlelight).
 * - Strict >= 44x44px touch targets for mobile accessibility.
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  CloudRain,
  CloudLightning,
  Disc,
  CloudOff,
  Sliders,
  X,
  Volume2,
  VolumeX,
  ListMusic,
  Flame,
  Radio,
} from "lucide-react";
import { AmbientStemKey, AmbientState } from "@/types/contracts";

interface MobileControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ambientVolumes: AmbientState;
  isAmbientMuted: boolean;
  onToggleAmbientMute: () => void;
  setAmbientVolume: (stem: AmbientStemKey, val: number) => void;
  toggleChannelMute: (stem: AmbientStemKey) => void;
  isLoFi: boolean;
  onToggleLoFi: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  onOpenQueue: () => void;
  trackCount: number;
  isCandleLit: boolean;
  onToggleCandle: () => void;
  className?: string;
}

import { AMBIENT_CHANNELS } from "@/lib/constants/ambient";

const STEM_ICONS: Record<AmbientStemKey, React.ReactNode> = {
  rain: <CloudRain className="w-4 h-4 text-sky-400" />,
  thunder: <CloudLightning className="w-4 h-4 text-amber-400" />,
  vinyl: <Disc className="w-4 h-4 text-neutral-400" />,
};

export const MobileControlDrawer: React.FC<MobileControlDrawerProps> = ({
  isOpen,
  onClose,
  ambientVolumes,
  isAmbientMuted,
  onToggleAmbientMute,
  setAmbientVolume,
  toggleChannelMute,
  isLoFi,
  onToggleLoFi,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  onOpenQueue,
  trackCount,
  isCandleLit,
  onToggleCandle,
  className = "",
}) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Dismiss drawer if swiped right past 70px or flicked with high velocity
    if (info.offset.x > 70 || info.velocity.x > 300) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 overflow-hidden select-none md:hidden ${className}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile control & ambient soundboard drawer"
        >
          {/* 1. Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* 2. Slide-Over Spring Glass Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.6 }}
            onDragEnd={handleDragEnd}
            className="absolute top-0 right-0 bottom-0 w-[90vw] max-w-[360px] glass-drawer flex flex-col z-10 border-l border-white/10 shadow-2xl overflow-y-auto"
          >
            {/* Tactile Drag Handle Bar */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header Section */}
            <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white tracking-wide">
                  Sanctuary Controls
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
                aria-label="Close controls drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="p-5 flex flex-col gap-5">
              {/* ------------------------------------------------------------ */}
              {/* SECTION 1: MASTER AMBIENT MUTE TOGGLE                        */}
              {/* ------------------------------------------------------------ */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      isAmbientMuted
                        ? "bg-neutral-900 border-white/5 text-neutral-500"
                        : "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    }`}
                  >
                    {isAmbientMuted ? (
                      <CloudOff className="w-5 h-5" />
                    ) : (
                      <CloudRain className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">
                      Weather Ambience
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {isAmbientMuted
                        ? "All stems silenced"
                        : "Rain, thunder & vinyl loop"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleAmbientMute}
                  className={`min-w-[44px] min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-mono font-medium border flex items-center gap-2 active:scale-95 transition-all ${
                    isAmbientMuted
                      ? "bg-white/[0.05] border-white/10 text-neutral-300 hover:text-white"
                      : "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.35)]"
                  }`}
                  aria-label={isAmbientMuted ? "Unmute ambience" : "Mute ambience"}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAmbientMuted
                        ? "bg-neutral-600"
                        : "bg-amber-400 shadow-[0_0_6px_#F59E0B]"
                    }`}
                  />
                  <span>{isAmbientMuted ? "Unmute" : "Mute"}</span>
                </button>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* SECTION 2: AMBISONIC WEATHER SOUNDBOARD (3 CHANNELS)         */}
              {/* ------------------------------------------------------------ */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-medium">
                    Soundscape Faders
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    3 stems
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {AMBIENT_CHANNELS.map((ch) => {
                    const rawVolume = ambientVolumes[ch.volKey] as number;
                    const isChannelMuted = ambientVolumes[ch.muteKey] as boolean;
                    const isSilenced = isAmbientMuted || isChannelMuted;
                    const displayPercent = isSilenced ? 0 : Math.round(rawVolume * 100);

                    return (
                      <div
                        key={ch.key}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col gap-2"
                      >
                        {/* Channel Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-white/[0.05]">
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
                              onClick={() => toggleChannelMute(ch.key)}
                              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white active:scale-90 transition-all"
                              aria-label={`Toggle mute for ${ch.label}`}
                            >
                              {isSilenced ? (
                                <VolumeX className="w-4 h-4 text-rose-400" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Slider Track */}
                        <div className="relative flex items-center py-1">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isSilenced ? 0 : rawVolume}
                            onChange={(e) => {
                              e.stopPropagation();
                              setAmbientVolume(ch.key, parseFloat(e.target.value));
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            aria-label={`${ch.label} volume slider`}
                            className="w-full h-2 bg-neutral-900 rounded-full appearance-none cursor-pointer accent-amber-500 focus:outline-none z-10"
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

              {/* ------------------------------------------------------------ */}
              {/* SECTION 3: SANCTUARY QUICK TOGGLES                           */}
              {/* ------------------------------------------------------------ */}
              <div className="flex flex-col gap-3 pt-1 border-t border-white/[0.08]">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-medium">
                  Quick Controls
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Lo-Fi DSP Filter Button */}
                  <button
                    type="button"
                    onClick={onToggleLoFi}
                    className={`min-h-[50px] p-3 rounded-xl border flex flex-col justify-between active:scale-95 transition-all text-left ${
                      isLoFi
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                        : "bg-white/[0.03] border-white/10 text-neutral-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Radio className="w-4 h-4 text-amber-400" />
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isLoFi
                            ? "bg-amber-400 shadow-[0_0_6px_#F59E0B]"
                            : "bg-neutral-600"
                        }`}
                      />
                    </div>
                    <span className="text-xs font-semibold mt-1">Lo-Fi Mode</span>
                  </button>

                  {/* Candlelight Atmosphere Button */}
                  <button
                    type="button"
                    onClick={onToggleCandle}
                    className={`min-h-[50px] p-3 rounded-xl border flex flex-col justify-between active:scale-95 transition-all text-left ${
                      isCandleLit
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                        : "bg-white/[0.03] border-white/10 text-neutral-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCandleLit
                            ? "bg-amber-400 shadow-[0_0_6px_#F59E0B]"
                            : "bg-neutral-600"
                        }`}
                      />
                    </div>
                    <span className="text-xs font-semibold mt-1">Candlelight</span>
                  </button>
                </div>

                {/* Track Catalogue Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(onOpenQueue, 150);
                  }}
                  className="min-h-[48px] w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 active:scale-95 transition-all flex items-center justify-between text-neutral-200"
                >
                  <div className="flex items-center gap-2.5">
                    <ListMusic className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium">Track Catalogue</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 bg-white/[0.06] px-2 py-0.5 rounded-full">
                    {trackCount} songs
                  </span>
                </button>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* SECTION 4: MASTER MUSIC VOLUME                                */}
              {/* ------------------------------------------------------------ */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                    Master Track Volume
                  </span>
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    e.stopPropagation();
                    onVolumeChange(parseFloat(e.target.value));
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  aria-label="Master track volume slider"
                  className="w-full h-2 bg-neutral-900 rounded-full appearance-none cursor-pointer accent-amber-500 focus:outline-none z-10"
                  style={{
                    background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${
                      isMuted ? 0 : Math.round(volume * 100)
                    }%, #1E293B ${
                      isMuted ? 0 : Math.round(volume * 100)
                    }%, #1E293B 100%)`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
