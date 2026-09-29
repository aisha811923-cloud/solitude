# Solitude Sanctuary Master Roadmap (ROADMAP.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)  
Architecture: Next.js 15 (App Router), React 19, Tailwind CSS v4, Web Audio API, Supabase  
Asset Location: assets/media/  
Specs Directory: docs/  

---

## Architecture & Asset Directives

* Environment Secrets: Stored in `.env` / `.env.local` containing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
* Media Assets: Custom background images, cover art, and local audio stems reside in `assets/media/`.
* Specifications: All technical requirement docs, data dictionaries, and state machines reside in `docs/`.

---

## Phase Breakdown & Milestone Schedule

### Phase 0: Scaffolding, Configuration & Environment
* Target Files: `package.json`, `tsconfig.json`, `next.config.ts`, `app/globals.css`, `.env.local`.
* Milestones:
  1. Initialize Next.js 15 App Router shell with TypeScript in strict mode.
  2. Install dependencies: `@supabase/supabase-js`, `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge`.
  3. Configure Content Security Policy (CSP) in `next.config.ts` allowing Supabase media streaming and WebSockets.
  4. Verify `.env` parameters (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### Phase 1: Native Web Audio Engine & DSP Routing
* Target Files: `lib/audio/audioContext.ts`, `lib/audio/filterNode.ts`, `lib/audio/gainCurves.ts`, `hooks/useAudioEngine.ts`.
* Milestones:
  1. Build module-level singleton `AudioContext` with iOS Safari silent-buffer unlocker.
  2. Implement native `BiquadFilterNode` for Lo-Fi mode (sweeping 20,000 Hz to 850 Hz, Q = 3.5).
  3. Create quadratic perceptual gain curves (`Gain = Volume^2`) and zero-click 150ms crossfader.
  4. Establish persistent `MediaElementAudioSourceNode` reference to prevent multiple-connection crashes.

### Phase 2: Media Asset Pipeline & Track Catalogue
* Target Files: `types/contracts.ts`, `lib/constants/tracks.ts`, `lib/supabase/client.ts`, `lib/supabase/storage.ts`.
* Milestones:
  1. Load background image from `assets/media/` into the viewport container with subtle dark vignette.
  2. Wire Supabase client singleton using `.env` credentials.
  3. Map 30 curated tracks to Supabase Storage HTTP 206 streaming endpoints.
  4. Set up 3 ambient soundboard loops (rain, thunder, vinyl) bypassing the Lo-Fi filter.

### Phase 3: Visual Physics & Turntable Platter
* Target Files: `components/canvas/RainCanvas.tsx`, `hooks/useRainEngine.ts`, `components/player/VinylDisc.tsx`, `components/lighting/CandleGraphic.tsx`.
* Milestones:
  1. Implement decoupled 60 FPS HTML5 Canvas rain simulation (120 raindrops + 35 condensation streaks).
  2. Build center vinyl record with continuous 18s rotation during playback.
  3. Implement 1.2s inertial drag deceleration on pause using cubic-bezier physics.
  4. Create SVG animated candle flame with organic micro-flicker keyframes.

### Phase 4: Glassmorphic UI & Keyboard Navigation
* Target Files: `components/player/AudioDeck.tsx`, `components/player/ScrubBar.tsx`, `components/queue/QueueDrawer.tsx`, `components/player/KeyboardShortcutsHud.tsx`, `hooks/useKeyboardShortcuts.ts`.
* Milestones:
  1. Construct bottom master dock with play/pause, skips, Lo-Fi toggle, and soundboard faders.
  2. Build scrub bar with hover timestamps and HTTP 206 range seeking.
  3. Build Framer Motion slide-over queue drawer with instant in-memory search.
  4. Implement strict `isInputTarget(e)` keyboard isolation: hotkeys work globally, but typing in search fields never triggers playback commands.
  5. Mount Keycap HUD showing physical keyboard shortcuts with dynamic amber active states.

### Phase 5: Communal Presence, PWA & Production Audit
* Target Files: `hooks/usePresence.ts`, `components/presence/PresenceBeacon.tsx`, `public/manifest.webmanifest`, `public/sw.js`.
* Milestones:
  1. Connect to Supabase Realtime channel `room:solitude-global`.
  2. Implement nocturnal circadian algorithm peaking between 12:00 AM and 4:30 AM.
  3. Configure MediaSession API for OS lock screen metadata and Bluetooth playback controls.
  4. Audit memory leaks, verify zero unhandled exceptions, and confirm production build (`npm run build`).