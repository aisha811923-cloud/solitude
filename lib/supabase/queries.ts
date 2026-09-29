/**
 * Song Catalogue Queries with Resilient Fallback (lib/supabase/queries.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Backend Target: Supabase PostgreSQL (public.songs table)
 * 
 * Invariants:
 * - Single catalogue query executed on initial mount (ORDER BY track_order ASC).
 * - Zero unhandled UI exceptions on network disconnect or rate limits.
 * - Seamless fallback to canonical FALLBACK_TRACKS (30 curated tracks).
 * - Zero 'any' types, strictly typed against Database contracts.
 */

import { supabase } from "./client";
import { Song } from "@/types/contracts";
import { FALLBACK_TRACKS } from "@/lib/constants/tracks";

/**
 * Fetches the complete 30-track sad songs catalogue ordered sequentially.
 * If the database is unreachable, network is disconnected, or table is empty,
 * seamlessly falls back to the in-memory canonical manifest with zero UI disruption.
 * 
 * @returns Promise resolving to an array of 30 Song objects
 */
export async function fetchSongs(): Promise<Song[]> {
  try {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("track_order", { ascending: true });

    if (error) {
      console.warn(
        "[Solitude Supabase] Failed to fetch songs catalogue from database. Operating with offline fallback manifest:",
        error.message
      );
      return FALLBACK_TRACKS;
    }

    if (!data || data.length === 0) {
      console.info(
        "[Solitude Supabase] songs table is empty or unseeded. Operating with offline fallback manifest."
      );
      return FALLBACK_TRACKS;
    }

    return data as Song[];
  } catch (err) {
    console.warn(
      "[Solitude Supabase] Network exception while querying songs. Operating with offline fallback manifest:",
      err
    );
    return FALLBACK_TRACKS;
  }
}

/**
 * Retrieves a single track by its sequential order index (1 to 30).
 * 
 * @param trackOrder Sequential track number (1-30)
 * @returns Promise resolving to Song object or null if not found
 */
export async function fetchSongByOrder(trackOrder: number): Promise<Song | null> {
  try {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .eq("track_order", trackOrder)
      .single();

    if (error || !data) {
      const fallback = FALLBACK_TRACKS.find((t) => t.track_order === trackOrder);
      return fallback ?? null;
    }

    return data as Song;
  } catch (err) {
    console.warn(
      `[Solitude Supabase] Network exception fetching track order ${trackOrder}. Using fallback:`,
      err
    );
    const fallback = FALLBACK_TRACKS.find((t) => t.track_order === trackOrder);
    return fallback ?? null;
  }
}
