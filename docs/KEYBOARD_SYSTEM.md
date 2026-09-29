# Keyboard Shortcuts & Input Isolation Specification (KEYBOARD_SYSTEM.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Definitive interaction matrix, keyboard listener architecture, input target isolation routines, browser default overrides, and Keycap HUD visual mechanics.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Interaction Philosophy & Tactile Keyboard First Design

Solitude is engineered to be operated eyes-closed or in low-light environments without touching a mouse or trackpad. Global hotkeys replicate vintage Hi-Fi hardware controls:
* Instant Play/Pause switching without latency.
* Fine timeline seeking (+/- 5 seconds) via arrow keys.
* Instant skip navigation with linear track crossfades.
* Tactile slide-over queue drawer triggering and instant search focus.

To prevent UX friction, the keyboard engine incorporates strict **DOM Target Isolation**, ensuring typing inside search bars or dialogs never accidentally triggers playback commands or pauses music.

---

## 2. Complete Keybinding Matrix

+------------------+---------------------+-----------------------+------------------+-----------------------------------------------+
| Key Identifier   | Action Name         | Guard Condition       | Prevent Default  | Hardware / Behavioral Response                |
+------------------+---------------------+-----------------------+------------------+-----------------------------------------------+
| Space            | Play / Pause Toggle | !isInputTarget(e)     | Yes (always)     | Toggles master playback; ramps gain; stops/   |
|                  |                     |                       |                  | starts vinyl rotation.                        |
| ArrowLeft (<-)   | Seek Backward (-5s) | !isInputTarget(e)     | Yes (always)     | Decrements audio element currentTime by 5.0s. |
| ArrowRight (->)  | Seek Forward (+5s)  | !isInputTarget(e)     | Yes (always)     | Increments audio element currentTime by 5.0s. |
| KeyN             | Next Track          | !isInputTarget(e)     | No               | 150ms gain crossfade to track (index + 1).    |
| KeyP             | Previous Track      | !isInputTarget(e)     | No               | 150ms gain crossfade to track (index - 1).    |
| KeyQ             | Toggle Queue Drawer | !isInputTarget(e)     | No               | Slides queue drawer open/closed.              |
| Slash (/)        | Focus Track Search  | !isInputTarget(e)     | Yes (always)     | Opens queue drawer if closed; focuses search  |
|                  |                     |                       |                  | input immediately without inserting '/'.      |
| Escape           | Blur Search / Close | isInputTarget(e) ||   | Yes (if in search| If search focused: blurs input and restores   |
|                  |                     | isQueueOpen           | or open drawer)  | hotkeys. If drawer open: slides drawer shut.  |
| KeyM             | Master Mute Toggle  | !isInputTarget(e)     | No               | Mutes/unmutes master GainNode smoothly.       |
| KeyL             | Toggle Lo-Fi Filter | !isInputTarget(e)     | No               | Sweeps BiquadFilterNode between 20kHz & 850Hz.|
+------------------+---------------------+-----------------------+------------------+-----------------------------------------------+

---

## 3. Input Target Isolation Engine

A primary bug in media web apps is the "Spacebar Conflict" (where typing a space in an input field pauses the song). The isolation engine intercepts events before they reach the dispatch switch.

### 3.1 Target Inspector Implementation (hooks/useKeyboardShortcuts.ts)

    export function isInputTarget(event: KeyboardEvent): boolean {
      const target = event.target as HTMLElement | null;
      if (!target) return false;

      // 1. Native form fields
      const tagName = target.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
        return true;
      }

      // 2. Rich text and contenteditable wrappers
      if (target.isContentEditable) {
        return true;
      }

      // 3. Elements styled or flagged as input roles
      const role = target.getAttribute("role");
      if (role === "textbox" || role === "searchbox") {
        return true;
      }

      return false;
    }

---

## 4. Production Keyboard Listener Hook

    "use client";

    import { useEffect } from "react";
    import { isInputTarget } from "./useKeyboardShortcuts";

    interface ShortcutActions {
      togglePlay: () => void;
      seekRelative: (delta: number) => void;
      nextTrack: () => void;
      prevTrack: () => void;
      toggleQueue: () => void;
      openAndFocusSearch: () => void;
      closeQueue: () => void;
      toggleMute: () => void;
      toggleLoFi: () => void;
      setActiveKeycap: (key: string | null) => void;
    }

    interface ShortcutState {
      isQueueOpen: boolean;
    }

    export function useKeyboardShortcuts(actions: ShortcutActions, state: ShortcutState) {
      useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
          const inInput = isInputTarget(e);

          // ESCAPE KEY: Dual-stage dismiss behavior
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

          // GUARD: Allow native typing if user is focused inside a text field
          if (inInput) {
            return;
          }

          // Global Hotkey Routing Switch
          switch (e.code) {
            case "Space":
              e.preventDefault(); // Prevent standard page scroll
              actions.setActiveKeycap("Space");
              actions.togglePlay();
              break;

            case "ArrowLeft":
              e.preventDefault();
              actions.setActiveKeycap("ArrowLeft");
              actions.seekRelative(-5);
              break;

            case "ArrowRight":
              e.preventDefault();
              actions.setActiveKeycap("ArrowRight");
              actions.seekRelative(5);
              break;

            case "KeyN":
              actions.setActiveKeycap("KeyN");
              actions.nextTrack();
              break;

            case "KeyP":
              actions.setActiveKeycap("KeyP");
              actions.prevTrack();
              break;

            case "KeyQ":
              actions.setActiveKeycap("KeyQ");
              actions.toggleQueue();
              break;

            case "Slash":
              e.preventDefault(); // Prevent quick-find in Firefox/Safari
              actions.setActiveKeycap("Slash");
              actions.openAndFocusSearch();
              break;

            case "KeyM":
              actions.setActiveKeycap("KeyM");
              actions.toggleMute();
              break;

            case "KeyL":
              actions.setActiveKeycap("KeyL");
              actions.toggleLoFi();
              break;

            default:
              break;
          }
        }

        function handleKeyUp() {
          // Reset keycap glow when physical key is released
          actions.setActiveKeycap(null);
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
          window.removeEventListener("keydown", handleKeyDown);
          window.removeEventListener("keyup", handleKeyUp);
        };
      }, [actions, state.isQueueOpen]);
    }

---

## 5. Visual Keycap HUD Component (components/player/KeyboardShortcutsHud.tsx)

Renders a sleek, tactile status pill at the bottom of the viewport showing current hotkeys with dynamic amber lighting on keypress.

    "use client";

    import React from "react";

    interface KeyboardShortcutsHudProps {
      activeKeycap: string | null;
      isQueueOpen: boolean;
    }

    export const KeyboardShortcutsHud: React.FC<KeyboardShortcutsHudProps> = ({
      activeKeycap,
      isQueueOpen,
    }) => {
      const shortcuts = [
        { code: "Space", label: "Space", action: "Play" },
        { code: "ArrowLeft", label: "<-", action: "Seek" },
        { code: "ArrowRight", label: "->", action: "Seek" },
        { code: "KeyN", label: "N", action: "Next" },
        { code: "KeyP", label: "P", action: "Prev" },
        { code: "KeyL", label: "L", action: "Lo-Fi" },
        { code: "KeyQ", label: "Q", action: "Queue", activeOverride: isQueueOpen },
        { code: "Slash", label: "/", action: "Find" },
      ];

      return (
        <aside
          aria-label="Tactile Keyboard Shortcuts Navigation HUD"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 select-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
        >
          {shortcuts.map((sc) => {
            const isPressed = activeKeycap === sc.code || sc.activeOverride;

            return (
              <div key={sc.code} className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <kbd
                  className={`inline-flex items-center justify-center min-w-[20px] h-[19px] px-1 rounded text-[10px] font-semibold transition-all duration-100 ${
                    isPressed
                      ? "bg-amber-400 text-black border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)] translate-y-[1px]"
                      : "bg-white/[0.06] text-slate-300 border border-white/10 border-b-white/20"
                  }`}
                >
                  {sc.label}
                </kbd>
                <span className="text-[10px] text-slate-500 mr-1.5">{sc.action}</span>
              </div>
            );
          })}
        </aside>
      );
    };

---

## 6. Edge Cases & Browser Mitigation Checklist

1. Firefox Quick Find Override:
   Firefox natively listens to `/` to trigger the browser's in-page text search. Calling `e.preventDefault()` on `Slash` completely neutralizes this behavior, routing focus directly to the Solitude search bar.
2. Arrow Key Viewport Jumping:
   In overflowing viewports, `ArrowLeft` and `ArrowRight` trigger horizontal scrolling. `e.preventDefault()` suppresses viewport scroll while dispatching `seekRelative(+/- 5)`.
3. Mobile Touch Screen Disablement:
   On screen viewports `< 768px`, the Keyboard HUD is automatically hidden via Tailwind's `hidden md:flex` class, conserving vertical screen estate for the vinyl deck and scrub bar.