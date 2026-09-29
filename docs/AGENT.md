# Antigravity Agent Directives & Operational Protocol (AGENT.md)

**Project Name:** Solitude (Midnight Sad Songs Sanctuary)  
**Target Environment:** Google Antigravity IDE  
**Runtime:** Next.js 15 (App Router, Client Components), React 19, TypeScript (Strict Mode)  
**Backend:** Supabase (Database, Storage, Realtime Presence)  
**Audio Subsystem:** Web Audio API (`AudioContext`, `BiquadFilterNode`, `MediaElementAudioSourceNode`, `GainNode`)  
**Document Version:** 2.0.0 (30 Curated Uncompressed Tracks)  

---

## 1. Prime Directives & Operating Philosophy

You are operating as a Senior Full-Stack Audio Engineer and Systems Architect within Google Antigravity IDE. Your mission is to implement "Solitude" with absolute fidelity to the architectural specification files.

### 1.1 The Anti-Hypnosis Guardrail
1. **Never Invent or Deviate:** Do not hallucinate external libraries (e.g., Howler.js, Tone.js, Wavesurfer) or third-party CDNs (e.g., Cloudflare R2, AWS S3). The architecture is locked strictly to **Supabase** for database, storage, and realtime presence.
2. **Deterministic Code Delivery:** Implement components in full. Never leave placeholders, partial implementations, or comments such as `// TODO: Implement later` or `// ... rest of code goes here`.
3. **Strict Context Adherence:** Every interface, schema, state machine state, and styling rule must match `CONTRACTS.d.ts`, `TRD.md`, `DESIGN.md`, and `UI_FLOW.md`.

---

## 2. Core Architectural Invariants (DO NOT BREAK)

### 2.1 Web Audio API Invariants
* **Singleton AudioContext:** Never instantiate `new AudioContext()` inside a React component render loop or `useEffect` hook without memoizing it as a persistent singleton (`lib/audio/audioContext.ts`).
* **Source Node Reuse Guard:** Never call `audioContext.createMediaElementSource(audioElement)` more than once on the same HTML5 `<audio>` element. Doing so throws an unrecoverable DOMException (`InvalidStateError`). Maintain a single persistent `MediaElementAudioSourceNode` reference across track transitions.
* **Lo-Fi Filter Routing:** The master music stream MUST route through the `BiquadFilterNode`:
  ```
  HTMLAudioElement -> MediaElementSourceNode -> BiquadFilterNode -> AnalyserNode -> MasterGainNode -> AudioContext.destination
  ```
* **Decoupled Ambient Audio:** Looping ambient tracks (`rain.mp3`, `thunder.mp3`, `vinyl.mp3`) must bypass the `BiquadFilterNode` directly into their own dedicated `GainNode` instances so the Lo-Fi filter only muffles the music, not the weather.

### 2.2 React 19 & Next.js 15 Invariants
* **App Router Client Directives:** All audio, canvas, and interactive controls require the `'use client'` directive at the top of the file.
* **Decoupled Render Loops:** The 60 FPS HTML5 Canvas rain engine and scrub-bar time updates MUST run inside `requestAnimationFrame` loops. Never bind particle updates, raindrop positions, or sub-second timeline ticks to React component state (`useState`) to prevent catastrophic 60 Hz DOM reconciliation cycles.
* **Input Isolation for Hotkeys:** Global keyboard listeners MUST evaluate `isInputTarget(e)` prior to executing hotkey actions. If an `<input>` or `<textarea>` element is focused, `Space`, `N`, `P`, `Q`, and `/` must type normally without triggering playback commands.

---

## 3. Strict Coding Standards & Conventions

### 3.1 TypeScript
* Strict mode enabled (`noImplicitAny: true`, `strictNullChecks: true`).
* Explicit type annotations for all function parameters, return values, and exported hooks.
* No usage of `any`. If a generic or dynamic type is necessary, use `unknown` with type narrowing or define explicit schemas in `types/contracts.ts`.

### 3.2 Styling (Tailwind CSS v4)
* Use glassmorphic tokens defined in `DESIGN.md`:
  * Panel glass: `bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]`
  * Active accents: Warm amber glow (`#F59E0B`, `rgba(245, 158, 11, 0.4)`)
  * Ambient themes: Controlled via CSS custom variables (`--bg-tint`, `--vignette-glow`).

---

## 4. File-by-File Implementation Sequence

Execute implementation strictly in this sequential order across project milestones:

+-----+-----------------------------------+---------------------------------------------------------+
| Step| Target File                       | Responsibility                                          |
+-----+-----------------------------------+---------------------------------------------------------+
| 01  | `types/contracts.ts`              | Core TypeScript interfaces, Song model, PlayerState.    |
| 02  | `lib/constants/tracks.ts`         | Static fallback manifest containing all 30 songs.       |
| 03  | `lib/audio/audioContext.ts`       | AudioContext singleton and iOS Safari unlock routine.   |
| 04  | `lib/audio/filterNode.ts`         | Biquad low-pass filter configuration & ramps.           |
| 05  | `lib/audio/gainCurves.ts`         | Logarithmic volume attenuation curves.                  |
| 06  | `lib/supabase/client.ts`          | Supabase client initialiser.                            |
| 07  | `lib/supabase/queries.ts`         | Song fetching queries and metadata mappings.            |
| 08  | `hooks/useAudioEngine.ts`         | Master Web Audio graph and HTML5 audio coordinator.     |
| 09  | `hooks/useKeyboardShortcuts.ts`   | Global keyboard listener with input isolation guard.    |
| 10  | `hooks/usePresence.ts`            | Supabase Realtime channel and circadian counter logic.  |
| 11  | `components/canvas/RainCanvas.tsx`| 60 FPS HTML5 Canvas 2D rain and condensation engine.    |
| 12  | `components/player/VinylDisc.tsx` | Rotating vinyl artwork with inertial pause slowdown.    |
| 13  | `components/player/ScrubBar.tsx`  | Scrubable timeline slider with hover preview bubble.    |
| 14  | `components/player/LoFiToggle.tsx`| Warm amber vacuum-tube toggle button.                   |
| 15  | `components/player/AudioDeck.tsx` | Master glassmorphic dock and playback button cluster.   |
| 16  | `components/queue/QueueDrawer.tsx`| Slide-over drawer with real-time fuzzy search input.     |
| 17  | `components/ambient/Soundboard.tsx| 3-channel ambient faders popover (Rain, Thunder, Vinyl).|
| 18  | `app/page.tsx`                    | Root client view wiring state, audio, and visual layers.|
+-----+-----------------------------------+---------------------------------------------------------+

---

## 5. Verification Checklist Before Declaring Any Task Done

Before reporting completion of any component or task, verify:
* [ ] Does the code compile with zero TypeScript errors (`tsc --noEmit`)?
* [ ] Are Web Audio nodes cleanly disconnected in a `useEffect` return cleanup function?
* [ ] Is input target isolation active so pressing `Space` in the search bar types a space character instead of pausing the song?
* [ ] Are all 30 songs sourced using the canonical playlist ordering from `PRD.md`?
* [ ] Does the component maintain responsive layout integrity across 375px mobile, 768px tablet, and 1440px desktop viewports?