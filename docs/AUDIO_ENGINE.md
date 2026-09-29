# Audio Engine & DSP Architecture (AUDIO_ENGINE.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Definitive technical specification of Web Audio API node graphs, digital signal processing (DSP) parameters, Biquad low-pass filter mathematics, gain staging, buffer management, and hardware lifecycle.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Master Audio Pipeline Architecture

The Solitude audio subsystem operates on a dual-bus model:
1. Master Music Bus: Routes songs from Supabase Storage through the interactive Lo-Fi DSP filter and Fast Fourier Transform (FFT) analyzer.
2. Ambient Soundboard Bus: Routes three continuous background soundscapes (Rain, Thunder, Vinyl) directly to the output destination, bypassing the Lo-Fi filter.

### 1.1 Complete Audio Node Routing Diagram

+-------------------------------------------------------------------------+
| [Master HTML5 <audio> Element]                                          |
| (Cross-Origin: Anonymous, HTTP 206 Byte Ranges)                         |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| [MediaElementAudioSourceNode] (Single-instance persistent reference)   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| [BiquadFilterNode] (Lo-Fi "Another Room" DSP Engine)                    |
| - Bypass Mode: Type 'allpass', Frequency 20000 Hz, Q 0.707             |
| - Lo-Fi Mode: Type 'lowpass', Frequency 850 Hz, Q 3.50                 |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| [AnalyserNode] (Real-time Visualizer FFT Data)                          |
| - fftSize: 64, smoothingTimeConstant: 0.85                              |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| [Master GainNode] (Logarithmic Perceptual Volume + 200ms Crossfade)    |
+-------------------------------------------------------------------------+
                                    |
                                    +----------------------------------+
                                    |                                  |
                                    v                                  v
+----------------------------------------------------+   +----------------+
| Ambient Stem: Rain   -> [AmbientRainGainNode]     |   |                |
| Ambient Stem: Thunder-> [AmbientThunderGainNode]  |-->|  AudioContext  |
| Ambient Stem: Vinyl  -> [AmbientVinylGainNode]    |   |  .destination  |
+----------------------------------------------------+   |  (Speakers /   |
                                                         |   Headphones)  |
                                                         +----------------+

---

## 2. Lo-Fi DSP Filter Mathematics & Acoustic Profile

The Lo-Fi toggle recreates acoustic shadow transmission: the physics of sound travelling through drywall or heavy oak doors where high frequencies attenuate rapidly while bass frequencies resonate.

### 2.1 Filter Parameters
* Filter Topology: 2nd Order Butterworth Low-Pass (BiquadFilterNode).
* Cutoff Frequency (fc): 850 Hz.
  - Passes human vocal fundamentals (100 Hz - 300 Hz) and acoustic bass warmth (60 Hz - 250 Hz).
  - Rolls off treble and presence frequencies (1 kHz - 20 kHz) at -12 dB/octave.
* Resonance (Q Factor): 3.5.
  - Imparts a +3.2 dB resonance peak right at 850 Hz, mimicking acoustic wall boundary resonance.

### 2.2 Parameter Scheduling (Zero-Click Transition)
To eliminate digital popping, parameter transitions are scheduled using exponential curves:

    // Ramping from Bypass to Lo-Fi Mode
    export function activateLoFi(filterNode: BiquadFilterNode, ctx: AudioContext) {
      const now = ctx.currentTime;
      filterNode.frequency.cancelScheduledValues(now);
      filterNode.Q.cancelScheduledValues(now);

      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(Math.max(filterNode.frequency.value, 10), now);
      filterNode.frequency.exponentialRampToValueAtTime(850, now + 0.28);
      filterNode.Q.linearRampToValueAtTime(3.5, now + 0.28);
    }

    // Ramping from Lo-Fi to Clean Bypass Mode
    export function deactivateLoFi(filterNode: BiquadFilterNode, ctx: AudioContext) {
      const now = ctx.currentTime;
      filterNode.frequency.cancelScheduledValues(now);
      filterNode.Q.cancelScheduledValues(now);

      filterNode.frequency.setValueAtTime(filterNode.frequency.value, now);
      filterNode.frequency.exponentialRampToValueAtTime(20000, now + 0.20);
      filterNode.Q.linearRampToValueAtTime(0.707, now + 0.20);
    }

---

## 3. Logarithmic Gain Staging & Crossfade Architecture

Human hearing perceives acoustic loudness logarithmically rather than linearly. Linear slider inputs (0.0 to 1.0) must be converted before assignment to gain nodes.

### 3.1 Perceptual Gain Equation
Gain = (SliderPosition)^2

    export function calculatePerceptualGain(sliderValue: number): number {
      const clamped = Math.max(0, Math.min(1, sliderValue));
      return clamped * clamped;
    }

### 3.2 200ms Automated Crossfade Algorithm
When skipping or changing songs, Solitude executes a continuous crossfade to prevent sharp transitions:

    export function executeTrackCrossfade(
      masterGain: GainNode,
      audioElement: HTMLAudioElement,
      nextTrackUrl: string,
      targetVolume: number,
      ctx: AudioContext
    ): Promise<void> {
      return new Promise((resolve) => {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        
        // 1. Fade out active track over 150ms
        masterGain.gain.linearRampToValueAtTime(0.001, now + 0.15);

        setTimeout(() => {
          // 2. Swap audio source
          audioElement.src = nextTrackUrl;
          audioElement.load();
          audioElement.play().then(() => {
            // 3. Fade in incoming track over 200ms
            const resumeTime = ctx.currentTime;
            masterGain.gain.cancelScheduledValues(resumeTime);
            masterGain.gain.setValueAtTime(0.001, resumeTime);
            masterGain.gain.linearRampToValueAtTime(calculatePerceptualGain(targetVolume), resumeTime + 0.20);
            resolve();
          });
        }, 150);
      });
    }

---

## 4. Ambient Multi-Channel Soundboard Engine

Ambient tracks loop continuously in the background and must not be affected by song pausing, scrubbing, or track skips.

### 4.1 Ambient Stems Specification
* rain.mp3: 60-second seamless loop of gentle rain pattering against glass.
* thunder.mp3: 90-second atmospheric loop with intermittent low-frequency rumbles (<120 Hz).
* vinyl.mp3: 45-second authentic analog shellac surface noise and needle crackle.

### 4.2 Independent Gain Routing
Each ambient track has its own dedicated GainNode connected directly to AudioContext.destination:

    const rainGain = ctx.createGain();
    const thunderGain = ctx.createGain();
    const vinylGain = ctx.createGain();

    rainGain.connect(ctx.destination);
    thunderGain.connect(ctx.destination);
    vinylGain.connect(ctx.destination);

---

## 5. Mobile Autoplay & AudioContext Unlocking Routine

Mobile browsers (especially iOS WebKit) suspend AudioContext instances until an explicit user touch or click gesture occurs.

### 5.1 Hardware Unlocking Sequence
1. Check AudioContext state on first touch/click.
2. If suspended, invoke ctx.resume().
3. Generate a 1-sample silent AudioBuffer and route it to destination. This satisfies iOS WebKit hardware routing restrictions.

    export async function unlockMobileAudio(ctx: AudioContext): Promise<boolean> {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      return ctx.state === "running";
    }

---

## 6. Teardown Protocol & Hardware Memory Management

To prevent browser audio thread leaks during long listening sessions, execute complete graph teardown on unmount:

    export function teardownAudioGraph(nodes: AudioEngineNodes) {
      try {
        nodes.masterGainNode.gain.setValueAtTime(0, nodes.audioContext.currentTime);
        nodes.sourceNode.disconnect();
        nodes.filterNode.disconnect();
        nodes.analyserNode.disconnect();
        nodes.masterGainNode.disconnect();
        nodes.ambientRainGain.disconnect();
        nodes.ambientThunderGain.disconnect();
        nodes.ambientVinylGain.disconnect();

        if (nodes.audioContext.state !== "closed") {
          nodes.audioContext.close();
        }
      } catch (err) {
        console.warn("Audio teardown warning:", err);
      }
    }