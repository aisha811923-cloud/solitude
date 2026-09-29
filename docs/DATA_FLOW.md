# System Data Flow & Reactive State Architecture (DATA_FLOW.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: End-to-end data pipeline specification, audio byte streaming flow, WebSocket presence propagation, in-memory search mechanics, and local storage synchronization.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Global Architectural Topology

Solitude executes on a unidirectional reactive data flow pattern. Events dispatched from user input, keyboard handlers, or audio events update internal states and dispatch parameter schedules to Web Audio hardware nodes.

+--------------------------------------------------------------------------+
|                              USER INTERACTION                            |
|             (Mouse Click / Touch Tap / Keyboard Physical Event)          |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                         INPUT ISOLATION & ROUTER                         |
|   - isInputTarget(e) check: Is DOM focus inside <input> or <textarea>?    |
|   - If YES: Allow native event propagation (typing spaces & queries).    |
|   - If NO:  Intercept hotkey, preventDefault(), dispatch action.         |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                          MASTER ACTION DISPATCH                          |
|         (togglePlay, seekRelative, toggleLoFi, cycleTheme, etc.)         |
+--------------------------------------------------------------------------+
         |                                                 |
         v                                                 v
+-----------------------------------+   +----------------------------------+
|      REACT STATE STORE HOOKS      |   |       WEB AUDIO API ENGINE       |
|  - useAudioEngine (PlayerState)   |   |  - AudioContext (Singleton)      |
|  - usePresence (PresenceState)    |   |  - BiquadFilterNode (Lo-Fi DSP)  |
|  - useLocalStorage (Preferences)  |   |  - GainNode (Master & Ambience)  |
+-----------------------------------+   +----------------------------------+
         |                                                 |
         v                                                 v
+-----------------------------------+   +----------------------------------+
|      VIRTUAL DOM RECONCILIATION   |   |     OPERATING SYSTEM HARDWARE    |
|  - Dock Button Icon States        |   |  - DAC / Headphone Output        |
|  - Framer Motion Drawer Animation |   |  - OS Lock Screen MediaSession   |
|  - Animated SVG Candle Graphic    |   |  - Hardware Media Keys           |
+-----------------------------------+   +----------------------------------+

---

## 2. Audio Byte-Range Streaming Data Flow

Full uncompressed 320 kbps MP3 files stream on-demand using HTTP 206 Partial Content byte ranges, eliminating multi-megabyte downloads prior to playback.

    [User selects Track N or clicks Play]
                     |
                     v
    [Assign Supabase Storage URL to <audio src="...">]
    https://[REF].supabase.co/storage/v1/object/public/tracks/track-XXX.mp3
                     |
                     v
    [Browser sends HTTP GET with Range Header]
    Headers: { "Range": "bytes=0-327680", "Accept-Ranges": "bytes" }
                     |
                     v
    [Supabase Storage Edge CDN responds]
    Status: 206 Partial Content
    Headers: { "Content-Range": "bytes 0-327680/10485760" }
                     |
                     v
    [HTML5 Audio Buffer decodes initial PCM audio frame]
                     |
                     v
    [MediaElementAudioSourceNode streams PCM samples]
                     |
                     v
    [BiquadFilterNode applies low-pass DSP curve]
                     |
                     v
    [AnalyserNode extracts 64-point FFT frequencies for UI]
                     |
                     v
    [MasterGainNode attenuates volume via quadratic curve]
                     |
                     v
    [AudioContext.destination output to hardware speakers]

---

## 3. Realtime Communal Presence Synchronization Flow

Presence updates operate completely in memory through Supabase Realtime WebSockets, bypassing database tables entirely.

    [App Mounts in Browser]
               |
               v
    [Retrieve or generate session ID in sessionStorage]
               |
               v
    [Open WebSocket connection: wss://[REF].supabase.co/realtime/v1/websocket]
               |
               v
    [Join Channel: 'room:solitude-global']
               |
               v
    [Send Track Message with { userId, joinedAt: Date.now() }]
               |
               +-----------------------+
               |                       |
               v                       v
    [Realtime sync event received]   [Channel disconnect / error]
               |                               |
               v                               v
    [Extract socket count]           [Trigger exponential backoff retry]
    count = Object.keys(state).length| (1s -> 2s -> 4s -> max 30s)
               |                               |
               v                               v
    [Execute Circadian Function]     [Fallback: Run pure Circadian model]
    baseline = getCircadianBaseline()|
               |                               |
               +---------------+---------------+
                               |
                               v
    [Compute final display count: count + baseline + jitter]
                               |
                               v
    [Update PresenceBeacon UI: "[● 542 broken hearts listening with you]"]

---

## 4. Client-Side Instant Search Data Flow

The search pipeline runs 100% in client memory against the pre-loaded 30-track playlist array, ensuring zero server latency and zero egress costs.

    [User presses '/' key or clicks Search input]
                         |
                         v
    [QueueDrawer opens & Search input gains DOM focus]
                         |
                         v
    [User types query string (e.g., "Arijit")]
                         |
                         v
    [Sanitize input: trim length to 60 chars, remove special characters]
                         |
                         v
    [Execute in-memory filter across 30 tracks]
    tracks.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.artist.toLowerCase().includes(query)
    )
                         |
                         v
    [Update filtered list in UI & update match count badge]
                         |
                         v
    [User hits Enter or clicks song row]
                         |
                         v
    [Dispatch selectTrack(index) -> execute 200ms audio crossfade]

---

## 5. Decoupled 60 FPS Canvas Rain Render Flow

To preserve UI responsiveness, rain particle physics bypass React component state entirely.

    [Browser requestAnimationFrame(renderLoop)]
                         |
                         v
    [Read current viewport dimensions: canvas.width, canvas.height]
                         |
                         v
    [Iterate pre-allocated dropPool array (120 elements)]
    - drop.y += drop.speedY * multiplier
    - drop.x += drop.speedX * multiplier
    - If drop.y > height -> wrap to top
                         |
                         v
    [Iterate condensationPool array (35 elements)]
    - Update droplet weight and slipping velocity
    - Age and decay streak trail points (alpha -= 0.002)
    - If weight > threshold -> drop streaks down
                         |
                         v
    [ctx.clearRect(0, 0, width, height)]
                         |
                         v
    [Batch canvas draw operations: ctx.stroke() and ctx.fill()]
                         |
                         v
    [Schedule next frame: requestAnimationFrame(renderLoop)]

---

## 6. Client Storage Hydration & Persistence Flow

User configurations are safely preserved in `localStorage` under distinct keys:

    [App Mounts: Client Hydration]
                   |
                   v
    [Read localStorage values: volume, Lo-Fi state, lighting theme]
                   |
                   v
    [Apply initial values to Web Audio Gain and Filter parameters]
                   |
                   v
    [User adjusts volume slider or toggles Lo-Fi / theme]
                   |
                   v
    [Write updated value to localStorage: solitude:volume, solitude:lofi]