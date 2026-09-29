/**
 * Lo-Fi BiquadFilterNode DSP Subsystem (lib/audio/filterNode.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * DSP Topology: 2nd Order Butterworth Low-Pass Filter
 * 
 * Acoustic Profile:
 * - Emulates acoustic wall transmission ("playing from another room").
 * - Cutoff Frequency: 850 Hz (passes vocal warmth 100-300Hz, attenuates treble at -12dB/octave).
 * - Resonance (Q Factor): 3.5 (+3.2 dB boundary resonance spike).
 * - Scheduled parameter sweeps using exponential curves to eliminate digital popping.
 * 
 * Zero 'any', zero placeholders, strictly typed.
 */

export const LOFI_DSP_CONFIG = {
  BYPASS_FREQUENCY: 20000,
  LOFI_FREQUENCY: 850,
  BYPASS_Q: 0.707,
  LOFI_Q: 3.5,
  ACTIVATE_RAMP_SECONDS: 0.28,   // 280ms transition
  DEACTIVATE_RAMP_SECONDS: 0.20, // 200ms transition
} as const;

/**
 * Creates and initializes a persistent BiquadFilterNode in transparent bypass mode.
 * 
 * @param ctx Active AudioContext instance
 * @returns Configured BiquadFilterNode
 */
export function createLoFiFilter(ctx: AudioContext): BiquadFilterNode {
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";

  const now = ctx.currentTime;
  filter.frequency.setValueAtTime(LOFI_DSP_CONFIG.BYPASS_FREQUENCY, now);
  filter.Q.setValueAtTime(LOFI_DSP_CONFIG.BYPASS_Q, now);

  return filter;
}

/**
 * Sweeps the BiquadFilterNode from transparent bypass into the 850 Hz Lo-Fi acoustic mode.
 * Uses exponential curve parameter scheduling to eliminate digital clicking artifacts.
 * 
 * @param filterNode Target BiquadFilterNode
 * @param ctx Active AudioContext instance
 */
export function activateLoFi(filterNode: BiquadFilterNode, ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Cancel prior scheduled curves before assigning new target ramps
  filterNode.frequency.cancelScheduledValues(now);
  filterNode.Q.cancelScheduledValues(now);

  filterNode.type = "lowpass";

  // Anchor current values in audio timeline (Web Audio specification requirement)
  const currentFreq = Math.max(filterNode.frequency.value, 10);
  filterNode.frequency.setValueAtTime(currentFreq, now);
  filterNode.frequency.exponentialRampToValueAtTime(
    LOFI_DSP_CONFIG.LOFI_FREQUENCY,
    now + LOFI_DSP_CONFIG.ACTIVATE_RAMP_SECONDS
  );

  filterNode.Q.setValueAtTime(filterNode.Q.value, now);
  filterNode.Q.linearRampToValueAtTime(
    LOFI_DSP_CONFIG.LOFI_Q,
    now + LOFI_DSP_CONFIG.ACTIVATE_RAMP_SECONDS
  );
}

/**
 * Sweeps the BiquadFilterNode from Lo-Fi muffled state back to transparent 20,000 Hz bypass.
 * 
 * @param filterNode Target BiquadFilterNode
 * @param ctx Active AudioContext instance
 */
export function deactivateLoFi(filterNode: BiquadFilterNode, ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Cancel prior scheduled curves before assigning new target ramps
  filterNode.frequency.cancelScheduledValues(now);
  filterNode.Q.cancelScheduledValues(now);

  // Anchor current values in audio timeline
  const currentFreq = Math.max(filterNode.frequency.value, 10);
  filterNode.frequency.setValueAtTime(currentFreq, now);
  filterNode.frequency.exponentialRampToValueAtTime(
    LOFI_DSP_CONFIG.BYPASS_FREQUENCY,
    now + LOFI_DSP_CONFIG.DEACTIVATE_RAMP_SECONDS
  );

  filterNode.Q.setValueAtTime(filterNode.Q.value, now);
  filterNode.Q.linearRampToValueAtTime(
    LOFI_DSP_CONFIG.BYPASS_Q,
    now + LOFI_DSP_CONFIG.DEACTIVATE_RAMP_SECONDS
  );
}

/**
 * Toggles Lo-Fi mode state with appropriate ramp execution.
 * 
 * @param filterNode Target BiquadFilterNode
 * @param active Whether Lo-Fi muffled mode should be active
 * @param ctx Active AudioContext instance
 */
export function setLoFiMode(filterNode: BiquadFilterNode, active: boolean, ctx: AudioContext): void {
  if (active) {
    activateLoFi(filterNode, ctx);
  } else {
    deactivateLoFi(filterNode, ctx);
  }
}
