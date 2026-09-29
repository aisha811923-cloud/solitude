/**
 * Ambisonic Weather Channel Metadata & Definitions (lib/constants/ambient.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Defines canonical metadata for rain, thunder, and vinyl ambient stems.
 */

import { AmbientStemKey, AmbientState } from "@/types/contracts";

export interface AmbientChannelConfig {
  key: AmbientStemKey;
  label: string;
  sublabel: string;
  volKey: keyof AmbientState;
  muteKey: keyof AmbientState;
}

export const AMBIENT_CHANNELS: AmbientChannelConfig[] = [
  {
    key: "rain",
    label: "Rain on Glass",
    sublabel: "Midnight window patter",
    volKey: "rainVolume",
    muteKey: "isRainMuted",
  },
  {
    key: "thunder",
    label: "Distant Thunder",
    sublabel: "Sub-bass rolling rumble",
    volKey: "thunderVolume",
    muteKey: "isThunderMuted",
  },
  {
    key: "vinyl",
    label: "Vinyl Crackle",
    sublabel: "Analog turntable dust",
    volKey: "vinylVolume",
    muteKey: "isVinylMuted",
  },
];
