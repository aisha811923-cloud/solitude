# UI Flow & Interaction Specification (UI_FLOW.md)

**Project Name:** Solitude (Midnight Sad Songs Sanctuary)  
**Document Purpose:** Exhaustive interaction hierarchy, event-state transition matrices, micro-interactions, and visual states.  
**Document Version:** 2.0.0  
**Target Environment:** Google Antigravity IDE  

---

## 1. Global Viewport Layout & Visual Hierarchy

The application consists of a single persistent viewport (100vw, 100vh / 100dvh) structured in four depth layers (z-index stack):

+--------------------------------------------------------------------------+
| Layer 4: [Modals & Overlay Drawers] (z-50)                               |
|   - Slide-over Queue Drawer (Right-docked)                               |
|   - Ambient Soundboard Faders Popover (Bottom-left docked)               |
+--------------------------------------------------------------------------+
| Layer 3: [Foreground Interactive Chrome] (z-30)                          |
|   - Top Left: Communal Nocturnal Presence Pill                           |
|   - Top Right: GitHub Link / Fullscreen Toggle                           |
|   - Center: Vinyl Turntable Disc, Track Details & Shayari Mood Quote     |
|   - Bottom Center: Master Glassmorphic Player Deck Dock                  |
|   - Bottom Sub-Dock: Keyboard Shortcuts Keycap HUD                       |
+--------------------------------------------------------------------------+
| Layer 2: [Atmospheric Dynamic Overlays] (z-20, pointer-events-none)      |
|   - Dynamic Environmental Lighting Vignette (Radial gradients)           |
|   - CRT Scanline / Noise Shader Texture                                  |
+--------------------------------------------------------------------------+
| Layer 1: [HTML5 2D Canvas Rain Engine] (z-10, background canvas)         |
|   - Fullscreen 60 FPS Rain Drops & Condensation Streaks                  |
|   - Blurred Midnight Cityscape Bokeh Backdrop                            |
+--------------------------------------------------------------------------+

---

## 2. Component Wireframe & Structural Placement

+--------------------------------------------------------------------------+
|  [● 542 listening with you]                             [ [⛶] [GitHub] ] |
|                                                                          |
|                                                                          |
|                              +-------------+                             |
|                              |             |                             |
|                              |   [VINYL]   |                             |
|                              |  (Rotating) |                             |
|                              |             |                             |
|                              +-------------+                             |
|                                                                          |
|                              "Raanjhan"                                  |
|                     Sachet Tandon, Parampara Tandon                      |
|                                                                          |
|            "Raanjhan dhoondhan main chali, khud kho gayi..."             |
|                                                                          |
|                        01:24 ---------●-------- 04:01                    |
|                                                                          |
|     +--------------------------------------------------------------+     |
|     |  [🌧 Ambient]  [⏮]  [ ▶ / ❚❚ ]  [⏭]  [Lo-Fi]  [🕯️ Glow]  [☰ Queue] |     |
|     +--------------------------------------------------------------+     |
|                                                                          |
|          [Space] Play   [←][→] Seek 5s   [N][P] Skip   [Q] Queue   [/] Find  |
+--------------------------------------------------------------------------+

---

## 3. Exhaustive Click & Gesture Interaction Flow

### 3.1 Initial App Load & First-Gesture Audio Unlock
* Initial State:
  - Viewport loads with Canvas rain falling at 60 FPS.
  - AudioContext is in suspended state (browser autoplay compliance).
  - Center deck displays track #1 metadata with a pulsing translucent button: [ Enter Sanctuary ].
* Action: User clicks anywhere or hits Space.
  - unlockAudioContext() executes: resumes Web Audio context and fires silent buffer.
  - Playback starts immediately on Track 001 (Raanjhan).
  - [ Enter Sanctuary ] fades out over 300ms (opacity: 0, pointer-events: none).
  - Vinyl begins rotating clockwise (18s infinite linear loop).

### 3.2 Master Play / Pause Toggle
* Trigger: Click Center Play/Pause button OR press Space.
* Transition:
  - When Playing -> Pausing:
    * Audio master gain ramps to 0 over 50ms to prevent click artifacts.
    * Audio pauses.
    * Disc rotation slows smoothly over 1.2s using cubic-bezier(0.25, 1, 0.5, 1).
    * Button icon transitions from Pause to Play (Framer motion smooth scale switch).
    * Bottom HUD [Space] badge illuminates amber for 150ms.
  - When Paused -> Playing:
    * Audio resumes.
    * Audio master gain ramps to selected volume over 50ms.
    * Disc resumes 18s rotation from its exact paused angle.
    * Button icon transitions from Play to Pause.

### 3.3 Next (KeyN) & Previous (KeyP) Track Transitions
* Trigger: Click [⏮] / [⏭] buttons OR press N / P.
* Sequence:
  1. Active track GainNode executes linearRampToValueAtTime(0.001, now + 0.15).
  2. Active track index updates (currentIndex + 1 or currentIndex - 1). If at index 29, loops to 0.
  3. Track metadata, duration, album art, and poetic quote animate out (translateY(-8px), opacity: 0, 120ms).
  4. Incoming track audio begins buffering via Supabase Storage URL.
  5. New metadata slides in (translateY(0), opacity: 1, 180ms).
  6. Incoming track GainNode executes linearRampToValueAtTime(targetGain, now + 0.2).
  7. MediaSession metadata updates on host operating system.

### 3.4 Scrub Bar (Timeline Slider) Interactions
* Elements: Track line (h-1.5 bg-white/10), buffer fill (bg-white/20), played fill (bg-amber-400/80), scrub thumb (w-3.5 h-3.5 rounded-full bg-amber-400).
* Hover Interaction:
  - Hovering across the scrub bar calculates mouse X position relative to track width.
  - A floating glass tooltip appears directly above cursor: MM:SS preview time.
  - Scrub thumb scales from scale-0 to scale-100 (150ms spring).
* Click / Drag Interaction:
  - Clicking any point on the bar updates audio element currentTime instantaneously.
  - Dragging updates audio position continuously using requestAnimationFrame.
  - Audio smoothly plays chunks via HTTP 206 range requests without playback stall.

### 3.5 Lo-Fi Muffled Toggle ("Another Room" Mode)
* Trigger: Click [Lo-Fi] button on dock.
* Transition:
  - Disabled -> Active:
    * Web Audio BiquadFilterNode switches type to "lowpass".
    * Frequency cutoff ramps from 20,000 Hz down to 850 Hz over 280ms (exponentialRampToValueAtTime).
    * Filter resonance Q ramps to 3.5.
    * Button visual changes: Background shifts to bg-amber-500/20, border switches to border-amber-400/50, text switches to text-amber-300, and a soft amber glow (box-shadow: 0 0 16px rgba(245, 158, 11, 0.4)) activates.
    * A subtle low-frequency room impulse response activates.
  - Active -> Disabled:
    * Frequency cutoff ramps from 850 Hz up to 20,000 Hz over 200ms.
    * Filter resets to flat bypass.
    * Button reverts to neutral frosted glass styling.

### 3.6 Dynamic Environmental Lighting (Candle Switcher)
* Trigger: Click [🕯️ Glow] icon button on master dock.
* Cyclic States:
  1. candle (Default):
     * Amber radial gradient behind deck: radial-gradient(ellipse at bottom, rgba(245, 158, 11, 0.22) 0%, transparent 70%).
     * Animated CSS candle flicker running on dock badge.
  2. midnight:
     * Global tint shifts to deep indigo (#070B14 to #0B1329, 500ms transition).
     * Radial glow shifts to ice-cyan (rgba(56, 189, 248, 0.12)).
  3. rainy-dusk:
     * Viewport saturation drops to 80%.
     * Heavy slate-blue gradient overlay (rgba(14, 116, 144, 0.18)).
     * Rain canvas drop count increases by 30%.
  4. void:
     * Candle flame element triggers 250ms extinguish smoke puff.
     * All non-essential UI fades to 20% opacity.
     * Background drops to #020408 with minimal vignette.

### 3.7 Ambient Multi-Channel Soundboard Popover
* Trigger: Click [🌧 Ambient] button on bottom-left dock.
* Popover Behavior:
  - Frosted glass card pops up above dock (origin-bottom-left, spring scale 0.95 -> 1.0, 180ms).
  - Contains 3 horizontal fader rows:
    1. Rain on Glass (Master loop)
    2. Distant Thunder (Periodic low rumble)
    3. Vinyl Crackle (Needle noise)
  - Each row includes: Toggle mute icon, channel label, horizontal volume slider (0% to 100%), and active dB green/amber peak meter.
  - Closing popover: Click outside or click [🌧 Ambient] button again. Ambient audio continues looping uninterrupted.

---

## 4. Slide-Over Queue Drawer & Instant Search Engine

+--------------------------------------------------+
| QUEUE (30 Melancholic Tracks)                [✕] |
|                                                  |
|  [ 🔍 Search title or artist... (Press '/')    ] |
|  Showing 30 of 30 tracks                         |
+--------------------------------------------------+
| [NOW PLAYING]                                    |
| +----+  01. Raanjhan                      [|||]  |
| |IMG |  Sachet Tandon, Parampara Tandon   04:01  |
| +----+                                           |
+--------------------------------------------------+
| UP NEXT                                          |
|                                                  |
| +----+  02. Finding Her (Slowed + Reverb)        |
| |IMG |  Kushagra, Vanshika Kashyap        03:53  |
| +----+                                           |
|                                                  |
| +----+  03. Saiyaara                             |
| |IMG |  Ek Tha Tiger / Saiyaara           06:11  |
| +----+                                           |
|                                                  |
| +----+  04. Sahiba                               |
| |IMG |  Stebin Ben, Jasleen Royal         03:11  |
| +----+                                           |
|  ... (scrollable list: 30 tracks total)          |
+--------------------------------------------------+

### 4.1 Drawer Opening & Closing Mechanics
* Trigger: Press Q OR click [☰ Queue] dock button.
* Animation:
  - Backdrop overlay fades in (bg-black/40, backdrop-blur sm, 200ms).
  - Right panel (w-[380px] desktop / w-full mobile) slides in via Framer Motion:
    * initial={{ x: "100%" }}
    * animate={{ x: 0 }}
    * exit={{ x: "100%" }}
    * transition={{ type: "spring", damping: 28, stiffness: 300 }}
* Dismissal: Press Escape, press Q, click [✕] button, or click backdrop overlay.

### 4.2 Instant Search Filtering Flow
* Trigger: Press / key on keyboard OR click input field.
* Action:
  - If queue drawer is closed, pressing / automatically opens drawer AND focuses search input.
  - Search input border glows amber (ring-1 ring-amber-400/50).
  - Global hotkeys (Space, N, P, Q) are immediately neutralized by input guard.
* Search Execution:
  - Real-time client-side filter against songs array in memory.
  - Matches case-insensitive substrings in both title and artist.
  - Results update instantly with 0ms latency.
  - Displays match counter: "Showing X of 30 tracks".
  - If no results found, displays empty state: "No sad songs match your query in this quiet hour."
* Exiting Search:
  - Pressing Escape while input is focused clears input text, blurs the field, and re-engages global hotkeys without closing the drawer.
  - Pressing Escape a second time closes the drawer.

### 4.3 Track Selection from Drawer
* Action: Click any song row in queue.
* Transition:
  - Clicked song immediately becomes active.
  - Equalizer visualizer bars animate on that row.
  - Main deck crossfades audio into selected track over 200ms.
  - Drawer automatically slides closed on mobile (remains open on desktop until dismissed).

---

## 5. Keyboard Shortcuts HUD Matrix & Visual Feedback

Positioned permanently at bottom-4 centered:

| Key Binding | Action Dispatched | Visual Keycap Reaction in HUD |
| :--- | :--- | :--- |
| Space | Play / Pause Toggle | [Space] badge lights up bg-amber-400 text-black for 150ms |
| ArrowLeft | Seek -5 Seconds | [←] badge lights up amber, triggers -5s bubble |
| ArrowRight | Seek +5 Seconds | [→] badge lights up amber, triggers +5s bubble |
| KeyN | Next Track | [N] badge flashes amber |
| KeyP | Previous Track | [P] badge flashes amber |
| KeyQ | Toggle Queue Drawer | [Q] badge toggles permanent active state while drawer is open |
| Slash (/) | Focus Search Input | [/] badge flashes amber |
| Escape | Blur Search / Close Drawer | Dismisses active states |

### 5.1 Strict Input Isolation Guard Logic

// Disables playback shortcuts while user is typing in search
export function handleGlobalKeyDown(e: KeyboardEvent, state: UIState, actions: UIActions) {
  const isInput = isInputTarget(e);

  if (e.key === "Escape") {
    if (isInput) {
      (e.target as HTMLElement).blur();
      return;
    }
    if (state.isQueueOpen) {
      actions.setQueueOpen(false);
      return;
    }
  }

  if (isInput) {
    // Let typing pass through naturally; do not trigger player controls
    return;
  }

  switch (e.code) {
    case "Space":
      e.preventDefault();
      actions.togglePlay();
      break;
    case "ArrowLeft":
      e.preventDefault();
      actions.seekRelative(-5);
      break;
    case "ArrowRight":
      e.preventDefault();
      actions.seekRelative(5);
      break;
    case "KeyN":
      actions.nextTrack();
      break;
    case "KeyP":
      actions.prevTrack();
      break;
    case "KeyQ":
      actions.toggleQueue();
      break;
    case "Slash":
      e.preventDefault();
      actions.openAndFocusSearch();
      break;
  }
}

---

## 6. Mobile & Tablet Responsive Adaptations

| Screen Size | Master Dock Layout | Queue Drawer | HUD Keycaps |
| :--- | :--- | :--- | :--- |
| Desktop (> 1024px) | Full horizontal glass dock (w-[640px]) | Right sidebar drawer (380px) | Visible at bottom center |
| Tablet (768px - 1024px) | Compact glass dock (w-[540px]) | Right sidebar drawer (340px) | Visible at bottom center |
| Mobile (< 768px) | Bottom edge-to-edge floating sheet | Fullscreen overlay sheet (100%) | Hidden (replaced with touch icons) |

### 6.1 Mobile Touch Gestures
* Swipe Left / Right across Vinyl Center: Skips to next (KeyN) or previous (KeyP) track.
* Swipe Down on Queue Drawer Header: Dismisses drawer smoothly to bottom edge.
* Double Tap Center: Toggles Play/Pause.

---

## 7. Micro-Interactions & Motion Timing Specifications

All visual transitions adhere to these motion tokens:

* Spring Damping: damping: 26, stiffness: 280 (Tactile, weighted, non-bouncy feel).
* Crossfade Ease: cubic-bezier(0.4, 0.0, 0.2, 1) (Standard smooth material curve).
* Vinyl Deceleration: cubic-bezier(0.25, 1, 0.5, 1) over 1200ms (Simulates physical turntable motor drag).
* Glassmorphic Surface Blur: backdrop-filter: blur(16px) saturate(180%).
* Border Highlights: border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)].