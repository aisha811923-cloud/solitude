# Supabase Storage Architecture & Public Configuration (SUPABASE_STORAGE.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Definitive guide for configuring Supabase Storage buckets, public read policies, CORS rules, and asset delivery pipelines for 30 uncompressed tracks.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Storage Buckets Hierarchy

Three dedicated public buckets are required within your Supabase project:

+----------------+--------------+------------------+-----------------------------------------------+
| Bucket Name    | Visibility   | Allowed MIME     | Contents & Size Ceiling                       |
+----------------+--------------+------------------+-----------------------------------------------+
| `tracks`       | Public       | audio/mpeg       | 30 uncompressed 320kbps MP3s (~225 MB total)  |
| `covers`       | Public       | image/webp, jpeg | 30 WebP album thumbnails (~15 MB total)       |
| `ambient`      | Public       | audio/mpeg       | 3 continuous looping stems (~20 MB total)     |
+----------------+--------------+------------------+-----------------------------------------------+

* Total Footprint: ~260 MB (Comfortably fits inside Supabase's 1 GB free allocation).

---

## 2. Bucket Creation & Public Policies (SQL)

Execute the following script in your Supabase SQL Editor to initialize all buckets and set public read policies:

```sql
-- Create buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('tracks', 'tracks', true, 26214400, ARRAY['audio/mpeg', 'audio/mp3']),
  ('covers', 'covers', true, 5242880, ARRAY['image/webp', 'image/jpeg', 'image/png']),
  ('ambient', 'ambient', true, 15728640, ARRAY['audio/mpeg', 'audio/mp3'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable Public Read Access for Objects
CREATE POLICY "Public Read Access on Tracks"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tracks');

CREATE POLICY "Public Read Access on Covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Public Read Access on Ambient"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ambient');
3. Storage CORS Configuration (Web Audio & Range Seeking)
To allow the browser Web Audio API (AudioContext.createMediaElementSource()) and timeline scrub bar to stream audio without security blocks or Range header errors, open CORS directives must be applied.

3.1 CORS Configuration File (cors.json)
JSON
[
  {
    "Origin": ["*"],
    "Method": ["GET", "HEAD"],
    "ResponseHeader": [
      "Content-Type",
      "Range",
      "Accept-Ranges",
      "Content-Range",
      "Content-Length",
      "ETag"
    ],
    "MaxAgeSeconds": 86400
  }
]
3.2 Applying CORS via Supabase CLI
Run from your terminal in the root directory:

Bash
supabase storage cors add cors.json
4. File Naming Conventions & Organization
Files within buckets must strictly adhere to zero-padded 3-digit identifiers:

4.1 Bucket: tracks/
track-001.mp3 -> Raanjhan

track-002.mp3 -> Finding Her (Slowed + Reverb)

track-003.mp3 -> Saiyaara

...

track-030.mp3 -> Ae Dil Hai Mushkil Title Track

4.2 Bucket: covers/
cover-001.webp (512x512, ~120 KB WebP)

cover-002.webp

...

cover-030.webp

4.3 Bucket: ambient/
rain.mp3 (Gentle rain against window glass, 60s seamless loop)

thunder.mp3 (Low atmospheric rumble, 90s loop)

vinyl.mp3 (Analog needle crackle and surface friction, 45s loop)

5. Client-Side Public URL Resolvers (lib/supabase/storage.ts)
TypeScript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getTrackAudioUrl(trackOrder: number): string {
  const padded = String(trackOrder).padStart(3, "0");
  const { data } = supabase.storage.from("tracks").getPublicUrl(`track-${padded}.mp3`);
  return data.publicUrl;
}

export function getCoverImageUrl(trackOrder: number): string {
  const padded = String(trackOrder).padStart(3, "0");
  const { data } = supabase.storage.from("covers").getPublicUrl(`cover-${padded}.webp`);
  return data.publicUrl;
}

export function getAmbientStemUrl(stemName: "rain" | "thunder" | "vinyl"): string {
  const { data } = supabase.storage.from("ambient").getPublicUrl(`${stemName}.mp3`);
  return data.publicUrl;
}
6. HTTP 206 Partial Content Verification
To confirm that byte-range requests and audio scrubbing work properly against Supabase Storage, run this verification curl command:

Bash
curl -I -H "Range: bytes=0-1024" https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-001.mp3
Expected Response Headers:
HTTP/2 206 Partial Content (or HTTP/1.1 206 Partial Content)

accept-ranges: bytes

content-range: bytes 0-1024/[total-file-size]

access-control-allow-origin: *