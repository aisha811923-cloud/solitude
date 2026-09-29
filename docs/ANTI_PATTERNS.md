# Architecture Anti-Patterns & Prohibited Practices (ANTI\_PATTERNS.md)

**Project Name:** Solitude (Midnight Sad Songs Sanctuary)\
**Document Purpose:** Explicit catalog of technical anti-patterns, performance pitfalls, and prohibited code patterns to prevent AI hallucination and system regressions.\
**Document Version:** 2.0.0\
**Target Environment:** Google Antigravity IDE

---

## 1. Web Audio API Anti-Patterns

### 1.1 Prohibited: Re-creating AudioContext on Component Re-render

- **Anti-Pattern:** Calling `new AudioContext()` inside a React functional component body or uncontrolled `useEffect`.
- **Consequence:** Browsers enforce a strict limit of 6 active hardware audio contexts. Rapid tab switching or re-renders will exhaust hardware channels, throw unhandled exceptions, and freeze browser audio globally.
- **Mandated Pattern:** Always use the persistent singleton pattern in `lib/audio/audioContext.ts`.

### 1.2 Prohibited: Re-calling `createMediaElementSource()` on the Same Element

- **Anti-Pattern:**
  ```typescript
  // FATAL ERROR: Throws DOMException "InvalidStateError: HTMLMediaElement already connected"
  useEffect(() => {
    const source = audioCtx.createMediaElementSource(audioRef.current);
    source.connect(audioCtx.destination);
  }, [currentTrack]);
  ```
- **Consequence:** An `HTMLMediaElement` can only be passed to `createMediaElementSource` once in its entire DOM lifecycle. Doing so on track changes instantly crashes audio routing.
- **Mandated Pattern:** Instantiate the `MediaElementAudioSourceNode` once on mount, retain its reference in a `useRef`, and update only the `src` attribute of the underlying `<audio>` element on track transitions.

### 1.3 Prohibited: Step-Function Gain Changes (Audio Clicks / Popping)

- **Anti-Pattern:** Directly modifying gain values instantaneously:
  ```typescript
  // BAD: Creates audible high-frequency digital impulse "pop"
  gainNode.gain.value = targetVolume;
  ```
- **Consequence:** Abrupt square-wave amplitude transitions produce harsh clicking artifacts through headphones.
- **Mandated Pattern:** Always use audio parameter ramp schedules:
  ```typescript
  // CORRECT: Clean de-clicked ramp
  gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(targetVolume, audioCtx.currentTime + 0.05);
  ```

### 1.4 Prohibited: Routing Ambient Stems into the Lo-Fi Filter

- **Anti-Pattern:** Connecting ambient audio nodes (rain, thunder, vinyl) into the master `BiquadFilterNode`.
- **Consequence:** When the user turns on "Another Room" mode, the rain and thunder get muffled alongside the song, ruining the physical illusion of rain falling directly against the bedroom glass.
- **Mandated Pattern:** Route ambient stems to independent gain buses directly into `audioContext.destination`, bypassing the filter completely.

---

## 2. React 19 & Next.js 15 Performance Anti-Patterns

### 2.1 Prohibited: Binding 60 FPS Canvas Rain Loops to React State

- **Anti-Pattern:**
  ```typescript
  // FATAL FOR PERFORMANCE: Triggers 60 React reconciliations every second
  function onFrame() {
    setDrops((prev) => prev.map(updateDropPhysics));
    requestAnimationFrame(onFrame);
  }
  ```
- **Consequence:** Triggers continuous React reconciliation cycles, consumes 100% of single-thread CPU capacity, and causes dropped audio frames and UI stutter.
- **Mandated Pattern:** Keep all particle coordinates, array structures, and velocity updates in mutable typed arrays outside React state. Draw directly to the HTML5 2D Canvas context inside `requestAnimationFrame`.

### 2.2 Prohibited: Updating React State on Every Audio `timeupdate`

- **Anti-Pattern:** Calling `setCurrentTime(e.target.currentTime)` at native audio element frequency (30 to 60 times/sec) inside React component state.
- **Consequence:** Re-renders the entire AudioDeck, VinylDisc, and parent layouts continuously.
- **Mandated Pattern:** Update scrub-bar thumb positions and elapsed time readout via DOM refs or throttle state synchronization to a maximum rate of 4 Hz (every 250ms).

### 2.3 Prohibited: Storing Web Audio Nodes in `useState`

- **Anti-Pattern:** `const [gainNode, setGainNode] = useState<GainNode | null>(null);`
- **Consequence:** Web Audio nodes are mutable, non-serializable, hardware-bound reference objects. Putting them in React state causes unexpected re-render loops and stale closure traps.
- **Mandated Pattern:** Store all audio graph nodes inside persistent `useRef` instances or module singletons.

---

## 3. Keyboard Handling & UX Anti-Patterns

### 3.1 Prohibited: Unchecked Global Hotkeys (The Search Spacebar Bug)

- **Anti-Pattern:** Registering a window `keydown` listener that toggles play/pause on `Space` without evaluating event target focus.
- **Consequence:** When a user clicks the search bar in the track drawer and types a space (e.g., "Tum Hi Ho"), the song abruptly pauses and the space character is swallowed.
- **Mandated Pattern:** Guard every global key listener with `isInputTarget(e)`. If the target is an `INPUT`, `TEXTAREA`, or editable field, bypass hotkeys entirely.

### 3.2 Prohibited: Hard Vinyl Disc Stops

- **Anti-Pattern:** Setting `animation-play-state: paused` immediately when the track pauses.
- **Consequence:** Visually jarring, digital stop that breaks the tactile retro hardware illusion.
- **Mandated Pattern:** Transition transform deceleration over `1.2s` using `cubic-bezier(0.25, 1, 0.5, 1)` to simulate turntable platter friction and inertial drag.

---

## 4. Supabase & Network Anti-Patterns

### 4.1 Prohibited: Refetching Track Catalogue on Every Song Switch

- **Anti-Pattern:** Executing `supabase.from('songs').select('*').eq('id', newId)` on each track skip.
- **Consequence:** Introduces unnecessary network latency (100–300ms) before audio buffering can even start, and needlessly consumes database connection pools.
- **Mandated Pattern:** Fetch the complete 30-track manifest once on initial page mount. Index the catalogue in client memory and perform all subsequent navigation, queueing, and search locally with 0ms latency.

### 4.2 Prohibited: In-Memory Blob Audio Fetching

- **Anti-Pattern:** Fetching the full MP3 binary into client memory via `fetch(url).then(res => res.blob())` before playing.
- **Consequence:** Forces the user to download the entire 10 MB audio file before hearing the first note, completely breaking the 300ms Time-to-First-Audio budget.
- **Mandated Pattern:** Assign the public Supabase Storage URL directly to the `<audio src="...">` element with `crossOrigin="anonymous"`, enabling instant HTTP 206 Partial Content byte-range streaming.

### 4.3 Prohibited: Persistent Database Writes for Ephemeral Presence

- **Anti-Pattern:** Writing user heartbeats to a PostgreSQL database table (`INSERT INTO user_presence...`) every 10 seconds.
- **Consequence:** Rapidly exhausts free-tier database IOPS, accumulates massive dead-tuple overhead, and degrades database read performance.
- **Mandated Pattern:** Track active presence exclusively through Supabase Realtime WebSocket presence channels (`room:solitude-global`) with zero database table writes.

---

## 5. CSS & Glassmorphism Anti-Patterns

### 5.1 Prohibited: Nested Stacking of `backdrop-filter: blur()`

- **Anti-Pattern:** Placing multiple overlapping full-screen containers that each have `backdrop-filter: blur(20px)`.
- **Consequence:** Stacking GPU compositor passes with heavy convolution shaders severely degrades frame rates on integrated GPUs, dropping the rain canvas from 60 FPS down to under 25 FPS.
- **Mandated Pattern:** Restrict `backdrop-blur` strictly to the foreground interactive panels (dock and sliding drawer). The primary canvas and background vignette must remain clean pass-through composite layers.

### 5.2 Prohibited: Hardcoded Viewport `100vh` on Mobile Devices

- **Anti-Pattern:** Setting root app container height to `height: 100vh`.
- **Consequence:** On mobile Safari and Chrome, dynamic browser navigation bars cause bottom docks and keyboard HUDs to be clipped off-screen or jump around during scrolling.
- **Mandated Pattern:** Use modern viewport units: `min-h-screen h-[100dvh]` to account for dynamic address bar states.

