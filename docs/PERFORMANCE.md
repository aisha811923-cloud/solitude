# Performance Budgets, Memory Profiling & Optimization (PERFORMANCE.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Quantitative performance budgets, Web Audio API memory profiling, Canvas 2D frame-rate optimization, network egress caching, and runtime garbage collection mitigation.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Quantitative Performance Budgets

To deliver an instantaneous, lag-free nocturnal sanctuary, Solitude enforces strict resource ceilings across desktop and mobile devices:

+-----------------------------------+--------------------+------------------------------------------+
| Metric                            | Budget Ceiling     | Measurement Tool / Condition             |
+-----------------------------------+--------------------+------------------------------------------+
| First Contentful Paint (FCP)      | <= 0.8 seconds     | Lighthouse Mobile (Slow 4G emulation)    |
| Largest Contentful Paint (LCP)     | <= 1.2 seconds     | Lighthouse Mobile                        |
| Cumulative Layout Shift (CLS)     | 0.00               | Zero layout movement on load or hydrate  |
| Interaction to Next Paint (INP)   | <= 50 milliseconds | Chrome User Experience Report (CrUX)     |
| Time-to-First-Audio (TTFA)        | <= 300 milliseconds| Click-to-first-decoded-PCM sample        |
| Steady-State Canvas Frame Rate    | 60 FPS (+/- 2 FPS) | Chrome DevTools Performance Monitor      |
| JavaScript Main-Thread Heap       | <= 65 MB           | Post 2-hour continuous playback session  |
| Production JS Initial Bundle      | <= 140 KB (gzipped)| Next.js Build Output Analyzer            |
+-----------------------------------+--------------------+------------------------------------------+

---

## 2. Web Audio API Memory Management & Node Recycling

Web Audio nodes (GainNode, BiquadFilterNode, AnalyserNode) interface directly with low-level OS audio drivers (CoreAudio, WASAPI, ALSA). Improper node allocation leads to unrecoverable native memory leaks and browser audio thread crashes.

### 2.1 The Persistent Graph Invariant
Never tear down and re-instantiate audio nodes during standard playback, song skipping, or volume adjustments. The master graph is allocated once on first user gesture and persists across the entire application lifecycle.

    [Permanent Node References in Module Scope / useAudioEngine]
    - ctx: AudioContext (Singleton)
    - sourceNode: MediaElementAudioSourceNode (Instantiated once per HTMLAudioElement)
    - filterNode: BiquadFilterNode (Swept via frequency parameter, never replaced)
    - analyserNode: AnalyserNode (Constant FFT size of 64)
    - masterGainNode: GainNode (Controlled via audio parameter scheduling)

### 2.2 Garbage Collection & Node Disconnection Protocol
When the application unmounts or undergoes hard cleanup, nodes must be disconnected in leaf-to-root order to allow the browser audio garbage collector to reclaim allocated buffers:

    export function releaseAudioResources(nodes: AudioEngineNodes) {
      // 1. Ramp master gain to 0 to prevent audible pop
      nodes.masterGainNode.gain.setValueAtTime(0, nodes.audioContext.currentTime);

      // 2. Disconnect leaves
      nodes.analyserNode.disconnect();
      nodes.masterGainNode.disconnect();
      nodes.ambientRainGain.disconnect();
      nodes.ambientThunderGain.disconnect();
      nodes.ambientVinylGain.disconnect();

      // 3. Disconnect branch filters
      nodes.filterNode.disconnect();

      // 4. Disconnect source element
      nodes.sourceNode.disconnect();

      // 5. Close hardware context
      if (nodes.audioContext.state !== "closed") {
        nodes.audioContext.close();
      }
    }

---

## 3. Canvas 2D 60 FPS Render Optimization

The 60 FPS rain simulation runs alongside reactive audio playback. It must not compete with the main JavaScript thread for CPU time.

### 3.1 Zero Heap Allocation Inside Render Loop
Memory allocation (e.g., `new Drop()`, array slicing, object literals) inside `requestAnimationFrame` forces the V8 engine to trigger frequent Garbage Collection (GC) sweeps, causing frame drops and audio stutter.

* Prohibited: Creating temporary arrays or objects inside `updateAndDrawRaindrops()`.
* Mandated: Pre-allocate typed arrays and static object pools on initial mount. Mutate numeric properties in-place.

    // Pre-allocated particle pool
    const MAX_DROPS = 160;
    const dropPool: Drop[] = new Array(MAX_DROPS);

    export function initDropPool(width: number, height: number) {
      for (let i = 0; i < MAX_DROPS; i++) {
        dropPool[i] = {
          x: Math.random() * (width + 200),
          y: Math.random() * height,
          length: 20 + Math.random() * 12,
          speedY: 12 + Math.random() * 6,
          speedX: -1.4,
          opacity: 0.15 + Math.random() * 0.20,
          thickness: 1 + Math.random() * 0.8
        };
      }
    }

### 3.2 Page Visibility API Throttling
When the user switches tabs or locks their mobile phone screen, the browser must stop calculating canvas frames immediately to preserve battery and GPU cycles. Audio streaming continues uninterrupted via the HTML5 audio element:

    useEffect(() => {
      function handleVisibilityChange() {
        if (document.hidden) {
          // Pause rendering loop
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        } else {
          // Resume rendering loop
          lastFrameTimeRef.current = performance.now();
          animationFrameRef.current = requestAnimationFrame(renderLoop);
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

---

## 4. Supabase Network & Byte-Range Optimization

### 4.1 HTTP 206 Partial Content Chunking
Full uncompressed 320 kbps MP3 files range from 6 MB to 14 MB. Downloading full audio binaries blocks network pipes and drains user mobile bandwidth.
* Using Supabase Storage with HTTP 206 partial streaming allows browsers to request only 256 KB - 512 KB chunks at a time.
* Scrubbing backward or forward jumps directly to the requested byte offset without downloading intermediate audio.

### 4.2 Progressive Cover Image Loading
Album cover art is stored as optimized WebP files (512x512, ~120 KB).
* Images are served with aggressive edge caching headers:
  `Cache-Control: public, max-age=31536000, immutable`
* Next.js `<Image>` component automatically serves pre-sized WebP thumbnails according to device DPR.

---

## 5. Bundle Size Optimization & Code Splitting

### 5.1 Dynamic Code Splitting
Components not required for initial sanctuary boot are lazy-loaded on demand:
* Slide-Over Queue Drawer (`QueueDrawer.tsx`): Loaded via `next/dynamic` when user triggers search or clicks queue button.
* Ambient Soundboard Popover (`AmbientSoundboard.tsx`): Loaded dynamically on soundboard toggle.
* Framer Motion: Imported selectively to enable tree-shaking of unused motion features.

    import dynamic from "next/dynamic";

    export const DynamicQueueDrawer = dynamic(
      () => import("@/components/queue/QueueDrawer").then((mod) => mod.QueueDrawer),
      { ssr: false }
    );

    export const DynamicSoundboard = dynamic(
      () => import("@/components/ambient/AmbientSoundboard").then((mod) => mod.AmbientSoundboard),
      { ssr: false }
    );

### 5.2 Icon Tree-Shaking
Import icons directly from `lucide-react` using named imports. The build bundler eliminates unreferenced SVG paths:
`import { Play, Pause, SkipForward, SkipBack, Sliders, Flame } from "lucide-react";`

---

## 6. Profiling & Memory Leak Verification Protocol

Run this audit sequence before any production deployment:

1. Launch Chrome in Incognito mode with all extensions disabled.
2. Open Chrome DevTools -> Performance tab.
3. Start recording, play 5 consecutive songs, toggle Lo-Fi mode 10 times, open and close queue drawer 5 times, and scrub timeline.
4. Stop recording and verify:
   - Zero frame drops below 55 FPS on the Main thread.
   - JS Heap memory returns to baseline during garbage collection (sawtooth pattern without upward drift).
5. Open Chrome DevTools -> Memory tab -> Take Heap Snapshot.
   - Verify that detached `HTMLAudioElement`, `AudioContext`, and `CanvasRenderingContext2D` counts equal zero.