/**
 * Logarithmic Gain Staging & Crossfade Architecture (lib/audio/gainCurves.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Hardware Target: Web Audio API GainNode Staging
 * 
 * Invariants:
 * - Human auditory loudness perception is logarithmic, not linear.
 * - Linear slider values [0.0, 1.0] are mapped quadratically: Gain = (Volume)^2.
 * - All gain parameter automation utilizes cancelScheduledValues and smooth ramps.
 * - 150ms automated crossfade prevents audio pops when switching tracks.
 * - Zero 'any' types, zero stub implementations.
 */

/**
 * Converts a linear volume slider input (0.0 to 1.0) into perceptual acoustic power.
 * Implements the quadratic perceptual curve: Gain = Volume^2.
 * 
 * @param sliderValue Linear slider input from UI controls (0.0 to 1.0)
 * @returns Perceptual gain value safely clamped between 0.0 and 1.0
 */
export function calculatePerceptualGain(sliderValue: number): number {
  if (isNaN(sliderValue)) return 0;
  const clamped = Math.max(0, Math.min(1, sliderValue));
  return clamped * clamped;
}

/**
 * Functional alias matching TASK_RUNBOOK specification.
 */
export const linearToLogGain = calculatePerceptualGain;

/**
 * Converts acoustic gain back to linear slider position for UI synchronization.
 * Inverse function: Volume = sqrt(Gain).
 * 
 * @param gainValue Perceptual gain value (0.0 to 1.0)
 * @returns Linear slider coordinate (0.0 to 1.0)
 */
export function calculateLinearVolume(gainValue: number): number {
  if (isNaN(gainValue)) return 0;
  const clamped = Math.max(0, Math.min(1, gainValue));
  return Math.sqrt(clamped);
}

/**
 * Smoothly ramps a GainNode to a new target volume over a specified time interval.
 * Cancels pending scheduled values and anchors the starting value to prevent digital pops.
 * 
 * @param gainNode Target Web Audio GainNode
 * @param targetSliderVolume Target linear volume level (0.0 to 1.0)
 * @param durationSeconds Transition duration in seconds (e.g. 0.05 for 50ms)
 * @param ctx Active AudioContext instance
 */
export function rampGain(
  gainNode: GainNode,
  targetSliderVolume: number,
  durationSeconds: number,
  ctx: AudioContext
): void {
  const targetGain = calculatePerceptualGain(targetSliderVolume);
  const now = ctx.currentTime;

  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);

  if (targetGain <= 0.0001) {
    gainNode.gain.linearRampToValueAtTime(0, now + durationSeconds);
  } else {
    gainNode.gain.linearRampToValueAtTime(targetGain, now + durationSeconds);
  }
}

/**
 * Executes a de-clicked track transition crossfade:
 * 1. Fades out active track over 150ms using linear gain ramp to 0.001.
 * 2. Swaps the audio element source URL and initiates playback.
 * 3. Fades in the incoming track over 200ms up to target master volume.
 * 
 * @param masterGain Master GainNode of the music bus
 * @param audioElement Master HTML5 audio element
 * @param nextTrackUrl Supabase Storage public URL of the incoming track
 * @param targetVolume Linear target volume for incoming track (0.0 to 1.0)
 * @param ctx Active AudioContext instance
 * @returns Promise resolving when crossfade sequence completes
 */
export function crossfadeTrack(
  masterGain: GainNode,
  audioElement: HTMLAudioElement,
  nextTrackUrl: string,
  targetVolume: number,
  ctx: AudioContext
): Promise<void> {
  return new Promise((resolve) => {
    // 0. Ensure AudioContext is actively running
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const targetGain = calculatePerceptualGain(targetVolume);

    // 1. Cancel existing automation and anchor current gain
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);

    // 2. Fade out active track over 150ms to near-silence (0.001)
    const fadeOutDuration = 0.15;
    masterGain.gain.linearRampToValueAtTime(0.001, now + fadeOutDuration);

    setTimeout(() => {
      // 3. Swap audio source URL on the underlying media element
      audioElement.src = nextTrackUrl;
      audioElement.load();

      const playPromise = audioElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 4. Fade in incoming track over 200ms
            const resumeTime = ctx.currentTime;

            masterGain.gain.cancelScheduledValues(resumeTime);
            masterGain.gain.setValueAtTime(0.001, resumeTime);
            masterGain.gain.linearRampToValueAtTime(targetGain, resumeTime + 0.20);
            resolve();
          })
          .catch((err: unknown) => {
            console.warn("[Solitude AudioEngine] Crossfade playback trigger rejected:", err);
            // Fallback: Instantly restore master gain to target volume to prevent silent audio trap
            const fallbackTime = ctx.currentTime;
            masterGain.gain.cancelScheduledValues(fallbackTime);
            masterGain.gain.setValueAtTime(targetGain, fallbackTime);
            resolve();
          });
      } else {
        const fallbackTime = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(fallbackTime);
        masterGain.gain.setValueAtTime(targetGain, fallbackTime);
        resolve();
      }
    }, fadeOutDuration * 1000);
  });
}

/**
 * Functional alias matching AUDIO_ENGINE specification.
 */
export const executeTrackCrossfade = crossfadeTrack;
