/**
 * Master Web Audio API Engine & Playback Orchestrator (hooks/useAudioEngine.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Audio Pipeline: Native Web Audio API + HTML5 Audio Dual-Bus Architecture
 * 
 * Architectural Invariants:
 * - Persistent singleton AudioContext and HTMLAudioElement references across re-renders.
 * - Single-instance MediaElementAudioSourceNode creation guard (prevents InvalidStateError).
 * - Master Music Bus: MediaElementSource -> BiquadFilter -> AnalyserNode -> MasterGain -> destination.
 * - Ambient Soundboard Bus: Rain/Thunder/Vinyl stems bypass Lo-Fi filter directly to destination.
 * - Hardware Autoplay unlock on first user gesture (satisfies iOS Safari / mobile WebKit).
 * - Smooth 150ms crossfade on track transitions via gainCurves.ts.
 * - Zero 'any' types, zero stubs, complete production implementation.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { 
  Song, 
  PlaybackStatus, 
  AmbientStemKey, 
  AmbientState 
} from "@/types/contracts";
import { FALLBACK_TRACKS, AMBIENT_STEMS } from "@/lib/constants/tracks";
import { fetchSongs } from "@/lib/supabase/queries";
import { getAudioContext, unlockAudioContext } from "@/lib/audio/audioContext";
import { createLoFiFilter, setLoFiMode } from "@/lib/audio/filterNode";
import { 
  calculatePerceptualGain, 
  rampGain, 
  crossfadeTrack 
} from "@/lib/audio/gainCurves";

export interface UseAudioEngineReturn {
  // Catalogue & Active Track
  tracks: Song[];
  currentTrack: Song;
  currentTrackIndex: number;
  
  // Playback State
  playbackStatus: PlaybackStatus;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoFi: boolean;
  playbackError: string | null;

  // Ambient Soundboard State
  ambientVolumes: AmbientState;
  isAmbientMuted: boolean;

  // Web Audio Nodes (for visualizers & monitors)
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;

  // Master Playback Actions
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  selectTrack: (index: number, forcePlay?: boolean) => void;
  seek: (seconds: number) => void;
  seekRelative: (deltaSeconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleLoFi: () => void;

  // Ambient Soundboard Actions
  setAmbientVolume: (stem: AmbientStemKey, val: number) => void;
  toggleAmbientMute: (stem?: AmbientStemKey) => void;
  toggleMasterAmbientMute: () => void;
}

export function useAudioEngine(): UseAudioEngineReturn {
  // --------------------------------------------------------------------------
  // 1. STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [tracks, setTracks] = useState<Song[]>(FALLBACK_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>("STANDBY_SUSPENDED");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(FALLBACK_TRACKS[0].duration_seconds);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoFi, setIsLoFi] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Ambient Soundboard Independent Volumes
  const [ambientVolumes, setAmbientVolumes] = useState<AmbientState>({
    rainVolume: 0.40,
    thunderVolume: 0.20,
    vinylVolume: 0.30,
    isRainMuted: false,
    isThunderMuted: false,
    isVinylMuted: false,
  });
  const [isAmbientMuted, setIsAmbientMuted] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // 2. HARDWARE REFERENCES (Persistent Singletons)
  // --------------------------------------------------------------------------
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterAudioRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Ambient Audio Elements & Gain Nodes
  const ambientAudioRefs = useRef<Record<AmbientStemKey, HTMLAudioElement | null>>({
    rain: null,
    thunder: null,
    vinyl: null,
  });
  const ambientGainRefs = useRef<Record<AmbientStemKey, GainNode | null>>({
    rain: null,
    thunder: null,
    vinyl: null,
  });
  const storedAmbientVolumesRef = useRef<Record<AmbientStemKey, number>>({
    rain: 0.40,
    thunder: 0.20,
    vinyl: 0.30,
  });

  // Internal flags to eliminate race conditions
  const isTransitioningRef = useRef<boolean>(false);
  const lastTimeUpdateRef = useRef<number>(0);
  const previousVolumeRef = useRef<number>(0.85);
  const volumeRef = useRef<number>(0.85);
  const isMutedRef = useRef<boolean>(false);
  const wasPlayingRef = useRef<boolean>(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isEndedRef = useRef<boolean>(false);

  const currentTrack = tracks[currentTrackIndex] || FALLBACK_TRACKS[0];

  // Helper: Restores master gain to current active volume level
  const restoreMasterGain = useCallback((rampDuration = 0.04): void => {
    const gain = masterGainRef.current;
    const ctx = audioContextRef.current;
    if (!gain || !ctx) return;

    const targetSlider = isMutedRef.current ? 0 : volumeRef.current;
    rampGain(gain, targetSlider, rampDuration, ctx);
  }, []);

  // --------------------------------------------------------------------------
  // 3. INITIALIZATION & GRAPH WIRING
  // --------------------------------------------------------------------------
  useEffect(() => {
    // 3.1 Fetch catalogue asynchronously with offline fallback
    let isMounted = true;
    fetchSongs()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setTracks(data);
          setDuration(data[0].duration_seconds);
        }
      })
      .catch((err: unknown) => {
        console.warn("[Solitude AudioEngine] Catalogue load failed, running on fallback:", err);
      });

    // 3.2 Initialize Hardware AudioContext
    let ctx: AudioContext;
    try {
      ctx = getAudioContext();
      audioContextRef.current = ctx;
    } catch (err: unknown) {
      console.warn("[Solitude AudioEngine] AudioContext initialization deferred:", err);
      return;
    }

    // 3.3 Instantiate Master HTML5 Audio Element
    if (!masterAudioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";
      audio.src = FALLBACK_TRACKS[0].audio_url;
      masterAudioRef.current = audio;
    }
    const masterAudio = masterAudioRef.current;

    // 3.4 Wire Master Music Bus (Single-time connection)
    if (!sourceNodeRef.current && masterAudio) {
      try {
        const sourceNode = ctx.createMediaElementSource(masterAudio);
        const filterNode = createLoFiFilter(ctx);
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 64;
        analyserNode.smoothingTimeConstant = 0.85;

        const masterGainNode = ctx.createGain();
        masterGainNode.gain.setValueAtTime(calculatePerceptualGain(0.85), ctx.currentTime);

        // Routing: Source -> Filter -> Analyser -> Master Gain -> Destination
        sourceNode.connect(filterNode);
        filterNode.connect(analyserNode);
        analyserNode.connect(masterGainNode);
        masterGainNode.connect(ctx.destination);

        sourceNodeRef.current = sourceNode;
        filterNodeRef.current = filterNode;
        analyserNodeRef.current = analyserNode;
        masterGainRef.current = masterGainNode;
      } catch (err: unknown) {
        console.warn("[Solitude AudioEngine] Web Audio master graph wiring warning:", err);
      }
    }

    // 3.5 Wire Ambient Soundboard Bus (Direct to destination)
    const stems: AmbientStemKey[] = ["rain", "thunder", "vinyl"];
    stems.forEach((stem) => {
      if (!ambientAudioRefs.current[stem]) {
        const ambAudio = new Audio();
        ambAudio.crossOrigin = "anonymous";
        ambAudio.loop = true;
        ambAudio.preload = "auto";
        ambAudio.src = AMBIENT_STEMS[stem];
        ambientAudioRefs.current[stem] = ambAudio;

        try {
          const ambSource = ctx.createMediaElementSource(ambAudio);
          const ambGain = ctx.createGain();
          
          const initialVol = stem === "rain" ? 0.40 : stem === "thunder" ? 0.20 : 0.30;
          ambGain.gain.setValueAtTime(calculatePerceptualGain(initialVol), ctx.currentTime);
          
          ambSource.connect(ambGain);
          ambGain.connect(ctx.destination);
          
          ambientGainRefs.current[stem] = ambGain;
        } catch (err: unknown) {
          console.warn(`[Solitude AudioEngine] Ambient stem [${stem}] wiring warning:`, err);
        }
      }
    });

    // 3.6 HTML5 Media Event Listeners
    const handleTimeUpdate = () => {
      const now = performance.now();
      // Throttle React state updates to 4 Hz (250ms) to conserve CPU cycles
      if (now - lastTimeUpdateRef.current >= 250) {
        setCurrentTime(masterAudio.currentTime);
        lastTimeUpdateRef.current = now;
      }
    };

    const handleDurationChange = () => {
      if (!isNaN(masterAudio.duration) && masterAudio.duration > 0) {
        setDuration(masterAudio.duration);
      }
    };

    const handleWaiting = () => {
      setPlaybackStatus("BUFFERING");
    };

    const handlePlaying = () => {
      setPlaybackStatus("PLAYING");
      setPlaybackError(null);
      wasPlayingRef.current = true;

      // Ensure master gain is unmuted and set to current target volume
      const gain = masterGainRef.current;
      const actx = audioContextRef.current;
      if (gain && actx) {
        const targetVol = isMutedRef.current ? 0 : volumeRef.current;
        rampGain(gain, targetVol, 0.04, actx);
      }
    };

    const handlePause = () => {
      if (!isTransitioningRef.current && !isEndedRef.current) {
        setPlaybackStatus("PAUSED");
      }
    };

    const handleError = () => {
      const err = masterAudio.error;
      const message = err ? `Media Error code ${err.code}: ${err.message}` : "Playback failure";
      setPlaybackError(message);
      setPlaybackStatus("ERROR");
      wasPlayingRef.current = false;
    };

    masterAudio.addEventListener("timeupdate", handleTimeUpdate);
    masterAudio.addEventListener("durationchange", handleDurationChange);
    masterAudio.addEventListener("waiting", handleWaiting);
    masterAudio.addEventListener("playing", handlePlaying);
    masterAudio.addEventListener("pause", handlePause);
    masterAudio.addEventListener("error", handleError);

    // 3.7 Teardown & Resource Deallocation
    return () => {
      isMounted = false;
      masterAudio.removeEventListener("timeupdate", handleTimeUpdate);
      masterAudio.removeEventListener("durationchange", handleDurationChange);
      masterAudio.removeEventListener("waiting", handleWaiting);
      masterAudio.removeEventListener("playing", handlePlaying);
      masterAudio.removeEventListener("pause", handlePause);
      masterAudio.removeEventListener("error", handleError);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 4. AUTOPLAY & HARDWARE UNLOCK HELPER
  // --------------------------------------------------------------------------
  const ensureHardwareUnlocked = useCallback(async (): Promise<boolean> => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = getAudioContext();
      } catch {
        return false;
      }
    }
    return await unlockAudioContext(audioContextRef.current);
  }, []);

  // --------------------------------------------------------------------------
  // 5. MASTER PLAYBACK CONTROLS
  // --------------------------------------------------------------------------
  const play = useCallback(async (): Promise<void> => {
    // 1. Cancel any pending pause timeout immediately
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    await ensureHardwareUnlocked();
    const audio = masterAudioRef.current;
    const ctx = audioContextRef.current;
    if (!audio) return;

    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (err: unknown) {
        console.warn("[Solitude AudioEngine] AudioContext resume failed:", err);
      }
    }

    // 2. Pre-stage master gain to target volume before playback begins
    restoreMasterGain(0.04);

    try {
      setPlaybackStatus("BUFFERING");
      await audio.play();
      setPlaybackStatus("PLAYING");
      wasPlayingRef.current = true;

      // 3. Re-assert master gain once play succeeds
      restoreMasterGain(0.04);

      // Start ambient loops in background if not already playing
      (["rain", "thunder", "vinyl"] as AmbientStemKey[]).forEach((stem) => {
        const amb = ambientAudioRefs.current[stem];
        if (amb && amb.paused) {
          amb.play().catch(() => {});
        }
      });
    } catch (err: unknown) {
      console.warn("[Solitude AudioEngine] Play request rejected:", err);
      setPlaybackStatus("PAUSED");
      wasPlayingRef.current = false;
    }
  }, [ensureHardwareUnlocked, restoreMasterGain]);

  const pause = useCallback((): void => {
    const audio = masterAudioRef.current;
    if (!audio) return;

    wasPlayingRef.current = false;

    // Clear any previous pending pause timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    const gain = masterGainRef.current;
    const ctx = audioContextRef.current;

    // Smooth 50ms gain ramp to 0 to prevent audio clicks on pause
    if (gain && ctx && ctx.state === "running") {
      rampGain(gain, 0, 0.05, ctx);
      pauseTimeoutRef.current = setTimeout(() => {
        audio.pause();
        setPlaybackStatus("PAUSED");
        pauseTimeoutRef.current = null;
      }, 50);
    } else {
      audio.pause();
      setPlaybackStatus("PAUSED");
    }
  }, []);

  const togglePlay = useCallback((): void => {
    if (playbackStatus === "PLAYING") {
      pause();
    } else {
      play();
    }
  }, [playbackStatus, play, pause]);

  // --------------------------------------------------------------------------
  // 6. TRACK NAVIGATION & SELECTION (150ms Crossfade)
  // --------------------------------------------------------------------------
  const selectTrack = useCallback((index: number, forcePlay = false): void => {
    if (index < 0 || index >= tracks.length || index === currentTrackIndex) return;

    const nextSong = tracks[index];
    const audio = masterAudioRef.current;
    const gain = masterGainRef.current;
    const ctx = audioContextRef.current;

    if (!audio || !nextSong) return;

    // Cancel any pending pause timeouts
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    isTransitioningRef.current = true;
    setCurrentTrackIndex(index);
    setDuration(nextSong.duration_seconds);
    setCurrentTime(0);

    const shouldPlay = forcePlay || playbackStatus === "PLAYING" || wasPlayingRef.current;

    if (shouldPlay && gain && ctx) {
      setPlaybackStatus("CROSSFADING");
      const targetVol = isMutedRef.current ? 0 : volumeRef.current;
      crossfadeTrack(gain, audio, nextSong.audio_url, targetVol, ctx)
        .then(() => {
          isTransitioningRef.current = false;
          setPlaybackStatus("PLAYING");
          wasPlayingRef.current = true;
          restoreMasterGain(0.04);
        })
        .catch(() => {
          isTransitioningRef.current = false;
          setPlaybackStatus("PLAYING");
          wasPlayingRef.current = true;
          restoreMasterGain(0.04);
        });
    } else {
      audio.src = nextSong.audio_url;
      audio.load();
      isTransitioningRef.current = false;
      setPlaybackStatus("PAUSED");
      restoreMasterGain(0.04);
    }
  }, [tracks, currentTrackIndex, playbackStatus, restoreMasterGain]);

  const nextTrack = useCallback((): void => {
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    selectTrack(nextIdx);
  }, [currentTrackIndex, tracks.length, selectTrack]);

  const prevTrack = useCallback((): void => {
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(prevIdx);
  }, [currentTrackIndex, tracks.length, selectTrack]);

  // Auto-advance to next song on track completion
  useEffect(() => {
    const audio = masterAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      isEndedRef.current = true;
      wasPlayingRef.current = true;
      nextTrack();
      setTimeout(() => {
        isEndedRef.current = false;
      }, 300);
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [nextTrack]);

  // --------------------------------------------------------------------------
  // 7. TIMELINE SEEKING
  // --------------------------------------------------------------------------
  const seek = useCallback((seconds: number): void => {
    const audio = masterAudioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(seconds, duration));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const seekRelative = useCallback((deltaSeconds: number): void => {
    const audio = masterAudioRef.current;
    if (!audio) return;
    seek(audio.currentTime + deltaSeconds);
  }, [seek]);

  // --------------------------------------------------------------------------
  // 8. VOLUME & MUTE CONTROLS
  // --------------------------------------------------------------------------
  const setVolume = useCallback((val: number): void => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (isMuted) {
      setIsMuted(false);
      isMutedRef.current = false;
    }

    if (masterGainRef.current && audioContextRef.current) {
      rampGain(masterGainRef.current, clamped, 0.04, audioContextRef.current);
    }
  }, [isMuted]);

  const toggleMute = useCallback((): void => {
    if (!masterGainRef.current || !audioContextRef.current) return;

    if (isMuted) {
      // Unmute: Restore previous volume
      setIsMuted(false);
      isMutedRef.current = false;
      rampGain(masterGainRef.current, previousVolumeRef.current, 0.05, audioContextRef.current);
    } else {
      // Mute: Store current volume, ramp to 0
      previousVolumeRef.current = volume;
      setIsMuted(true);
      isMutedRef.current = true;
      rampGain(masterGainRef.current, 0, 0.05, audioContextRef.current);
    }
  }, [isMuted, volume]);

  // --------------------------------------------------------------------------
  // 9. LO-FI DSP FILTER TOGGLE
  // --------------------------------------------------------------------------
  const toggleLoFi = useCallback((): void => {
    const filter = filterNodeRef.current;
    const ctx = audioContextRef.current;
    if (!filter || !ctx) return;

    const nextState = !isLoFi;
    setIsLoFi(nextState);
    setLoFiMode(filter, nextState, ctx);
  }, [isLoFi]);

  // --------------------------------------------------------------------------
  // 10. AMBIENT SOUNDBOARD CONTROLS (Decoupled Weather Bus)
  // --------------------------------------------------------------------------
  const toggleMasterAmbientMute = useCallback((): void => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (!isAmbientMuted) {
      // 1. Muting all ambient stems: Store current levels before ramping
      storedAmbientVolumesRef.current = {
        rain: ambientVolumes.isRainMuted ? 0 : ambientVolumes.rainVolume,
        thunder: ambientVolumes.isThunderMuted ? 0 : ambientVolumes.thunderVolume,
        vinyl: ambientVolumes.isVinylMuted ? 0 : ambientVolumes.vinylVolume,
      };
      setIsAmbientMuted(true);

      // Smoothly ramp all 3 ambient gain nodes down to 0 over 100ms without pausing audio elements
      (["rain", "thunder", "vinyl"] as AmbientStemKey[]).forEach((stem) => {
        const gainNode = ambientGainRefs.current[stem];
        if (gainNode) {
          rampGain(gainNode, 0, 0.10, ctx);
        }
      });
    } else {
      // 2. Unmuting all ambient stems: Restore stored volume values over 100ms
      setIsAmbientMuted(false);
      const stored = storedAmbientVolumesRef.current;
      (["rain", "thunder", "vinyl"] as AmbientStemKey[]).forEach((stem) => {
        const gainNode = ambientGainRefs.current[stem];
        if (gainNode) {
          const isChannelMuted = ambientVolumes[`is${stem.charAt(0).toUpperCase() + stem.slice(1)}Muted` as keyof AmbientState];
          const restoreVol = isChannelMuted ? 0 : (stored[stem] ?? (ambientVolumes[`${stem}Volume` as keyof AmbientState] as number));
          rampGain(gainNode, restoreVol, 0.10, ctx);
        }
      });
    }
  }, [isAmbientMuted, ambientVolumes]);

  const toggleAmbientMute = useCallback((stem?: AmbientStemKey): void => {
    if (!stem) {
      toggleMasterAmbientMute();
      return;
    }

    const gainNode = ambientGainRefs.current[stem];
    const ctx = audioContextRef.current;
    if (!gainNode || !ctx) return;

    setAmbientVolumes((prev) => {
      const isMutedKey = `is${stem.charAt(0).toUpperCase() + stem.slice(1)}Muted` as keyof AmbientState;
      const volKey = `${stem}Volume` as keyof AmbientState;
      const currentlyMuted = prev[isMutedKey] as boolean;
      const targetVolume = currentlyMuted ? (prev[volKey] as number) : 0;

      if (!isAmbientMuted) {
        rampGain(gainNode, targetVolume, 0.05, ctx);
      }

      return {
        ...prev,
        [isMutedKey]: !currentlyMuted,
      };
    });
  }, [toggleMasterAmbientMute, isAmbientMuted]);

  const setAmbientVolume = useCallback((stem: AmbientStemKey, val: number): void => {
    const clamped = Math.max(0, Math.min(1, val));
    setAmbientVolumes((prev) => ({
      ...prev,
      [`${stem}Volume`]: clamped,
      [`is${stem.charAt(0).toUpperCase() + stem.slice(1)}Muted`]: false,
    }));
    storedAmbientVolumesRef.current[stem] = clamped;

    const gainNode = ambientGainRefs.current[stem];
    const ctx = audioContextRef.current;
    if (gainNode && ctx) {
      if (isAmbientMuted) {
        setIsAmbientMuted(false);
      }
      rampGain(gainNode, clamped, 0.04, ctx);
    }
  }, [isAmbientMuted]);

  return {
    tracks,
    currentTrack,
    currentTrackIndex,
    playbackStatus,
    isPlaying: playbackStatus === "PLAYING",
    isBuffering: playbackStatus === "BUFFERING" || playbackStatus === "CROSSFADING",
    currentTime,
    duration,
    volume,
    isMuted,
    isLoFi,
    playbackError,
    ambientVolumes,
    isAmbientMuted,
    audioContext: audioContextRef.current,
    analyserNode: analyserNodeRef.current,
    play,
    pause,
    togglePlay,
    nextTrack,
    prevTrack,
    selectTrack,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    toggleLoFi,
    setAmbientVolume,
    toggleAmbientMute,
    toggleMasterAmbientMute,
  };
}
