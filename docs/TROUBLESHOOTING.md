# Troubleshooting & Incident Diagnostics Runbook (TROUBLESHOOTING.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Diagnostic playbooks, error catalogs, browser hardware edge cases, Web Audio API crash recovery, and Supabase streaming fault isolation.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Quick-Triage Incident Matrix

+-----------------------------------------------+----------------------------------------+-----------------------------------------------------+
| Symptom / Error Message                       | Primary Root Cause                     | Remediation Step                                    |
+-----------------------------------------------+----------------------------------------+-----------------------------------------------------+
| DOMException: The AudioContext was not        | Browser autoplay policy blocking audio | Invoke unlockMobileAudio() on first user click or   |
| allowed to start                              | initialization without user gesture.   | touch event on the viewport.                        |
| InvalidStateError: HTMLMediaElement already   | createMediaElementSource() invoked     | Store MediaElementAudioSourceNode in persistent ref;|
| connected                                     | repeatedly on track change.            | instantiate only once per HTML5 audio element.      |
| MediaElementAudioSource outputs zeroes due to | Missing CORS headers on Supabase       | Configure CORS rules on Supabase Storage bucket; add|
| CORS access restrictions                      | Storage audio files.                   | crossOrigin="anonymous" to <audio> tag.             |
| Range request 200 OK instead of 206 Partial   | Supabase Storage proxy stripping Range | Verify Accept-Ranges header; configure public       |
| Content (Timeline scrubbing fails)            | headers or client missing range header.| bucket caching and use direct storage URLs.         |
| Sudden digital popping/clicks when toggling   | Abrupt step-function gain or cutoff    | Use exponentialRampToValueAtTime() over minimum     |
| Lo-Fi mode                                    | frequency parameter changes.           | 200ms duration with cancelScheduledValues().        |
| Heavy FPS drops on mobile during rain canvas  | Stacking multiple backdrop-blur layers | Remove nested backdrop filters; cap Canvas DPR at   |
| playback                                      | with un-throttled canvas render loop.  | 2.0; pause Canvas loop via Page Visibility API.     |
| Audio pauses unexpectedly when typing Space   | Global hotkey listener firing without  | Enforce isInputTarget() guard on window keydown     |
| in track search drawer                        | input target isolation.                | handler.                                            |
+-----------------------------------------------+----------------------------------------+-----------------------------------------------------+

---

## 2. Web Audio API Hardware Faults & Resolution

### 2.1 Error: "InvalidStateError: HTMLMediaElement already connected"
* Cause:
  The Web Audio specification prohibits connecting an HTMLMediaElement to an AudioContext more than once. Re-calling `ctx.createMediaElementSource(audioRef)` inside a `useEffect` keyed to track changes throws this unrecoverable fatal error.
* Solution:
  Keep the audio source node instantiated once and only update `audio.src`:

    // CORRECT: Persistent node reference
    if (!sourceNodeRef.current) {
      sourceNodeRef.current = audioCtx.createMediaElementSource(audioElement);
      sourceNodeRef.current.connect(filterNode);
    }
    // Track transitions ONLY touch the audio element:
    audioElement.src = nextTrackUrl;
    audioElement.load();
    audioElement.play();

---

### 2.2 Error: MediaElementAudioSource outputs zeroes (Silent Playback)
* Cause:
  CORS restriction security barrier. Even if audio plays through an unfiltered `<audio>` element, routing it through Web Audio API (`MediaElementAudioSourceNode`) requires explicit CORS headers from the origin server.
* Solution:
  1. Add `crossOrigin="anonymous"` to `<audio>`:
     `<audio id="solitude-audio" crossOrigin="anonymous" preload="metadata" />`
  2. Apply CORS policy to Supabase Storage:
     Run `supabase storage cors add cors.json` ensuring `Origin: ["*"]` and `Method: ["GET", "HEAD"]`.

---

### 2.3 Mobile iOS Safari Silent Switch Suppression
* Symptom:
  On iPhones, if the physical side switch is set to "Silent", Web Audio API sound is muted by iOS WebKit, whereas native music players continue playing.
* Solution:
  HTML5 audio streaming bypasses the hardware ringer switch when properly registered with the Media Session API and unlocked via silent PCM buffer on first touch:

    export async function forceIOSPlaybackUnlock(ctx: AudioContext, audioElem: HTMLAudioElement) {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      // Play a 10ms silent oscillator buffer to engage system media daemon
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(ctx.currentTime + 0.01);
    }

---

## 3. Supabase Media Storage & Streaming Failures

### 3.1 HTTP 206 Range Seeking Failure Checklist
When a user drags the scrub slider forward, the browser sends:
`Range: bytes=1048576-`

If scrubbing fails or restarts from 0:
1. Verify Supabase Storage Public access:
   Execute `curl -I https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-001.mp3`
2. Check response headers:
   Must contain `Accept-Ranges: bytes`.
   Must NOT contain `Cache-Control: no-transform` that could strip range headers.

### 3.2 Realtime Presence Reconnection Loop
* Symptom:
  Console flooded with `WebSocket connection to wss://... failed: WebSocket is closed before the connection is established`.
* Diagnostic & Fix:
  Supabase channels will error if multiple instances subscribe with identical keys simultaneously.
  Wrap presence subscription in an exponential backoff retry loop with minimum 1-second delay, and always invoke `supabase.removeChannel(channel)` in cleanup.

---

## 4. Performance & Rendering Diagnostics

### 4.1 Debugging Canvas Rain Stutter
If the rain animation stutters or drops below 60 FPS:
1. Open Chrome DevTools -> Rendering Tab -> Check "Frame Rendering Stats".
2. If GPU rasterization is bottlenecked, inspect CSS:
   Check whether `#solitude-canvas` is sitting inside a container with `backdrop-filter: blur(...)`.
   Fix: Canvas must sit in an independent background `z-index: 10` layer with NO parent backdrop blur applied.
3. Check particle allocation:
   Verify that particle arrays are pre-allocated outside the animation frame callback.

---

## 5. Diagnostic Verification Scripts

Run these scripts in your browser Developer Console while on the Solitude sanctuary page to verify runtime health:

### 5.1 Test Web Audio Node Graph State
    (function auditAudioGraph() {
      const audio = document.querySelector("audio");
      console.log("Audio Element Src:", audio?.src || "MISSING");
      console.log("Audio CrossOrigin:", audio?.crossOrigin || "MISSING (Will cause CORS mute)");
      console.log("Audio ReadyState:", audio?.readyState);
      console.log("Audio Paused:", audio?.paused);
      console.log("Audio CurrentTime:", audio?.currentTime);
    })();

### 5.2 Test Supabase Edge Storage Streaming
    fetch("https://[YOUR_PROJECT].supabase.co/storage/v1/object/public/tracks/track-001.mp3", {
      headers: { Range: "bytes=0-100" }
    })
      .then(res => {
        console.log("Range Request Status:", res.status); // MUST BE 206
        console.log("Content-Range:", res.headers.get("content-range"));
        console.log("Accept-Ranges:", res.headers.get("accept-ranges"));
      })
      .catch(err => console.error("Storage Stream Error:", err));