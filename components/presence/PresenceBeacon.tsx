/**
 * Communal Presence Beacon Pill (components/presence/PresenceBeacon.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Architecture: Real-time listener telemetry, pulsing amber beacon LED, circadian fallback
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React from "react";
import { usePresence } from "@/hooks/usePresence";

interface PresenceBeaconProps {
  className?: string;
}

export const PresenceBeacon: React.FC<PresenceBeaconProps> = ({ className = "" }) => {
  const { displayCount, isConnected } = usePresence();

  const countText = displayCount === 1 ? "1 soul" : `${displayCount.toLocaleString()} souls`;
  const actionText = displayCount === 1 ? "listening in solitude" : "listening alone together";

  return (
    <aside
      aria-label="Active listeners in sanctuary"
      role="status"
      title={isConnected ? "Live telemetry: Connected to global presence" : "Connecting to presence..."}
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] select-none transition-all duration-300 hover:bg-white/[0.08] ${className}`}
    >
      {/* Pulsing Beacon LED Indicator */}
      <div className="relative flex items-center justify-center w-2 h-2">
        <span
          className={`absolute inline-flex w-full h-full rounded-full animate-ping opacity-75 ${
            isConnected ? "bg-amber-400" : "bg-neutral-500"
          }`}
        />
        <span
          className={`relative inline-flex w-1.5 h-1.5 rounded-full ${
            isConnected
              ? "bg-amber-500 shadow-[0_0_8px_#F59E0B]"
              : "bg-neutral-600"
          }`}
        />
      </div>

      {/* Communal Count Telemetry */}
      <p className="font-mono text-xs tracking-tight text-neutral-300">
        <strong className="font-medium text-amber-400 tabular-nums">
          {countText}
        </strong>{" "}
        {actionText}
      </p>
    </aside>
  );
};
