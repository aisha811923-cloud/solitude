/**
 * Hardware & OS-Level Media Session API Orchestrator (hooks/useMediaSession.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Specification: W3C Media Session API
 * 
 * Capabilities:
 * - Syncs track metadata to OS lock screen, notification center, and CarPlay/Auto.
 * - Routes physical hardware media keys (Play, Pause, Skip, Headphone remotes).
 * - Live position state reporting for OS scrubber synchronization.
 * - Complete browser compatibility guards.
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import { useEffect } from "react";
import { Song, PlaybackStatus } from "@/types/contracts";

interface MediaSessionControls {
  currentTrack: Song;
  isPlaying: boolean;
  playbackStatus: PlaybackStatus;
  currentTime: number;
  duration: number;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  seekRelative: (deltaSeconds: number) => void;
}

export function useMediaSession(controls: MediaSessionControls): void {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    nextTrack,
    prevTrack,
    seek,
    seekRelative,
  } = controls;

  // 1. Sync Track Metadata
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    try {
      const coverUrl = currentTrack.cover_url;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: "Solitude Sanctuary",
        artwork: [
          { src: coverUrl, sizes: "96x96", type: "image/webp" },
          { src: coverUrl, sizes: "128x128", type: "image/webp" },
          { src: coverUrl, sizes: "256x256", type: "image/webp" },
          { src: coverUrl, sizes: "512x512", type: "image/webp" },
        ],
      });
    } catch (err: unknown) {
      console.warn("[Solitude MediaSession] Failed to set metadata:", err);
    }
  }, [currentTrack]);

  // 2. Sync Playback State (playing | paused | none)
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch {
      // Ignore browsers with partial playbackState support
    }
  }, [isPlaying]);

  // 3. Sync Position State (Lock Screen Scrubber)
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("mediaSession" in navigator) ||
      !("setPositionState" in navigator.mediaSession)
    ) {
      return;
    }

    if (duration > 0 && !isNaN(duration) && !isNaN(currentTime)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(1, duration),
          playbackRate: 1,
          position: Math.min(Math.max(0, currentTime), duration),
        });
      } catch {
        // Silently catch invalid position state errors
      }
    }
  }, [currentTime, duration]);

  // 4. Register Action Handlers
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    const ms = navigator.mediaSession;

    const actionMap: Array<{
      action: MediaSessionAction;
      handler: MediaSessionActionHandler;
    }> = [
      {
        action: "play",
        handler: () => {
          play().catch(() => {});
        },
      },
      {
        action: "pause",
        handler: () => {
          pause();
        },
      },
      {
        action: "previoustrack",
        handler: () => {
          prevTrack();
        },
      },
      {
        action: "nexttrack",
        handler: () => {
          nextTrack();
        },
      },
      {
        action: "seekto",
        handler: (details) => {
          if (details.seekTime !== undefined && details.seekTime !== null) {
            seek(details.seekTime);
          }
        },
      },
      {
        action: "seekbackward",
        handler: (details) => {
          const offset = details.seekOffset || 5;
          seekRelative(-offset);
        },
      },
      {
        action: "seekforward",
        handler: (details) => {
          const offset = details.seekOffset || 5;
          seekRelative(offset);
        },
      },
    ];

    actionMap.forEach(({ action, handler }) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        // Some actions may not be supported on all browsers
      }
    });

    return () => {
      actionMap.forEach(({ action }) => {
        try {
          ms.setActionHandler(action, null);
        } catch {
          // Cleanup
        }
      });
    };
  }, [play, pause, prevTrack, nextTrack, seek, seekRelative]);
}
