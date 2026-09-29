# Technical Requirements Document (TRD)

**Project Name:** Solitude (Midnight Sad Songs Sanctuary)  
**System Type:** Client-Side Single Page Application (SPA) / Progressive Web App (PWA) with Edge Media Streaming  
**Core Framework:** Next.js 15 (App Router, Client-Side Runtime), React 19, TypeScript (Strict Mode)  
**Styling & UI:** Tailwind CSS v4, Lucide React, Framer Motion  
**Audio Pipeline:** Native Web Audio API + HTML5 Audio MediaElementSource  
**Database & Realtime:** Supabase (PostgreSQL 15 + Realtime Presence WebSockets)  
**Media Storage:** Supabase Storage (Public Buckets: tracks, covers, ambient)  
**Document Version:** 2.0.0 (Updated for 30 Uncompressed Tracks & Unified Supabase Architecture)  
**Target Environment:** Google Antigravity IDE  

---

## 1. System Architecture Overview

The system operates on a unified architecture where Next.js 15 serves as the interactive presentation layer, while Supabase provides database persistence, file storage, and real-time WebSocket presence.

+--------------------------------------------------------+
|                   Next.js Client                       |
|         (React 19 / Web Audio API Engine)              |
+---------------------------+----------------------------+
                            |
       HTTP Range 206       |  PostgreSQL / WSS
       Media Streaming      |  Metadata & Realtime
                            v
     +--------------------------------------------------+
     |                     Supabase                     |
     |  - Storage: 'tracks' (30 Uncompressed MP3s)      |
     |  - Storage: 'covers' & 'ambient' Stems           |
     |  - Database: songs Table (30 Curated Rows)       |
     |  - Realtime: 'room:solitude-global' Presence     |
     +--------------------------------------------------+

### Architectural Principles:
1. Single-Backend Simplicity: All media binaries, static assets, relational schemas, and WebSocket channels reside within a single Supabase project, removing third-party CDN configuration and credit card hurdles.
2. Stable Audio Graph: Native Web Audio nodes are retained in singletons and useRef instances outside the component re-render lifecycle to prevent buffer drops, memory leaks, and playback interruption.
3. Hardware-Accelerated Render Loops: The rain canvas simulation and time-scrub bar operate via requestAnimationFrame, fully decoupled from React's reconciliation tree.

---

## 2. Web Audio API Pipeline & Node Graph

Audio execution is divided into two discrete processing branches: the Master Music Bus (which passes through the interactive Lo-Fi filter) and the Ambient Soundboard Bus (unfiltered looping background stems).

### 2.1 Audio Node Graph Architecture

[Master HTML5 <audio> Element]
             |
             v
[MediaElementAudioSourceNode]
             |
             v
[BiquadFilterNode]  <--- (Controlled by Lo-Fi Muffled Toggle)
  - Type: Lowpass (850 Hz) or Allpass (Bypass)
  - Q: 3.5
             |
             v
[AnalyserNode]
  - Fast Fourier Transform (FFT) for reactive visualizers
             |
             v
     [Master GainNode]  <--- (Volume curve & 200ms crossfade)
             |
             v
[AudioContext.destination] (Headphones / Speakers)

[Ambient Stem: Rain]    ---> [GainNode (0.0 - 1.0)] ---+
[Ambient Stem: Thunder] ---> [GainNode (0.0 - 1.0)] ---+---> [AudioContext.destination]
[Ambient Stem: Vinyl]   ---> [GainNode (0.0 - 1.0)] ---+

### 2.2 Low-Pass Filter (Lo-Fi "Another Room" Mode)
The Lo-Fi toggle utilizes an active BiquadFilterNode:
* Bypass State (Default):
  - filterNode.type = "allpass"
  - Frequency response is flat, introducing zero coloration or delay.
* Lo-Fi Active State:
  - filterNode.type = "lowpass"
  - Cutoff Frequency: 850 Hz (preserves vocal fundamental frequencies and bass warmth while removing harsh treble).
  - Quality Factor (Q): 3.5 (introduces a slight acoustic resonance at the boundary frequency, mimicking acoustic transmission through walls).
  - Transition Function: filterNode.frequency.exponentialRampToValueAtTime(850, audioCtx.currentTime + 0.25) to eliminate digital stepping artifacts.

### 2.3 Volume Curves & Crossfading
* Perceptual Attenuation: Linear slider inputs (0.0 to 1.0) are mapped logarithmically using:
  gainNode.gain.value = Math.pow(sliderValue, 2);
* Automated Track Crossfade:
  - When skipping or transitioning tracks, the active track's gain ramps down to 0.001 over 200ms via linearRampToValueAtTime.
  - The incoming track starts muted and ramps up to the target master volume over 200ms.

---

## 3. Supabase Storage Architecture

### 3.1 Bucket Hierarchy & Allocation
Three public storage buckets handle binary assets without authentication walls:

supabase-storage/
|-- tracks/             # 30 uncompressed 320 kbps MP3 files (~225 MB total)
|   |-- track-001.mp3
|   |-- track-002.mp3
|   `-- ... track-030.mp3
|-- covers/             # WebP album art thumbnails (~15 MB total)
|   |-- cover-001.webp
|   `-- ... cover-030.webp
`-- ambient/            # Seamless looping background audio (~20 MB total)
    |-- rain.mp3
    |-- thunder.mp3
    `-- vinyl.mp3

* Storage Overhead: ~260 MB total asset footprint, consuming ~26% of Supabase's 1 GB free allocation.
* Bandwidth Budget: ~568 full song plays per month under the 5 GB free egress tier.

### 3.2 Public Access & CORS Directives
To allow the Web Audio API to process raw audio bytes without browser security blocks, buckets must have public read access enabled and open CORS headers:

[CORS Configuration Directive]
[
  {
    "Origin": ["*"],
    "Method": ["GET", "HEAD"],
    "ResponseHeader": ["Content-Type", "Range", "Accept-Ranges", "Content-Range", "Content-Length"],
    "MaxAgeSeconds": 86400
  }
]

### 3.3 HTTP 206 Partial Content (Range Seeking)
Supabase Storage natively supports HTTP Range request headers, allowing the browser to fetch discrete chunks of audio files when scrubbing via the slider or keyboard shortcuts.

---

## 4. Supabase Database Schema & Indexing

### 4.1 Relational Schema (songs Table)

-- PostgreSQL Schema for songs
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_order INT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration_seconds INT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  shayari_quote TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexing for sequential playback and real-time search
CREATE INDEX idx_songs_track_order ON public.songs(track_order);
CREATE INDEX idx_songs_search ON public.songs USING GIN (to_tsvector('english', title || ' ' || artist));

-- Enable Public Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON public.songs FOR SELECT USING (true);

### 4.2 Query Execution Strategy
The client fetches the full 30-song manifest once on initial page load (SELECT * FROM public.songs ORDER BY track_order ASC). Because the dataset is small (~12 KB total JSON payload), all subsequent searches and queue operations execute instantly in client-side memory.

---

## 5. Communal Nocturnal Presence Engine

### 5.1 Realtime WebSocket Integration
The client connects to a global presence room:
* Channel: room:solitude-global
* Events: sync, join, leave

### 5.2 Circadian Baseline Fluctuation Algorithm
To maintain an emotional late-night atmosphere, the visible counter combines true connected clients with a simulated circadian baseline:

Display Count = Supabase Presence Sockets + Circadian Baseline(t) +/- Jitter

// Circadian Baseline Implementation
export function getCircadianBaseline(date: Date = new Date()): number {
  const hour = date.getHours() + date.getMinutes() / 60;
  
  // Peak presence between 11:30 PM (23.5) and 4:00 AM (4.0)
  if (hour >= 23 || hour < 4) {
    return Math.floor(450 + Math.sin((hour - 23) * 0.8) * 120);
  }
  // Tapered daytime presence
  return Math.floor(120 + Math.sin(hour * 0.25) * 60);
}

A micro-jitter function alters the counter by +/- 1 to +/- 3 every 12 seconds to reflect continuous listener movement.

---

## 6. HTML5 Canvas 2D Rain Simulation Engine

The rain visualizer runs behind all UI layers on a dedicated <canvas> element.

### 6.1 Particle System Architecture
* Raindrop Structure (Drop):
  - Pool size: 120 active drops.
  - Physics: y velocity between 10 px/frame and 16 px/frame; x velocity constant at -1.2 px/frame (wind shear).
  - Color: rgba(180, 210, 240, 0.25).
* Glass Condensation Structure (Streak):
  - Pool size: 35 static droplets on the glass surface.
  - Behavior: Droplets accumulate opacity; when weight threshold is exceeded, they slip downward and leave a decaying path trail.

### 6.2 Render Loop Mechanics

// Dedicated requestAnimationFrame Render Loop
function renderFrame() {
  ctx.clearRect(0, 0, width, height);
  updateAndDrawRaindrops(ctx);
  updateAndDrawCondensation(ctx);
  animationFrameId = requestAnimationFrame(renderFrame);
}

* Performance Rule: The render loop must never touch React state (useState) to prevent triggering component re-renders.

---

## 7. Keyboard Shortcuts Engine & Input Isolation

Global keyboard shortcuts provide immediate tactical control while safeguarding search input focus.

### 7.1 Dispatch Matrix

| Key | Action | Guard Condition | Behavior |
| :--- | :--- | :--- | :--- |
| Space | Play / Pause Toggle | !isInputFocused | e.preventDefault(), toggles active track state |
| ArrowLeft | Seek -5 Seconds | !isInputFocused | e.preventDefault(), seeks audio element backward |
| ArrowRight | Seek +5 Seconds | !isInputFocused | e.preventDefault(), seeks audio element forward |
| KeyN | Next Track | !isInputFocused | Advances to next track index in queue |
| KeyP | Previous Track | !isInputFocused | Returns to previous track index in queue |
| KeyQ | Toggle Queue Drawer | !isInputFocused | Slides track drawer in/out |
| Slash (/) | Focus Search Input | !isInputFocused | e.preventDefault(), focuses text field |
| Escape | Blur Search / Close Drawer | isInputFocused or isQueueOpen | Restores global keyboard shortcuts |

### 7.2 Input Target Guard

export function isInputTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

---

## 8. Dynamic Environmental Lighting Engine

Atmospheric visual themes update dynamically using CSS custom variables and backdrop filters.

### 8.1 Mode Definitions

| Mode Key | Name | Visual Treatment |
| :--- | :--- | :--- |
| candle | Warm Candlelight (Default) | Radial amber dock glow (rgba(245, 158, 11, 0.22)), animated candle flame |
| midnight | Midnight Solitude | Deep indigo-navy gradient (#070B14 to #0B1329), muted cold highlights |
| rainy-dusk | Rainy Cold Blue | Slate-cyan overlay (rgba(14, 116, 144, 0.18)), desaturated UI background |
| void | The Void | Blackout tint (#020408 at 90%), candle flame extinguished |

---

## 9. Mobile Safari & AudioContext Autoplay Unlocking

To comply with browser autoplay restrictions on iOS Safari and modern Chromium engines:

1. The page initializes with AudioContext in suspended mode.
2. The initial user click anywhere on the viewport triggers the unlocking routine:

export async function unlockAudioContext(ctx: AudioContext): Promise<void> {
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  // Emit a silent 1-sample buffer to satisfy mobile hardware audio routing
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
}

---

## 10. Media Session API Integration

Connects the active playback state to OS-level lock screen controls and Bluetooth media keys:

export function syncMediaSession(track: Song, actions: PlayerActions) {
  if (!("mediaSession" in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: "Solitude (Midnight Sanctuary)",
    artwork: [{ src: track.cover_url, sizes: "512x512", type: "image/webp" }]
  });

  navigator.mediaSession.setActionHandler("play", () => actions.play());
  navigator.mediaSession.setActionHandler("pause", () => actions.pause());
  navigator.mediaSession.setActionHandler("previoustrack", () => actions.prevTrack());
  navigator.mediaSession.setActionHandler("nexttrack", () => actions.nextTrack());
  navigator.mediaSession.setActionHandler("seekto", (details) => {
    if (details.seekTime !== undefined) actions.seek(details.seekTime);
  });
}

---

## 11. Performance Budgets & Technical Targets

| Parameter | Performance Ceiling | Verification Technique |
| :--- | :--- | :--- |
| First Contentful Paint (FCP) | <= 0.8s | Next.js Server Components base shell |
| Time-to-First-Audio (TTFA) | <= 300ms | Byte-range partial caching via Supabase Storage |
| Rain Simulation FPS | 60 FPS +/- 2 | Delta time calculation in requestAnimationFrame |
| Memory Footprint | <= 65 MB | Explicit node teardown via AudioNode.disconnect() |
| Total Production JS Bundle | <= 140 KB | Dynamic code splitting on drawers and settings |