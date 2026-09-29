# Solitude (Midnight Sad Songs Sanctuary) - Master Architecture & Production Guide (README.md)

Project Name: Solitude
Tagline: An intimate midnight music sanctuary for melancholic tracks, authentic Lo-Fi acoustic filtering, and communal nocturnal presence.
Framework: Next.js 15 (App Router), React 19 Client Runtime, TypeScript (Strict Mode)
Backend: Supabase (PostgreSQL 15, Public Storage, Realtime WebSockets)
Audio Engine: Native Web Audio API (Singleton AudioContext, BiquadFilterNode, AnalyserNode, GainNode Staging)
Styling: Tailwind CSS v4, Framer Motion, Lucide Icons

---

## 1. Project Overview & Aesthetic Core

Solitude is an audio-first, browser-based musical retreat engineered specifically for late-night emotional listening.

Key Technical Highlights:
* 30 Curated Sad Songs: Full-fidelity uncompressed 320 kbps streaming via Supabase Storage with HTTP 206 byte-range seeking.
* Hardware-Accurate Lo-Fi Mode: Real-time 2nd-order Butterworth low-pass filter (850 Hz cutoff, Q = 3.5) simulating music playing from "another room".
* 60 FPS Rain Simulation: Multi-layer HTML5 Canvas 2D engine modeling 120 atmospheric raindrops and 35 sliding condensation streaks.
* Communal Nocturnal Presence: Real-time WebSocket connection to Supabase augmented with a circadian mathematical model reflecting midnight peak listening.
* Tactile Keyboard Controls: Physical Hi-Fi keybindings with strict DOM target isolation so typing in search never triggers playback commands.
* Glassmorphic Visuals: Nocturnal color palette (#070B14) paired with warm candlelight amber highlights and four environmental lighting themes.

---

## 2. Master Directory Architecture

    solitude/
    |-- .cursorrules                # Strict Antigravity IDE coding guardrails
    |-- .env.local.example          # Environment configuration template
    |-- next.config.js              # Next.js 15 CSP headers & image domains
    |-- package.json                # Dependencies and build scripts
    |-- tsconfig.json               # TypeScript strict configuration
    |-- public/
    |   |-- favicon.ico
    |   |-- icon.png                # 512x512 PWA application icon
    |   `-- manifest.webmanifest    # Progressive Web App manifest
    |-- app/
    |   |-- globals.css             # Tailwind v4 directives & glassmorphic utility classes
    |   |-- layout.tsx              # Root server shell & typography setup
    |   `-- page.tsx                # Client sanctuary viewport orchestrator
    |-- components/
    |   |-- ambient/
    |   |   |-- AmbientSoundboard.tsx # 3-channel soundboard fader popover
    |   |   `-- SoundboardFader.tsx   # Individual audio fader track with dB peak meter
    |   |-- canvas/
    |   |   |-- RainCanvas.tsx        # 60 FPS Canvas rain & condensation element
    |   |   `-- useRainEngine.ts      # Particle physics & streak decay render loop
    |   |-- lighting/
    |   |   |-- CandleGraphic.tsx     # Animated SVG candle flame with flicker keyframes
    |   |   `-- LightingVignette.tsx  # Dynamic radial gradient environmental overlay
    |   |-- player/
    |   |   |-- AudioDeck.tsx         # Master glassmorphic dock with playback cluster
    |   |   |-- KeyboardShortcutsHud.tsx # Bottom tactile keycap visual status pill
    |   |   |-- LoFiToggle.tsx        # Amber vacuum-tube toggle button
    |   |   |-- ScrubBar.tsx          # Timeline slider with hover timestamp preview
    |   |   |-- TrackMetadata.tsx     # Title, artist, and poetic shayari card
    |   |   `-- VinylDisc.tsx         # 18s rotating turntable platter with inertial stop
    |   |-- presence/
    |   |   `-- PresenceBeacon.tsx    # Live communal listener indicator
    |   `-- queue/
    |       |-- QueueDrawer.tsx       # Slide-over right sidebar drawer
    |       |-- SearchBar.tsx         # Real-time substring filter input
    |       `-- TrackItem.tsx         # Track row with animated equalizer bars
    |-- hooks/
    |   |-- useAudioEngine.ts         # Master Web Audio API graph coordinator
    |   |-- useKeyboardShortcuts.ts   # Window keydown listener with input isolation
    |   |-- usePresence.ts            # Supabase Realtime WebSocket presence subscriber
    |   `-- useLocalStorage.ts        # Persisted client volume and lighting tokens
    |-- lib/
    |   |-- audio/
    |   |   |-- audioContext.ts       # Singleton AudioContext & mobile unlock routine
    |   |   |-- filterNode.ts         # Biquad low-pass filter ramps & bypass switching
    |   |   `-- gainCurves.ts         # Logarithmic perceptual gain conversion curves
    |   |-- constants/
    |   |   `-- tracks.ts             # 30-song fallback catalogue manifest
    |   |-- supabase/
    |   |   |-- client.ts             # Supabase client singleton
    |   |   |-- queries.ts            # PostgreSQL song retrieval queries
    |   |   `-- storage.ts            # Storage public URL resolvers
    |   `-- utils/
    |       |-- formatters.ts         # Timestamp (MM:SS) string formatters
    |       `-- sanitize.ts           # Input query sanitization
    `-- types/
        `-- contracts.ts              # Core TypeScript domain models & interfaces

---

## 3. Web Audio Dual-Bus Routing Graph

    [Music Track Stream] (Supabase Storage: /tracks/track-XXX.mp3)
           |
           v
    [HTML5 Audio Element] (crossOrigin: "anonymous")
           |
           v
    [MediaElementAudioSourceNode] (Single persistent instance)
           |
           v
    [BiquadFilterNode] (Lo-Fi Lowpass Filter: 850 Hz, Q = 3.5)
           |
           v
    [AnalyserNode] (64-point FFT real-time equalizer data)
           |
           v
    [Master GainNode] (Logarithmic volume attenuation + 200ms crossfade)
           |
           +---------------------------------------------+
           |                                             |
           v                                             v
    [Ambient Soundboard Bus]                     [AudioContext.destination]
    - Rain Stem    -> [RainGainNode]                     ^
    - Thunder Stem -> [ThunderGainNode] -----------------+
    - Vinyl Stem   -> [VinylGainNode]   -----------------+
    (Bypasses Lo-Fi Filter to keep rain crisp outside)

---

## 4. Setup & Local Development Runbook

### 4.1 Prerequisites
* Node.js 18.18+ or Node.js 20+
* npm or pnpm
* Supabase Account (Free Tier supported)

### 4.2 Installation Commands

    # 1. Clone repository
    git clone https://github.com/your-username/solitude.git
    cd solitude

    # 2. Install dependencies
    npm install

    # 3. Configure environment variables
    cp .env.local.example .env.local

### 4.3 Supabase Database & Storage Initialization
1. Open your Supabase Dashboard -> SQL Editor.
2. Execute the entire contents of SEED_DATA.sql to create the `songs` table, configure Row Level Security (RLS), and seed the 30 tracks.
3. In Storage, create three public buckets: `tracks`, `covers`, and `ambient`.
4. Apply the CORS configuration via Supabase CLI:
   supabase storage cors add cors.json

### 4.4 Running Development Server

    npm run dev

Open http://localhost:3000 in your browser. Click anywhere on the viewport to unlock Web Audio API hardware and enter the sanctuary.

---

## 5. Keyboard Navigation Reference

| Key Combination | Action Dispatched |
| :--- | :--- |
| Space | Master Play / Pause toggle with 50ms gain ramp |
| Left Arrow (<-) | Seek backward 5 seconds |
| Right Arrow (->)| Seek forward 5 seconds |
| N | Skip to next track with 150ms crossfade |
| P | Skip to previous track with 150ms crossfade |
| L | Toggle Lo-Fi muffled acoustics ("Another Room") |
| Q | Toggle slide-over queue drawer |
| / (Slash) | Open queue drawer and focus instant track search |
| Escape | Blur search input / dismiss slide-over drawer |
| M | Mute / Unmute master audio stream |

---

## 6. Production Deployment (Vercel)

Solitude is optimized for deployment on Vercel:

    # Authenticate and deploy
    npm install -g vercel
    vercel
    vercel --prod

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel Project Settings under Environment Variables.