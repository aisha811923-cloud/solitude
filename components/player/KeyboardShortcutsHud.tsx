/**
 * Keyboard Shortcuts HUD Bar (components/player/KeyboardShortcutsHud.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Layout: Floating HUD pill displaying active hardware hotkeys with amber illumination
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React from "react";

interface KeyboardShortcutsHudProps {
  activeKeycode: string | null;
  isQueueOpen?: boolean;
  className?: string;
}

interface ShortcutItem {
  code: string;
  label: string;
  action: string;
  activeOverride?: boolean;
}

export const KeyboardShortcutsHud: React.FC<KeyboardShortcutsHudProps> = ({
  activeKeycode,
  isQueueOpen = false,
  className = "",
}) => {
  const shortcuts: ShortcutItem[] = [
    { code: "Space", label: "Space", action: "Play" },
    { code: "ArrowLeft", label: "←", action: "Seek" },
    { code: "ArrowRight", label: "→", action: "Seek" },
    { code: "KeyN", label: "N", action: "Next" },
    { code: "KeyP", label: "P", action: "Prev" },
    { code: "KeyL", label: "L", action: "Lo-Fi" },
    { code: "KeyM", label: "M", action: "Mute" },
    { code: "KeyQ", label: "Q", action: "Queue", activeOverride: isQueueOpen },
    { code: "Slash", label: "/", action: "Find" },
  ];

  return (
    <aside
      aria-label="Tactile Keyboard Shortcuts Navigation HUD"
      className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 select-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${className}`}
    >
      {shortcuts.map((sc) => {
        const isPressed = activeKeycode === sc.code || sc.activeOverride;

        return (
          <div
            key={sc.code}
            className="flex items-center gap-1 text-[11px] font-mono text-neutral-400"
          >
            <kbd
              className={`inline-flex items-center justify-center min-w-[20px] h-[19px] px-1 rounded text-[10px] font-semibold transition-all duration-100 ${
                isPressed
                  ? "bg-amber-400 text-neutral-950 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)] translate-y-[1px]"
                  : "bg-white/[0.06] text-neutral-300 border border-white/10 border-b-white/20"
              }`}
            >
              {sc.label}
            </kbd>
            <span className="text-[10px] text-neutral-500 mr-1.5">
              {sc.action}
            </span>
          </div>
        );
      })}
    </aside>
  );
};
