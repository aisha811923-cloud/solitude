# Antigravity Task Runbook (TASK_RUNBOOK.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Step-by-step phased execution runbook. Provides copy-paste micro-prompts for guiding agentic IDEs through deterministic development milestones without context degradation.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Execution Principles for Antigravity

1. Run One Task at a Time: Do not issue combined prompts spanning multiple layers.
2. Complete Files Only: Never accept placeholder functions, partial classes, or skipped type definitions.
3. Verification Gate: Test compilation and verify TypeScript definitions before proceeding to subsequent tasks.

---

## 2. Phased Milestone Execution Sequence

### Phase 1: Foundation Scaffolding & Configuration
* Task 1.1: Project initialization with Next.js 15, React 19, Tailwind CSS v4, Lucide icons, and Framer Motion.
* Task 1.2: Environment variables (.env.local) and Supabase client configuration.

### Phase 2: Domain Contracts & Static Manifest
* Task 2.1: Implement types/contracts.ts (master TypeScript definitions).
* Task 2.2: Implement lib/constants/tracks.ts (30-song fallback manifest with titles, artists, durations, quotes).

### Phase 3: Web Audio Subsystem & Filter Routing
* Task 3.1: Singleton AudioContext provider and iOS Safari unlocker (lib/audio/audioContext.ts).
* Task 3.2: Native BiquadFilterNode manager for 850 Hz Lo-Fi muffling (lib/audio/filterNode.ts).
* Task 3.3: Perceptual volume curves and de-clicked gain transitions (lib/audio/gainCurves.ts).

### Phase 4: Ambient Audio Bus
* Task 4.1: Independent HTML5 looping stems for Rain, Thunder, and Vinyl crackle.
* Task 4.2: Soundboard state faders and routing to AudioContext.destination.

### Phase 5: Canvas 2D Rain Simulation Engine
* Task 5.1: High-performance 60 FPS HTML5 Canvas engine with 120 raindrops and 35 condensation streaks.
* Task 5.2: Wind shear vector and window-blur compositing.

### Phase 6: Player UI & Turntable Mechanics
* Task 6.1: VinylDisc component with 18s continuous rotation and 1.2s inertial slowdown.
* Task 6.2: ScrubBar slider with hover preview timestamps and HTTP 206 range seeking.
* Task 6.3: Master AudioDeck dock with play, pause, next, previous, Lo-Fi toggle, and candle switcher.

### Phase 7: Slide-Over Queue Drawer & Instant Search
* Task 7.1: Framer Motion right-sidebar slide-over drawer with backdrop blur.
* Task 7.2: In-memory fuzzy search matching title and artist with active match counter.

### Phase 8: Keyboard Shortcuts HUD & Input Isolation
* Task 8.1: Persistent bottom HUD displaying [Space], [Left], [Right], [N], [P], [Q], [/].
* Task 8.2: Global key listener with strict isInputTarget() guard isolating text fields.

### Phase 9: Realtime Presence & Circadian Engine
* Task 9.1: Supabase Realtime WebSocket presence channel (room:solitude-global).
* Task 9.2: Circadian baseline algorithm providing nocturnal presence peaks.

### Phase 10: Environmental Themes & Production Polish
* Task 10.1: Dynamic Environmental Lighting switcher (Candle, Midnight, Rainy-Dusk, Void).
* Task 10.2: MediaSession API integration for OS lock screen and Bluetooth media controls.
* Task 10.3: Production build verification and memory leak audit.

---

## 3. Micro-Prompts for Antigravity Agent Execution

### Task 1.1: Environment Scaffolding
    Initialize the Next.js 15 App Router project structure for "Solitude".
    Install dependencies: lucide-react, framer-motion, @supabase/supabase-js, clsx, tailwind-merge.
    Configure Tailwind CSS v4 in app/globals.css with dark theme defaults (#070B14) and glassmorphic utility classes.
    Ensure layout.tsx sets background to #070B14 and loads clean fonts.

### Task 2.1: Domain Type Contracts
    Create types/contracts.ts.
    Implement complete TypeScript contracts exactly as specified in CONTRACTS.d.ts:
    Include Song, Database, AudioEngineNodes, PlayerState, AmbientState, PlayerActions, AmbientActions, UIState, UIActions, LightingMode, RainDrop, CondensationDroplet, and LocalStorageSettings.
    Ensure strict mode compatibility with zero usage of 'any'.

### Task 2.2: 30-Track Manifest
    Create lib/constants/tracks.ts.
    Export PLAYLIST array containing all 30 songs from the PRD specification with exact titles, artists, durations, and poetic quotes.
    Map audio URLs to Supabase Public Storage paths:
    https://[PROJECT-ID].supabase.co/storage/v1/object/public/tracks/track-001.mp3 through track-030.mp3.
    Map cover URLs to covers/cover-001.webp through cover-030.webp.

### Task 3.1: AudioContext Singleton & Unlocker
    Create lib/audio/audioContext.ts.
    Implement getAudioContext() returning a singleton AudioContext instance.
    Implement unlockAudioContext(ctx: AudioContext) that resumes suspended state and emits a 1-sample silent buffer to satisfy iOS Safari and mobile browser autoplay constraints.

### Task 3.2: Web Audio Lo-Fi Filter Node
    Create lib/audio/filterNode.ts.
    Implement createLoFiFilter(ctx: AudioContext): BiquadFilterNode.
    Implement setLoFiMode(filter: BiquadFilterNode, active: boolean, ctx: AudioContext): void.
    When active is true: exponentially sweep frequency from 20000 Hz down to 850 Hz over 280ms, Q to 3.5.
    When active is false: exponentially sweep frequency up to 20000 Hz over 200ms, Q to 0.7.
    Always cancelScheduledValues prior to ramping.

### Task 3.3: Perceptual Gain Curves
    Create lib/audio/gainCurves.ts.
    Implement linearToLogGain(sliderValue: number): number using Math.pow(sliderValue, 2).
    Implement rampGain(gainNode: GainNode, targetValue: number, durationSeconds: number, ctx: AudioContext): void.

### Task 4.1: Master Audio Engine Hook
    Create hooks/useAudioEngine.ts.
    Wire the persistent audio graph:
    HTMLAudioElement -> MediaElementAudioSourceNode -> BiquadFilterNode -> AnalyserNode -> MasterGainNode -> destination.
    Ensure createMediaElementSource is called only once using a persistent ref.
    Support play, pause, seek, setVolume, toggleLoFi, nextTrack, and prevTrack.
    Implement 200ms crossfading between track transitions.

### Task 5.1: HTML5 Canvas 2D Rain Simulation
    Create components/canvas/RainCanvas.tsx and hooks/useRainEngine.ts.
    Implement full-screen canvas running on requestAnimationFrame at 60 FPS.
    Simulate 120 raindrops falling with wind shear angle (-1.2px/frame).
    Simulate 35 static condensation droplets on glass that streak down when weight threshold is exceeded.
    Decouple all particle coordinate updates from React state.

### Task 6.1: Master AudioDeck & Controls
    Create components/player/AudioDeck.tsx, components/player/VinylDisc.tsx, and components/player/ScrubBar.tsx.
    AudioDeck: Frosted glass dock with play/pause, skips, Lo-Fi toggle, and candle theme switcher.
    VinylDisc: 18s infinite rotation while playing, 1.2s smooth cubic-bezier deceleration on pause.
    ScrubBar: Progress line with hover timestamp bubble and click-to-seek functionality.

### Task 7.1: Slide-Over Queue & Fuzzy Search
    Create components/queue/QueueDrawer.tsx and components/queue/SearchBar.tsx.
    Slide drawer in from right edge on 'Q' press with Framer Motion spring animation.
    Implement SearchBar with real-time substring filtering on title and artist.
    Highlight active playing song with amber border and animated equalizer bars.

### Task 8.1: Keyboard Shortcuts HUD & Input Isolation
    Create components/player/KeyboardShortcutsHud.tsx and hooks/useKeyboardShortcuts.ts.
    Render bottom status pill with badges: [Space], [Left], [Right], [N], [P], [Q], [/].
    Provide visual feedback on keypress.
    Implement isInputTarget() guard: when search input is focused, typing must pass through freely without triggering playback controls.

### Task 9.1: Realtime Presence & Circadian Engine
    Create hooks/usePresence.ts and components/presence/PresenceBeacon.tsx.
    Connect to Supabase Realtime channel 'room:solitude-global'.
    Implement getCircadianBaseline(date: Date) to calculate nocturnal listener count.
    Display pulsing beacon: "[● 542 broken hearts listening with you]".

### Task 10.1: Theme Switcher & MediaSession
    Implement Dynamic Environmental Lighting in components/lighting/LightingVignette.tsx (Candle, Midnight, Rainy-Dusk, Void).
    Integrate MediaSession API in useAudioEngine to synchronize lock screen metadata and physical media keys.
    Run npm run build and verify zero TypeScript or Next.js build errors.