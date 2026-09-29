/**
 * Timestamp & Duration Formatter Utility (lib/utils/formatTime.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Formats numeric seconds into zero-padded "mm:ss" timeline strings.
 */

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export const formatDuration = formatTime;
