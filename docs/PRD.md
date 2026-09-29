# Product Requirements Document (PRD)

**Project Name:** Solitude (Midnight Sad Songs Sanctuary)  
**Target Platform:** Modern Web (Desktop-first with responsive tablet/mobile layout), Progressive Web App (PWA)  
**Core Technologies:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Web Audio API, Supabase (Database, Storage & Realtime)  
**Document Version:** 2.0.0 (Updated for 30 Uncompressed Tracks & Unified Supabase Architecture)  
**Target Environment:** Google Antigravity IDE  

---

## 1. Executive Summary & Vision

### 1.1 Problem Statement
Mainstream commercial music streaming applications (Spotify, Apple Music, YouTube Music) are engineered for rapid algorithmic switching, social sharing, and high-energy interaction. For someone experiencing midnight solitude, heartbreak, grief, or deep emotional reflection between 11:00 PM and 5:00 AM, existing platforms are overly bright, distracting, and cold. There is no dedicated, minimalist, tactile sanctuary designed specifically to validate and hold space for sad, alone souls.

### 1.2 Solution & Product Vision
Solitude is an atmospheric, dark-mode web audio player designed specifically for nocturnal listeners. Inspired by tactile retro-hardware sensibilities, frosted glassmorphism, dynamic environmental lighting, continuous window rain simulation, and a carefully curated 30-track catalogue of iconic sad Hindi and lo-fi melodies[cite: 7], Solitude transforms listening into an intimate midnight ritual.

Crucially, Solitude counters the despair of isolation with subtle communal presence: an active counter ("542 broken hearts listening with you") reminding the listener that across cities and bedrooms, others are sharing the same quiet midnight mood.

---

## 2. Target Audience & Behavioral Scenarios

### 2.1 User Personas
* **The Nocturnal Griever (18–30):** Listens with headphones late at night, processing heartbreak or loneliness, seeking catharsis through familiar, deeply melancholic melodies.
* **The Tactile Retro Enthusiast:** Appreciates tactile, hardware-style interactions: flipping physical-style switches, watching a flickering flame, listening to needle surface noise, and using quick physical keyboard hotkeys.
* **The Late-Night Creative / Thinker:** Keeps low-lit, non-intrusive sad acoustics running in the background while journaling, writing code, or watching the rain outside.

### 2.2 Core User Journey
1. **Sanctuary Entrance:** The user lands on the website. The screen displays a dark, rain-streaked window overlooking distant midnight city bokeh. A single click initiates playback and unlocks the browser Web Audio context.
2. **Environment Tuning:** The user customizes their atmosphere: toggling rain intensity, clicking the candle icon to switch between warm amber candlelight and deep cold midnight blue, or flipping the Lo-Fi switch so the music sounds muffled as if drifting from an adjoining room.
3. **Queue Exploration & Instant Search:** The user presses "Q" to slide open the frosted glass queue drawer, hits "/" to instantly filter the 30-track catalogue by title or artist, and selects a song.
4. **Hands-Off Listening:** The user closes the drawer and interacts entirely through tactile single-key hotkeys (Space to toggle, Left/Right to seek, N/P to skip) while poetic couplets and mood quotes fade in and out above the player deck.

---

## 3. High-Level Technical Architecture (Unified Supabase)

To eliminate credit card requirements, third-party CDN friction, and cross-origin security issues, Solitude relies entirely on Supabase for its backend infrastructure:

+--------------------------------------------------------+
|                   Next.js Frontend                     |
|               (Google Antigravity IDE)                 |
+-----------------------+--------------------------------+
                        |                                |
       Metadata & Realtime         Direct Audio & Covers
       (Postgres / WebSocket)      (Supabase Public Storage)
                        |                                |
                        v                                v
     +--------------------------------------------------+
     |                     Supabase                     |
     |  - PostgreSQL: 30 Song Rows & Metadata           |
     |  - Storage Bucket: 'tracks' (30 Uncompressed MP3)|
     |  - Storage Bucket: 'covers' (Album Art)          |
     |  - Storage Bucket: 'ambient' (Rain/Vinyl loops)  |
     |  - Realtime: 'room:solitude-global' Presence     |
     +--------------------------------------------------+

1. **Supabase PostgreSQL:** Stores the 30-track relational catalogue (track order, titles, artists, durations, public storage URLs, poetic quotes)[cite: 7].
2. **Supabase Storage (Free Tier - 1 GB):**
   * Hosts 30 uncompressed 320 kbps MP3 files (~225 MB total)[cite: 7].
   * Hosts 3 seamless looping ambient audio stems (rain.mp3, thunder.mp3, vinyl.mp3).
   * Operates comfortably within the 1 GB storage ceiling and 5 GB monthly egress allowance.
3. **Web Audio API Engine:** Routes audio buffers through a native BiquadFilterNode for real-time frequency filtering without third-party sandboxing issues.

---

## 4. Comprehensive Feature Specifications

### 4.1 Master Audio Deck
* **Playback Controls:** Play, Pause, Next Track (N), Previous Track (P), Seek Scrub Bar with hover time indicators, Master Volume slider.
* **Metadata HUD:** High-resolution album artwork, track title, artist attribution, elapsed time, and total duration.
* **Vinyl Disc Animation:** Circular album artwork rotates continuously (18s infinite linear rotation) while playing, smoothly decelerating over 1.2s when paused.
* **Crossfade Engine:** Automated 200ms linear gain ramp-down on track transition, followed by a 200ms gain ramp-up on next track start to eliminate digital audio clipping.

### 4.2 Lo-Fi / Muffled Filter ("Another Room" Mode)
* **Description:** An interactive audio toggle recreating the acoustic experience of listening to music from down the hall.
* **Behavior:** When enabled, the master audio stream passes through a Web Audio BiquadFilterNode configured as a low-pass filter with an 850 Hz cutoff frequency and a resonance boost (Q = 3.5).
* **Visual State:** The toggle button illuminates with a warm amber vacuum-tube glow when active.

### 4.3 Multi-Channel Ambient Soundboard
* **Channels:**
  1. Rain on Window: Continuous, gentle rainfall loop.
  2. Distant Thunder: Low-frequency atmospheric rumbles.
  3. Vinyl Crackle: Analog surface noise and needle crackle.
* **Persistence:** Ambient audio channels run on independent gain nodes. They loop continuously and do not reset or pause when songs change or when the main player is paused.
* **Independent Faders:** Each ambient channel has its own volume fader accessible via an expandable soundboard drawer.

### 4.4 Dynamic Environmental Lighting Engine
* **Overview:** A multi-state lighting selector cycled by clicking the candle icon in the player dock.
* **Preset States:**
  1. Warm Candlelight (Default): Soft amber radial gradients (#F59E0B), warm drop shadows, and subtle flickering CSS animations.
  2. Midnight Solitude: Deep cold midnight blue tones (#070B14 and #0B1329) with muted highlights.
  3. Rainy Cold Blue: Slate-cyan gradient overlay (#0E7490) reflecting a cold, stormy dusk.
  4. The Void: The candle is extinguished with a brief smoke animation. The entire viewport darkens to near-black (#020408) with only essential controls visible.

### 4.5 Interactive HTML5 Canvas Rain Window Engine
* **Visuals:** Full-screen 2D Canvas positioned behind all glassmorphic UI panels.
* **Physics:**
  * 120 primary falling raindrops with variable lengths and speeds.
  * Wind shear factor adding a subtle horizontal angle.
  * 35 stationary condensation droplets that accumulate on the glass and periodically streak downward.
* **Performance:** Pure Canvas 2D context using requestAnimationFrame, zero React state triggers in the render loop, maintaining a locked 60 FPS.

### 4.6 Slide-Over Track Drawer & Real-Time Search Bar
* **Drawer Panel:** Semi-transparent frosted glass panel sliding in from the right edge upon pressing "Q" or clicking the list icon.
* **Integrated Search Bar:**
  * Pinned permanently to the top of the queue drawer.
  * Real-time client-side fuzzy searching matching against both title and artist across all 30 tracks[cite: 7].
  * Displays match count (e.g., "Showing 3 of 30 songs").
* **Track Item Display:** Ranked track number, cover art thumbnail, song title, artist, and duration.
* **Active State:** The currently playing song is highlighted with an amber glowing border and an animated 3-bar audio equalizer visualizer.
* **Synchronized Poetic Mood Snippets:** A dedicated card within the drawer displays a poetic couplet or emotional takeaway synchronized with the active track.

### 4.7 Tactile Keyboard Shortcuts HUD
* **Layout:** A persistent status pill centered at the very bottom of the screen styled with dark frosted keycap badges matching physical keyboard caps:
  * [Space] - Play / Pause
  * [Left] [Right] - Seek Backward / Forward 5 seconds
  * [N] [P] - Next / Previous Track
  * [Q] - Toggle Queue Drawer
  * [/] - Quick Search Focus
* **Interactive Feedback:** When a user presses any of these keys on their physical keyboard, the corresponding keycap pill in the HUD lights up with an active amber glow.
* **Input Isolation:** When the search input is focused, single-key shortcuts (Space, N, P, Q, /) are automatically disabled so the user can type freely without triggering playback commands. Pressing Escape blurs the input and restores global shortcuts.

### 4.8 Communal Nocturnal Presence Engine
* **Visual Pill:** Pinned to the top-left corner of the sanctuary.
* **Display Format:** Pulsing amber beacon with text: "542 broken hearts listening with you".
* **Mechanism:** Backed by Supabase Realtime Presence tracking connected WebSockets, combined with an algorithm simulating nocturnal circadian peaks between 12:00 AM and 4:30 AM local time.

---

## 5. Scope & Music Catalogue (Top 30 Curated Tracks)

The playlist features 30 emotionally resonant tracks spanning modern melancholic hits, classic heartbreak anthems, and indie lo-fi acoustics[cite: 7]:

| Order | Track Title[cite: 7] | Artist / Film Provenance[cite: 7] | Duration[cite: 7] |
| :---: | :--- | :--- | :---: |
| 001 | Raanjhan[cite: 7] | Sachet Tandon, Parampara Tandon[cite: 7] | 4:01[cite: 7] |
| 002 | Finding Her (Slowed + Reverb)[cite: 7] | Kushagra, Vanshika Kashyap, Bharath[cite: 7] | 3:53[cite: 7] |
| 003 | Saiyaara[cite: 7] | Ek Tha Tiger / Saiyaara[cite: 7] | 6:11[cite: 7] |
| 004 | Sahiba[cite: 7] | Stebin Ben, Jasleen Royal[cite: 7] | 3:11[cite: 7] |
| 005 | ISHQ (Slowed & Reverb)[cite: 7] | Faheem Abdullah, Rauhan Malik[cite: 7] | 4:33[cite: 7] |
| 006 | Ishq Hai[cite: 7] | Anurag Saikia[cite: 7] | 5:13[cite: 7] |
| 007 | Tum Hi Ho[cite: 7] | Arijit Singh (Aashiqui 2)[cite: 7] | 4:22[cite: 7] |
| 008 | AGAR TUM SAATH HO[cite: 7] | Alka Yagnik, Arijit Singh (Tamasha)[cite: 7] | 5:42[cite: 7] |
| 009 | Tere Sang Yaara (Slowed + Reverb)[cite: 7] | Atif Aslam[cite: 7] | 5:02[cite: 7] |
| 010 | Sunn Raha Hai[cite: 7] | Ankit Tiwari (Aashiqui 2)[cite: 7] | 6:31[cite: 7] |
| 011 | O Bedardeya (Film Version)[cite: 7] | Arijit Singh, Pritam (TJMM)[cite: 7] | 5:26[cite: 7] |
| 012 | Chahun Main Ya Naa[cite: 7] | Arijit Singh, Palak Muchhal (Aashiqui 2)[cite: 7] | 5:05[cite: 7] |
| 013 | Tum Hi Aana[cite: 7] | Jubin Nautiyal (Marjaavaan)[cite: 7] | 4:10[cite: 7] |
| 014 | Bulleya[cite: 7] | Papon (Sultan)[cite: 7] | 3:06[cite: 7] |
| 015 | Mere Rashke Qamar[cite: 7] | Nusrat Fateh Ali Khan, Rahat Fateh Ali Khan[cite: 7] | 3:41[cite: 7] |
| 016 | Zihaal e Miskin[cite: 7] | Vishal Mishra, Shreya Ghoshal[cite: 7] | 4:24[cite: 7] |
| 017 | Lut Gaye[cite: 7] | Jubin Nautiyal[cite: 7] | 3:49[cite: 7] |
| 018 | KABHI JO BAADAL BARSE[cite: 7] | Arijit Singh (Jackpot)[cite: 7] | 4:15[cite: 7] |
| 019 | Zaroori Tha[cite: 7] | Rahat Fateh Ali Khan[cite: 7] | 5:43[cite: 7] |
| 020 | Teri Deewani[cite: 7] | Kailash Kher[cite: 7] | 5:24[cite: 7] |
| 021 | Bekhayali[cite: 7] | Sachet Tandon (Kabir Singh)[cite: 7] | 6:12[cite: 7] |
| 022 | Hamari Adhuri Kahani (Title Track)[cite: 7] | Arijit Singh[cite: 7] | 6:39[cite: 7] |
| 023 | Phir Bhi Tumko Chaahunga[cite: 7] | Arijit Singh, Shashaa Tirupati[cite: 7] | 5:52[cite: 7] |
| 024 | Roke Na Ruke Naina[cite: 7] | Arijit Singh (Badrinath Ki Dulhania)[cite: 7] | 4:39[cite: 7] |
| 025 | Hasi (Male Version)[cite: 7] | Ami Mishra (Hamari Adhuri Kahani)[cite: 7] | 4:33[cite: 7] |
| 026 | Jhol (Slowed + Reverb)[cite: 7] | Maanu x Annural Khalid (Coke Studio PK)[cite: 7] | 4:46[cite: 7] |
| 027 | Pal Pal[cite: 7] | Afusic / Ali Zafar[cite: 7] | 2:27[cite: 7] |
| 028 | Afsos[cite: 7] | PropheC[cite: 7] | 3:12[cite: 7] |
| 029 | Taare[cite: 7] | Tanishk Bagchi[cite: 7] | 2:35[cite: 7] |
| 030 | Ae Dil Hai Mushkil Title Track[cite: 7] | Arijit Singh, Pritam[cite: 7] | 4:30[cite: 7] |

---

## 6. Non-Functional Requirements & Performance Budgets

* **Audio Streaming Latency:** Time-to-First-Audio (TTFA) must remain under 300ms on standard broadband connections and under 800ms on mobile 4G networks using Supabase Storage edge points.
* **Storage Footprint:** 30 uncompressed 320 kbps MP3 files total approximately 225 MB, leaving over 750 MB free in the Supabase Storage bucket[cite: 7].
* **Frame Rate Budget:** The HTML5 Canvas rain simulation must maintain a stable 60 FPS on standard integrated GPUs without causing CPU/GPU thermal spikes.
* **Audio Memory Isolation:** All Web Audio nodes, audio elements, and event listeners must be explicitly disconnected and dereferenced during component unmounts to prevent memory leaks during prolonged listening sessions.
* **Keyboard Safety:** Global hotkeys must never swallow or intercept text input events when an input or textarea element holds active focus.

---

## 7. Success & Acceptance Criteria

1. **Audio Integrity:** Smooth, gapless transitions across all 30 tracks with zero audio pops or clicks[cite: 7].
2. **Ambience Stability:** Ambient rain, thunder, and vinyl audio loops continue uninterrupted when changing songs or pausing playback.
3. **Responsive Glassmorphism:** The glassmorphic dock and queue drawer render fluidly across desktop screens (1920x1080, 1440x900) down to mobile screens (375x812) with full backdrop blur fidelity.
4. **Keyboard Feedback:** Pressing Space, Left, Right, N, P, Q, and / produces immediate visual lighting feedback on the corresponding HUD key cap.
5. **Presence Accuracy:** Top-left indicator reflects real-time Supabase presence with circadian baseline adjustments.