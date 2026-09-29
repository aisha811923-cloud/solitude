# Application Webflow & Lifecycle Specification (WEBFLOW.md)

**Project Name:** Solitude (Midnight Sad Songs Sanctuary)  
**System Type:** Client-Side Single Page Application (SPA) / Progressive Web App (PWA)  
**Framework:** Next.js 15 (App Router), React 19 Client Runtime, Supabase  
**Document Version:** 2.0.0 (Updated for 30 Uncompressed Tracks & Unified Supabase Architecture)  
**Target Environment:** Google Antigravity IDE  

---

## 1. Application Architecture & Viewport Model

Solitude operates as a persistent, zero-reload Single Page Application (SPA). To maintain unbroken audio streams, uninterrupted Web Audio low-pass filtering, continuous ambient rain loops, and persistent WebSocket presence, all views and controls exist within a unified viewport shell.

+-------------------------------------------------------------------------+
| Next.js App Router (app/layout.tsx)                                     |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Root Audio & Presence Provider (Context / Zustand Store)          |  |
|  |                                                                   |  |
|  |   +-------------------------------------------------------------+ |  |
|  |   | Visual Viewport (app/page.tsx)                              | |  |
|  |   |                                                             | |  |
|  |   |  Layer 1: HTML5 Canvas Rain Simulation (Z: 10)              | |  |
|  |   |  Layer 2: Dynamic Lighting & Grain Shader (Z: 20)            | |  |
|  |   |  Layer 3: Interactive Deck, Vinyl & HUD (Z: 30)             | |  |
|  |   |  Layer 4: Slide-over Queue & Ambient Faders (Z: 50)         | |  |
|  |   +-------------------------------------------------------------+ |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+

---

## 2. Directory Architecture & Routing Structure

app/
|-- favicon.ico
|-- globals.css            # Tailwind v4 directives, glassmorphic utility classes
|-- icon.png               # PWA App Icon (512x512)
|-- layout.tsx             # Root server shell, font loading, dark theme metadata
|-- manifest.webmanifest   # PWA installation manifest
|-- page.tsx               # Client entry point: loads audio engine & canvas shell
|-- api/
|   `-- health/
|       `-- route.ts       # Edge health check endpoint
components/
|-- ambient/
|   |-- AmbientSoundboard.tsx
|   `-- SoundboardFader.tsx
|-- canvas/
|   |-- RainCanvas.tsx
|   `-- useRainEngine.ts
|-- lighting/
|   |-- CandleGraphic.tsx
|   `-- LightingVignette.tsx
|-- player/
|   |-- AudioDeck.tsx
|   |-- KeyboardShortcutsHud.tsx
|   |-- LoFiToggle.tsx
|   |-- ScrubBar.tsx
|   |-- TrackMetadata.tsx
|   `-- VinylDisc.tsx
|-- presence/
|   `-- PresenceBeacon.tsx
`-- queue/
    |-- QueueDrawer.tsx
    |-- SearchBar.tsx
    `-- TrackItem.tsx
hooks/
|-- useAudioEngine.ts      # Web Audio API graph management & playback controls
|-- useKeyboardShortcuts.ts# Global hotkeys dispatch & input isolation
|-- usePresence.ts         # Supabase Realtime presence subscription
`-- useLocalStorage.ts     # Client state persistence
lib/
|-- audio/
|   |-- audioContext.ts    # Singleton AudioContext generator & unlocker
|   |-- filterNode.ts      # BiquadFilterNode configuration (Lo-Fi mode)
|   `-- gainCurves.ts      # Logarithmic volume attenuation curves
|-- constants/
|   `-- tracks.ts          # Static track manifest fallback (30 songs)
|-- supabase/
|   |-- client.ts          # Supabase client initialization
|   `-- queries.ts         # Song catalogue queries
`-- types/
    `-- contracts.ts       # Shared TypeScript types & interfaces

---

## 3. Application Bootstrapping & Hydration Sequence

The boot sequence transitions the application from initial server-side HTML render to fully interactive audio streaming across five sequential stages:

+-------------------------------------------------------------------------+
| Stage 1: Static Pre-render & HTML Delivery (0ms - 200ms)                |
| - Browser fetches server-rendered Next.js shell.                        |
| - Layout renders deep midnight backdrop (#070B14) to prevent flashes.   |
| - Tailwind CSS & Geist Mono / Inter webfonts load.                      |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Stage 2: Client Hydration & Canvas Ignition (200ms - 400ms)             |
| - React 19 client components hydrate.                                   |
| - Local storage loads persisted volume, lighting, and Lo-Fi settings.   |
| - RainCanvas mounts: initializes requestAnimationFrame loop at 60 FPS.  |
| - Supabase client initializes and queries the 30-song manifest.         |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Stage 3: Realtime Presence Handshake (400ms - 600ms)                    |
| - Client connects to Supabase WebSocket channel: 'room:solitude-global'.|
| - Initial connected user count received and blended with circadian      |
|   baseline algorithm to display the active listener count.              |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Stage 4: Suspended Audio Standby (Waiting for Gesture)                  |
| - AudioContext sits in 'suspended' state (Browser Autoplay Compliance). |
| - HTML5 audio element is instantiated in memory with Track 001 source.  |
| - Center vinyl disc displays "Enter Sanctuary" interaction prompt.      |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Stage 5: Audio Engine Unlocking (First User Click or Space Key)         |
| - AudioContext.resume() completes.                                      |
| - 1-sample silent buffer routes to destination to satisfy iOS Safari.   |
| - Ambient loops (rain, vinyl) start fading in on independent buses.     |
| - Track 001 begins streaming via HTTP 206 Partial Content.              |
| - Vinyl begins rotating clockwise (18s linear cycle).                   |
+-------------------------------------------------------------------------+

---

## 4. Web Audio Lifecycle & Event Matrix

The AudioEngine operates as a finite state machine managing hardware access, mobile sleep states, and routing transitions:

+-------------------+-----------------------------------------------------+
| Lifecycle Event   | System Behavior & State Action                      |
+-------------------+-----------------------------------------------------+
| Page Mount        | AudioContext created in SUSPENDED state. Audio bus  |
|                   | nodes wired (Source -> Biquad -> Analyser -> Gain). |
+-------------------+-----------------------------------------------------+
| First Click /     | unlockAudioContext() triggered. AudioContext enters |
| Keypress          | RUNNING state. Master and ambient buses activated.  |
+-------------------+-----------------------------------------------------+
| Track Change      | Master gain ramps to 0.001 over 150ms. Audio source |
|                   | updates to next Supabase Storage URL. Audio buffers,|
|                   | and master gain ramps up to target over 200ms.      |
+-------------------+-----------------------------------------------------+
| Lo-Fi Toggle      | BiquadFilterNode cutoff frequency smoothly sweeps   |
|                   | between 20,000 Hz and 850 Hz using exponential curve|
|                   | over 280ms. No audio clicks or buffer drops.        |
+-------------------+-----------------------------------------------------+
| Mobile Background | Page visibilityState switches to 'hidden'. Audio    |
| / Screen Lock     | continues streaming via MediaSession API.           |
|                   | RainCanvas cancels requestAnimationFrame to save    |
|                   | battery and GPU resources.                          |
+-------------------+-----------------------------------------------------+
| Mobile Return /   | Page visibilityState switches to 'visible'. Canvas  |
| Screen Unlock     | render loop automatically restarts. If AudioContext |
|                   | was suspended by OS, audioCtx.resume() is invoked.  |
+-------------------+-----------------------------------------------------+
| Component Unmount | All GainNodes ramped to zero. MediaElementSource and|
| / Tab Close       | Biquad nodes disconnected. AudioContext.close() run.|
+-------------------+-----------------------------------------------------+

---

## 5. State Persistence Strategy (Client Storage)

To preserve user configurations across sessions, non-sensitive preferences are persisted in localStorage under isolated key names:

+---------------------------+---------------+---------------+---------------------------------------+
| LocalStorage Key          | Type          | Default       | Purpose                               |
+---------------------------+---------------+---------------+---------------------------------------+
| solitude:volume           | number        | 0.85          | Master output volume (0.0 to 1.0)     |
| solitude:lofi             | boolean       | false         | Lo-Fi low-pass filter active state    |
| solitude:lighting         | string        | "candle"      | Visual theme: candle/midnight/rain/void|
| solitude:ambient_rain     | number        | 0.40          | Independent rain loop volume level    |
| solitude:ambient_thunder  | number        | 0.20          | Independent thunder rumble volume     |
| solitude:ambient_vinyl    | number        | 0.30          | Independent vinyl crackle volume      |
| solitude:last_track       | number        | 1             | Last active track order (1 to 30)     |
+---------------------------+---------------+---------------+---------------------------------------+

* Persistence Rule: Playback position (currentTime) is intentionally NOT restored on fresh page loads; the application always begins with a fresh, clean playback ritual on initial entry.

---

## 6. Realtime Channel Lifecycle & Reconnection Logic

The communal presence indicator maintains an open WebSocket channel with Supabase:

[Client Mount]
       |
       v
[Join Channel: 'room:solitude-global']
       |
       +---> [Connected] ---> Track presence with { online_at: Date.now() }
       |                            |
       |                            v
       |                     [Presence Sync Event]
       |                            |
       |                            v
       |                     Recalculate Visible Count:
       |                     Count = (Connected Sockets) + CircadianOffset(t)
       |
       +---> [Socket Disconnected / Network Drop]
                    |
                    v
             [Exponential Backoff Retry]
             Attempts: 1s, 2s, 4s, 8s, 16s (Max 30s)
                    |
                    v
             [Fallback Mode]
             Display purely algorithmic circadian estimation
             until WebSocket connection restores.

---

## 7. MediaSession API (Lock Screen & Background Audio)

The system maintains active hooks into the operating system's native media notification bar:

* Lock Screen Metadata Synchronization:
  - Title: Set to active song title (e.g., Raanjhan).
  - Artist: Set to active artists (e.g., Sachet Tandon, Parampara Tandon).
  - Album: Pinned to Solitude (Midnight Sad Songs).
  - Artwork: 512x512 WebP cover image loaded from Supabase Storage.
* Hardware Media Key Dispatch:
  - play -> Dispatches playerActions.play()
  - pause -> Dispatches playerActions.pause()
  - nexttrack -> Dispatches playerActions.nextTrack()
  - previoustrack -> Dispatches playerActions.prevTrack()
  - seekto -> Dispatches playerActions.seek(details.seekTime)

---

## 8. Teardown Protocol & Memory Leak Prevention

When the page unmounts, navigates away, or the tab is closed, the following cleanup operations execute synchronously:

1. Web Audio Graph Teardown:
   export function teardownAudio(nodes: AudioNodeCollection, ctx: AudioContext) {
     nodes.sourceNode.disconnect();
     nodes.filterNode.disconnect();
     nodes.analyserNode.disconnect();
     nodes.masterGain.disconnect();
     nodes.ambientRainGain.disconnect();
     nodes.ambientThunderGain.disconnect();
     nodes.ambientVinylGain.disconnect();
     if (ctx.state !== "closed") {
       ctx.close();
     }
   }

2. Animation Frame Cancellation:
   if (animationFrameId) {
     cancelAnimationFrame(animationFrameId);
   }

3. Event Listener Detachment:
   - Global keydown listeners on window removed.
   - Global resize listeners for Canvas re-dimensioning removed.
   - visibilitychange listener detached.

4. WebSocket Channel Termination:
   - Supabase presence channel explicitly unbinds and leaves via supabase.removeChannel(channel).