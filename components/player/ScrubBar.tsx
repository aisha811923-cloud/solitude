/**
 * Tactile Hardware Timeline Scrub Bar (components/player/ScrubBar.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Hardware Modeling:
 * - Precision timeline track with buffered progress and active amber playhead.
 * - Interactive hover timestamp preview with floating glass tooltip.
 * - Pointer-drag scrubbing with immediate client feedback and document capture.
 * - Accessible keyboard navigation (ArrowLeft, ArrowRight, Home, End).
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { formatTime } from "@/lib/utils/formatTime";

interface ScrubBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  bufferedTime?: number;
  className?: string;
}

export const ScrubBar: React.FC<ScrubBarProps> = ({
  currentTime,
  duration,
  onSeek,
  bufferedTime = 0,
  className = "",
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragTime, setDragTime] = useState<number>(0);
  const [hoverPosition, setHoverPosition] = useState<{ xPercent: number; time: number } | null>(null);

  const safeDuration = duration > 0 ? duration : 1;
  const effectiveTime = isDragging ? dragTime : currentTime;
  const progressPercent = Math.min(100, Math.max(0, (effectiveTime / safeDuration) * 100));
  const bufferedPercent = Math.min(100, Math.max(0, (bufferedTime / safeDuration) * 100));

  // Compute seek time from clientX
  const getTimeFromPointer = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = clickX / rect.width;
      return percentage * safeDuration;
    },
    [safeDuration]
  );

  // Handle pointer down (start drag or instantaneous click)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const targetTime = getTimeFromPointer(e.clientX);
    setDragTime(targetTime);
  };

  // Pointer drag and window move listener
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const targetTime = getTimeFromPointer(e.clientX);
      setDragTime(targetTime);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const finalTime = getTimeFromPointer(e.clientX);
      setIsDragging(false);
      onSeek(finalTime);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, getTimeFromPointer, onSeek]);

  // Hover preview calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const xPercent = (x / rect.width) * 100;
    const time = (x / rect.width) * safeDuration;
    setHoverPosition({ xPercent, time });
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        onSeek(Math.max(0, currentTime - 5));
        break;
      case "ArrowRight":
        e.preventDefault();
        onSeek(Math.min(safeDuration, currentTime + 5));
        break;
      case "Home":
        e.preventDefault();
        onSeek(0);
        break;
      case "End":
        e.preventDefault();
        onSeek(safeDuration);
        break;
    }
  };

  return (
    <div
      className={`w-full max-w-[580px] flex items-center gap-3 select-none px-2 ${className}`}
      aria-label="Audio scrubber"
    >
      {/* Current Elapsed Time Display */}
      <span className="font-mono text-xs text-neutral-400 tabular-nums w-11 text-right select-none">
        {formatTime(effectiveTime)}
      </span>

      {/* Hardware Scrub Track Container */}
      <div
        ref={trackRef}
        role="slider"
        aria-label="Track progress"
        aria-valuenow={effectiveTime}
        aria-valuemin={0}
        aria-valuemax={duration}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        className="relative flex-1 h-11 min-h-[44px] flex items-center cursor-pointer group focus:outline-none touch-none"
      >
        {/* Track Groove Background (Hardware Recessed Rail) */}
        <div className="w-full h-1.5 rounded-full bg-neutral-900/90 border border-white/[0.08] relative overflow-hidden backdrop-blur-sm">
          {/* Buffered Progress Indicator */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/15 transition-all duration-300"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Active Played Progress Indicator (Amber Radiance) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
            style={{
              width: `${progressPercent}%`,
              boxShadow: "0 0 10px rgba(245, 158, 11, 0.45)",
            }}
          />
        </div>

        {/* Hover Scrub Preview Tooltip */}
        {hoverPosition && !isDragging && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 pointer-events-none px-2 py-0.5 rounded bg-neutral-900/95 border border-amber-500/30 text-[10px] font-mono text-amber-300 shadow-xl backdrop-blur-md transition-opacity duration-150"
            style={{ left: `${hoverPosition.xPercent}%` }}
          >
            {formatTime(hoverPosition.time)}
          </div>
        )}

        {/* Tactile Hardware Thumb (Slider Knob) */}
        <div
          className={`absolute w-3.5 h-3.5 -ml-1.75 rounded-full bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-100 border border-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.7)] transform transition-transform duration-100 pointer-events-none ${
            isDragging || hoverPosition ? "scale-125" : "scale-100"
          }`}
          style={{ left: `${progressPercent}%` }}
        >
          {/* Inner Knob Core */}
          <div className="w-1.5 h-1.5 rounded-full bg-amber-900/70 absolute inset-0 m-auto" />
        </div>
      </div>

      {/* Total Duration Display */}
      <span className="font-mono text-xs text-neutral-500 tabular-nums w-11 text-left select-none">
        {formatTime(duration)}
      </span>
    </div>
  );
};
