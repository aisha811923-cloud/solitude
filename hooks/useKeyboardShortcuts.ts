/**
 * Master Keyboard Shortcuts Engine & Input Isolation (hooks/useKeyboardShortcuts.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Architecture: Hardware hotkey listeners, DOM target isolation, keycap HUD telemetry
 * 
 * Hotkey Matrix:
 * - [Space]     : Toggle Play / Pause
 * - [ArrowLeft] : Seek backward 5 seconds
 * - [ArrowRight]: Seek forward 5 seconds
 * - [ArrowUp]   : Volume increment (+5%)
 * - [ArrowDown] : Volume decrement (-5%)
 * - [KeyN]      : Next track
 * - [KeyP]      : Previous track
 * - [KeyQ]      : Toggle track drawer
 * - [KeyM]      : Toggle mute / unmute
 * - [KeyL]      : Toggle Lo-Fi DSP filter
 * - [Slash]     : Open & focus search
 * - [Escape]    : Close drawer / Blur search
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import { useEffect, useState, useCallback } from "react";

export function isInputTarget(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }

  if (target.isContentEditable) {
    return true;
  }

  const role = target.getAttribute("role");
  if (role === "textbox" || role === "searchbox") {
    return true;
  }

  return false;
}

export interface ShortcutActions {
  togglePlay: () => void;
  seekRelative: (delta: number) => void;
  volume: number;
  setVolume: (val: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleQueue: () => void;
  openAndFocusSearch: () => void;
  closeQueue: () => void;
  toggleMute: () => void;
  toggleLoFi: () => void;
}

export interface ShortcutState {
  isQueueOpen: boolean;
}

export function useKeyboardShortcuts(
  actions: ShortcutActions,
  state: ShortcutState
): { activeKeycode: string | null } {
  const [activeKeycode, setActiveKeycode] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const inInput = isInputTarget(e);

      // ESCAPE KEY: Dual-stage dismissal
      if (e.key === "Escape") {
        if (inInput) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
          return;
        }
        if (state.isQueueOpen) {
          e.preventDefault();
          actions.closeQueue();
          return;
        }
      }

      // Input isolation guard: allow native typing inside search input
      if (inInput) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setActiveKeycode("Space");
          actions.togglePlay();
          break;

        case "ArrowLeft":
          e.preventDefault();
          setActiveKeycode("ArrowLeft");
          actions.seekRelative(-5);
          break;

        case "ArrowRight":
          e.preventDefault();
          setActiveKeycode("ArrowRight");
          actions.seekRelative(5);
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveKeycode("ArrowUp");
          actions.setVolume(Math.min(1, actions.volume + 0.05));
          break;

        case "ArrowDown":
          e.preventDefault();
          setActiveKeycode("ArrowDown");
          actions.setVolume(Math.max(0, actions.volume - 0.05));
          break;

        case "KeyN":
          setActiveKeycode("KeyN");
          actions.nextTrack();
          break;

        case "KeyP":
          setActiveKeycode("KeyP");
          actions.prevTrack();
          break;

        case "KeyQ":
          setActiveKeycode("KeyQ");
          actions.toggleQueue();
          break;

        case "Slash":
          e.preventDefault(); // Prevent browser quick-find
          setActiveKeycode("Slash");
          actions.openAndFocusSearch();
          break;

        case "KeyM":
          setActiveKeycode("KeyM");
          actions.toggleMute();
          break;

        case "KeyL":
          setActiveKeycode("KeyL");
          actions.toggleLoFi();
          break;

        default:
          break;
      }
    },
    [actions, state.isQueueOpen]
  );

  const handleKeyUp = useCallback(() => {
    setActiveKeycode(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { activeKeycode };
}
