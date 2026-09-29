/**
 * AudioContext Singleton Provider & Mobile Hardware Unlocker (lib/audio/audioContext.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Hardware Target: Web Audio API (Desktop browsers, iOS Safari, Android WebKit)
 * 
 * Invariants:
 * - Single persistent AudioContext instance in module memory.
 * - Strict SSR runtime guard preventing server-side instantiation errors.
 * - 1-sample silent PCM buffer dispatch to liberate iOS/mobile hardware audio.
 * - Zero 'any' types, zero stub implementations.
 */

interface WebAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

let globalAudioContext: AudioContext | null = null;
let audioUnlocked = false;

/**
 * Validates execution inside browser client runtime.
 * Throws a descriptive architectural error if executed during SSR.
 */
function assertBrowserContext(): void {
  if (typeof window === "undefined") {
    throw new Error(
      "[Solitude AudioEngine] AudioContext cannot be instantiated on the server. Ensure audio modules are executed exclusively within client-side components ('use client')."
    );
  }
}

/**
 * Retrieves or lazily instantiates the browser-wide singleton AudioContext.
 * Handles both standard AudioContext and legacy webkitAudioContext.
 */
export function getAudioContext(): AudioContext {
  assertBrowserContext();

  if (globalAudioContext && globalAudioContext.state !== "closed") {
    return globalAudioContext;
  }

  const audioWin = window as unknown as WebAudioWindow;
  const AudioContextClass = window.AudioContext || audioWin.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error(
      "[Solitude AudioEngine] Web Audio API is not supported in this browser environment."
    );
  }

  globalAudioContext = new AudioContextClass({
    latencyHint: "interactive",
  });

  return globalAudioContext;
}

/**
 * Mobile Safari / WebKit Hardware Autoplay Unlocker.
 * 
 * On iOS and mobile Chromium browsers, AudioContext sits in a 'suspended' state
 * until a physical user gesture (click/touch/keypress) unlocks hardware routing.
 * Emits a 1-sample silent PCM buffer to satisfy OS audio daemons without audible pops.
 * 
 * @param ctx Optional target AudioContext. Defaults to the singleton instance.
 * @returns Promise resolving to boolean indicating if the context is running.
 */
export async function unlockAudioContext(ctx?: AudioContext): Promise<boolean> {
  assertBrowserContext();

  const targetCtx = ctx || getAudioContext();

  if (targetCtx.state === "suspended") {
    try {
      await targetCtx.resume();
    } catch (err) {
      console.warn("[Solitude AudioEngine] AudioContext resume gesture rejected:", err);
      return false;
    }
  }

  // Generate a 1-sample silent buffer to satisfy WebKit hardware routing
  try {
    const silentBuffer = targetCtx.createBuffer(1, 1, 22050);
    const source = targetCtx.createBufferSource();
    source.buffer = silentBuffer;
    source.connect(targetCtx.destination);
    source.start(0);

    audioUnlocked = targetCtx.state === "running";
    return audioUnlocked;
  } catch (err) {
    console.warn("[Solitude AudioEngine] Silent buffer unlock emission failed:", err);
    return targetCtx.state === "running";
  }
}

/**
 * Alias conforming to TRD & TROUBLESHOOTING specifications.
 */
export const unlockMobileAudio = unlockAudioContext;

/**
 * Inspects whether the hardware AudioContext has been unlocked by user gesture.
 */
export function isAudioUnlocked(): boolean {
  if (!globalAudioContext) {
    return false;
  }
  return globalAudioContext.state === "running" && audioUnlocked;
}

/**
 * Safely tears down and closes the hardware AudioContext.
 * Used during complete application teardown or testing reset.
 */
export async function closeAudioContext(): Promise<void> {
  if (globalAudioContext && globalAudioContext.state !== "closed") {
    try {
      await globalAudioContext.close();
    } catch (err) {
      console.warn("[Solitude AudioEngine] Error during AudioContext close:", err);
    } finally {
      globalAudioContext = null;
      audioUnlocked = false;
    }
  }
}
