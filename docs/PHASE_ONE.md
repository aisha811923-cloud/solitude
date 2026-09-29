# Phase One: Web Audio Engine & DSP Subsystems (PHASE_ONE.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)  
Document Purpose: Step-by-step implementation guide for Phase One milestones: AudioContext singleton provider, iOS Safari unlocking routine, 850 Hz BiquadFilterNode DSP ramps, and logarithmic gain staging.  
Document Version: 2.0.0  
Target Environment: Google Antigravity IDE  

---

## 1. Phase One Deliverables & Milestone Scope

Phase One builds the digital signal processing (DSP) backbone of Solitude. This phase must be completed before building visual components or queue management.

Milestones to achieve:
1. Singleton AudioContext allocation ensuring zero duplicate audio contexts across Next.js client component re-renders.
2. Mobile WebKit / Safari hardware unlocking routine firing on first viewport gesture.
3. Lo-Fi "Another Room" acoustic filter switching between 20,000 Hz bypass and 850 Hz muffled resonance.
4. Perceptual quadratic volume staging and de-clicked 150ms crossfade transitions.

---

## 2. Audio Pipeline Graph Architecture

    [HTMLAudioElement] (Stream URL: Supabase Storage track-XXX.mp3)
           |
           v
    [MediaElementAudioSourceNode] (Single persistent ref)
           |
           v
    [BiquadFilterNode] (Lo-Fi Filter: 850 Hz, Q = 3.5)
           |
           v
    [AnalyserNode] (fftSize = 64 for queue equalizer pulses)
           |
           v
    [Master GainNode] (Logarithmic volume + track crossfader)
           |
           +------------------------------------------+
           |                                          |
           v                                          v
    [Ambient Soundboard Bus]                  [AudioContext.destination]
    - RainGainNode    ----------------------------->  ^
    - ThunderGainNode ----------------------------->  |
    - VinylGainNode   ----------------------------->  |
    (Direct connection ensures ambient rain is never muffled)

---

## 3. Step-by-Step Implementation Blueprint

### Step 3.1: Singleton AudioContext Provider (lib/audio/audioContext.ts)
Requirements:
* Maintain a persistent module-level `globalAudioContext` variable.
* Handle browser differences (`window.AudioContext` vs `window.webkitAudioContext`).
* Export `getAudioContext()` that throws if called in server-side SSR contexts.
* Export `unlockAudioContext(ctx)` that checks `ctx.state === "suspended"`, executes `ctx.resume()`, and outputs a 1-sample silent PCM buffer.

    // Target API contract to fulfill:
    export function getAudioContext(): AudioContext;
    export function unlockAudioContext(ctx: AudioContext): Promise<boolean>;
    export function isAudioUnlocked(): boolean;
    export function closeAudioContext(): Promise<void>;

---

### Step 3.2: Lo-Fi Biquad Low-Pass Acoustic Filter (lib/audio/filterNode.ts)
Requirements:
* Initialize filter node with `type = "lowpass"`, `frequency = 20000`, `Q = 0.707`.
* When activating Lo-Fi mode:
  1. Call `cancelScheduledValues(now)` on both `frequency` and `Q`.
  2. Set anchor value: `setValueAtTime(Math.max(currentFreq, 10), now)`.
  3. Exponentially sweep `frequency` to `850 Hz` over 280ms.
  4. Linearly ramp `Q` to `3.5` over 280ms.
* When deactivating Lo-Fi mode (clean bypass):
  1. Call `cancelScheduledValues(now)`.
  2. Exponentially sweep `frequency` up to `20000 Hz` over 200ms.
  3. Linearly ramp `Q` back to `0.707` over 200ms.

    // Target API contract to fulfill:
    export function createLoFiFilter(ctx: AudioContext): BiquadFilterNode;
    export function activateLoFi(filterNode: BiquadFilterNode, ctx: AudioContext): void;
    export function deactivateLoFi(filterNode: BiquadFilterNode, ctx: AudioContext): void;
    export function setLoFiMode(filterNode: BiquadFilterNode, active: boolean, ctx: AudioContext): void;

---

### Step 3.3: Perceptual Quadratic Gain Staging (lib/audio/gainCurves.ts)
Requirements:
* Convert linear user slider values (0.0 to 1.0) into acoustic power using quadratic scaling: `Gain = Volume^2`.
* Clamp inputs strictly between `0.0` and `1.0`.
* Implement de-clicked 150ms track crossfade scheduling function that ramps active gain to 0.001 before swapping audio source URL.

    // Target API contract to fulfill:
    export function calculatePerceptualGain(sliderValue: number): number;
    export function rampGain(gainNode: GainNode, targetValue: number, duration: number, ctx: AudioContext): void;
    export function crossfadeTrack(masterGain: GainNode, audio: HTMLAudioElement, nextUrl: string, targetGain: number, ctx: AudioContext): Promise<void>;

---

## 4. Hardware Verification & Testing Protocol

Execute the following test in browser console to verify Phase One completion:

    (async function verifyPhaseOne() {
      const { getAudioContext, unlockAudioContext } = await import("/lib/audio/audioContext.ts");
      const { createLoFiFilter, setLoFiMode } = await import("/lib/audio/filterNode.ts");
      const { calculatePerceptualGain } = await import("/lib/audio/gainCurves.ts");

      const ctx = getAudioContext();
      console.assert(ctx instanceof AudioContext, "AudioContext must be instantiated");

      const unlocked = await unlockAudioContext(ctx);
      console.assert(ctx.state === "running", "AudioContext state must be 'running'");

      const filter = createLoFiFilter(ctx);
      console.assert(filter.frequency.value === 20000, "Filter must initialize in bypass (20kHz)");

      setLoFiMode(filter, true, ctx);
      setTimeout(() => {
        console.assert(filter.frequency.value <= 860, "Filter must ramp down to ~850 Hz");
        console.log("Phase One Web Audio Verification: ALL CHECKS PASSED");
      }, 350);
    })();

---

## 5. Phase One Completion Gate & Audit Checklist

+----+----------------------------------------------+-------------------------------------------------------+
| No | Verification Item                            | Success Criteria                                      |
+----+----------------------------------------------+-------------------------------------------------------+
| 01 | AudioContext instantiation                   | Only 1 instance exists in window context.             |
| 02 | First touch autoplay unlock                  | AudioContext transitions to 'running' on first click. |
| 03 | Frequency cutoff sweep                       | Sweeps between 20000 Hz and 850 Hz with zero pops.    |
| 04 | Q resonance boundary                         | Reaches 3.5 in Lo-Fi mode and 0.707 in bypass.        |
| 05 | Perceptual volume curve                      | 0.5 linear input yields 0.25 gain output.             |
| 06 | Crossfade duration                           | 150ms ramp-out followed by 200ms ramp-in on skip.     |
+----+----------------------------------------------+-------------------------------------------------------+