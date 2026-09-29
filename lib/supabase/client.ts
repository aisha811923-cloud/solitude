/**
 * Supabase Client Singleton Provider (lib/supabase/client.ts)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Backend Target: Supabase Managed Instance (PostgreSQL 15, Public Storage, Realtime)
 * 
 * Invariants:
 * - Singleton SupabaseClient typed against database schema contracts.
 * - Runtime assertion ensuring environment credentials are wired in .env.local.
 * - Zero 'any' types, production-ready configuration.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/contracts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Solitude Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
    "Verify that .env.local is present and properly configured in the project root."
  );
}

/**
 * Browser-safe Supabase client singleton configured with:
 * - Session persistence disabled (anonymous sanctuary mode).
 * - Realtime presence channel enabled.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
