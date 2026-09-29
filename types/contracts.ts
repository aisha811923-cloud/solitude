/**
 * Core Type Contracts & Domain Models (types/contracts.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Audio Engine: Native Web Audio API (Hardware DSP Pipeline)
 * Backend: Supabase (PostgreSQL 15, Storage, Realtime)
 * 
 * Zero any, zero placeholder stubs, complete production contracts.
 */

// ============================================================================
// 1. DOMAIN DATA MODELS (CATALOGUE & DATABASE)
// ============================================================================

export interface Song {
  id: string;
  track_order: number;
  title: string;
  artist: string;
  duration_seconds: number;
  audio_url: string;
  cover_url: string;
  shayari_quote: string | null;
  created_at: string;
}

export type SongInsert = Omit<Song, "id" | "created_at">;
export type SongUpdate = Partial<SongInsert>;

/**
 * Supabase Relational Database Schema Mapping
 */
export interface Database {
  public: {
    Tables: {
      songs: {
        Row: Song;
        Insert: SongInsert;
        Update: SongUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ============================================================================
// 2. AUDIO ENGINE & WEB AUDIO API CONTRACTS
// ============================================================================

export type AudioContextState = "suspended" | "running" | "closed";

export type PlaybackStatus = 
  | "STANDBY_SUSPENDED"
  | "BUFFERING"
  | "PLAYING"
  | "PAUSED"
  | "CROSSFADING"
  | "ERROR";

export type LoFiFilterStatus =
  | "BYPASS"
  | "RAMPING_TO_LOFI"
  | "ACTIVE_LOFI"
  | "RAMPING_TO_BYPASS";

export type AmbientStemKey = "rain" | "thunder" | "vinyl";

export interface AudioEngineNodes {
  audioContext: AudioContext;
  audioElement: HTMLAudioElement;
  sourceNode: MediaElementAudioSourceNode;
  filterNode: BiquadFilterNode;
  analyserNode: AnalyserNode;
  masterGainNode: GainNode;
  ambientRainGain: GainNode;
  ambientThunderGain: GainNode;
  ambientVinylGain: GainNode;
}

export interface AmbientAudioElements {
  rain: HTMLAudioElement | null;
  thunder: HTMLAudioElement | null;
  vinyl: HTMLAudioElement | null;
}

export interface PlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTrackIndex: number;
  currentTime: number;
  duration: number;
  volume: number; // Logarithmic mapping: 0.0 to 1.0
  isMuted: boolean;
  isLoFi: boolean; // Controls Biquad lowpass filter (850 Hz, Q = 3.5)
  playbackError: string | null;
  status: PlaybackStatus;
}

export interface AmbientState {
  rainVolume: number; // 0.0 to 1.0
  thunderVolume: number; // 0.0 to 1.0
  vinylVolume: number; // 0.0 to 1.0
  isRainMuted: boolean;
  isThunderMuted: boolean;
  isVinylMuted: boolean;
  isMasterMuted?: boolean;
}

export interface PlayerActions {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  selectTrack: (index: number, forcePlay?: boolean) => void;
  seek: (seconds: number) => void;
  seekRelative: (deltaSeconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleLoFi: () => void;
}

export interface AmbientActions {
  setRainVolume: (volume: number) => void;
  setThunderVolume: (volume: number) => void;
  setVinylVolume: (volume: number) => void;
  toggleRainMute: () => void;
  toggleThunderMute: () => void;
  toggleVinylMute: () => void;
  toggleAmbientMute?: (stem?: AmbientStemKey) => void;
  toggleMasterAmbientMute?: () => void;
}

// ============================================================================
// 3. UI, ATMOSPHERIC LIGHTING & INTERACTION CONTRACTS
// ============================================================================

export type LightingMode = "candle" | "midnight" | "rainy-dusk" | "void";

export interface LightingThemeTokens {
  mode: LightingMode;
  name: string;
  bgTint: string;
  vignetteGlow: string;
  accentAmber: string;
  isCandleLit: boolean;
  rainDensityMultiplier: number;
}

export interface UIState {
  isQueueOpen: boolean;
  isSoundboardOpen: boolean;
  isSearchFocused: boolean;
  searchQuery: string;
  activeLightingMode: LightingMode;
  isKeyboardHudVisible: boolean;
  isFirstGestureComplete: boolean;
}

export interface UIActions {
  setQueueOpen: (open: boolean) => void;
  toggleQueue: () => void;
  setSoundboardOpen: (open: boolean) => void;
  toggleSoundboard: () => void;
  setSearchFocused: (focused: boolean) => void;
  setSearchQuery: (query: string) => void;
  openAndFocusSearch: () => void;
  setLightingMode: (mode: LightingMode) => void;
  cycleLightingMode: () => void;
  setKeyboardHudVisible: (visible: boolean) => void;
  completeFirstGesture: () => void;
}

// ============================================================================
// 4. COMMUNAL PRESENCE & REALTIME CONTRACTS
// ============================================================================

export interface PresencePayload {
  userId: string;
  joinedAt: number;
  online_at?: number;
  user_id?: string;
}

export interface PresenceState {
  connectedSockets: number;
  circadianBaseline: number;
  displayCount: number;
  isConnected: boolean;
  lastSyncedAt: Date | null;
}

// ============================================================================
// 5. CANVAS 2D RAIN ENGINE CONTRACTS
// ============================================================================

export interface RainDrop {
  x: number;
  y: number;
  length: number;
  speedY: number;
  speedX: number;
  opacity: number;
  thickness: number;
}

export interface CondensationDroplet {
  x: number;
  y: number;
  radius: number;
  weight: number;
  slipThreshold: number;
  isSlipping: boolean;
  slipSpeed: number;
  trail: { x: number; y: number; radius: number; alpha: number }[];
}

export interface RainEngineConfig {
  dropCount: number;
  condensationCount: number;
  windShearX: number;
  minSpeed: number;
  maxSpeed: number;
}

// ============================================================================
// 6. KEYBOARD SHORTCUTS MATRIX
// ============================================================================

export type ShortcutKey = 
  | "Space"
  | "ArrowLeft"
  | "ArrowRight"
  | "KeyN"
  | "KeyP"
  | "KeyQ"
  | "KeyL"
  | "KeyM"
  | "Slash"
  | "Escape";

export interface KeycapVisualState {
  code: string;
  label: string;
  action: string;
  activeOverride?: boolean;
}

// ============================================================================
// 7. LOCAL STORAGE PERSISTENCE CONTRACT
// ============================================================================

export interface LocalStorageSettings {
  volume: number;
  isLoFi: boolean;
  lightingMode: LightingMode;
  ambientRainVolume: number;
  ambientThunderVolume: number;
  ambientVinylVolume: number;
  lastTrackIndex: number;
}
