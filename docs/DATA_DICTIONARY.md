# Database Schema & Data Dictionary Specification (DATA_DICTIONARY.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)  
Document Purpose: Exhaustive database dictionary, storage metadata definitions, realtime payloads, and client cache schema.  
Document Version: 2.0.0  
Target Environment: Google Antigravity IDE  

---

## 1. Relational Database Schema (public.songs)

Host Database: PostgreSQL 15 (Supabase Managed Instance)  
Access Pattern: Public Read-Only via PostgREST / Supabase Client SDK  
Write Protection: Row Level Security (RLS) denying all public writes.

### 1.1 Column Definitions

+--------------------+-------------+----------+-------------------------+----------------------------------------------+-------------------------------------------------------------+
| Column Name        | Data Type   | Nullable | Default Value           | Constraints & Validation                     | Description                                                 |
+--------------------+-------------+----------+-------------------------+----------------------------------------------+-------------------------------------------------------------+
| id                 | UUID        | No       | gen_random_uuid()       | Primary Key                                  | Canonical RFC 4122 unique track identifier.                 |
| track_order        | INTEGER     | No       | None                    | Unique, Check (track_order BETWEEN 1 AND 30) | Playback sequence ordering index (1 to 30).                 |
| title              | TEXT        | No       | None                    | Not Empty (length(trim(title)) > 0)          | Primary song title (e.g., "Raanjhan").                      |
| artist             | TEXT        | No       | None                    | Not Empty (length(trim(artist)) > 0)         | Credited singer(s), music director(s), and lyricist(s).     |
| duration_seconds   | INTEGER     | No       | None                    | Check (duration_seconds > 0)                 | Exact media playback duration in seconds.                   |
| audio_url          | TEXT        | No       | None                    | Valid HTTP/HTTPS URI format                  | Public Supabase Storage URL for 320kbps MP3 stream.         |
| cover_url          | TEXT        | No       | None                    | Valid HTTP/HTTPS URI format                  | Public Supabase Storage URL for 512x512 WebP cover image.   |
| shayari_quote      | TEXT        | Yes      | NULL                    | Max Length 280 characters                    | Curated Urdu/Hindi poetic thought displayed on vinyl deck.  |
| created_at         | TIMESTAMPTZ | No       | TIMEZONE('utc', NOW())  | Valid UTC Timestamp                          | Audit creation timestamp.                                   |
+--------------------+-------------+----------+-------------------------+----------------------------------------------+-------------------------------------------------------------+

---

## 2. Database Indexes & Query Optimization

+------------------------+--------------------+----------------------+---------------------------------------------------------------+
| Index Name             | Target Column(s)   | Index Type           | Purpose / Query Profile                                       |
+------------------------+--------------------+----------------------+---------------------------------------------------------------+
| songs_pkey             | id                 | B-tree (Unique)      | Primary key record lookup.                                    |
| idx_songs_track_order  | track_order ASC    | B-tree (Unique)      | Accelerates initial catalogue loading (ORDER BY track_order). |
| idx_songs_search       | title, artist      | GIN (to_tsvector)    | Full-text substring search optimization across metadata.      |
+------------------------+--------------------+----------------------+---------------------------------------------------------------+

---

## 3. Supabase Public Storage File Dictionary

Storage Engine: Supabase S3-Compatible Object Store  
CORS Directives: GET, HEAD with Accept-Ranges, Range, Content-Length.

### 3.1 Bucket Specifications

+--------------------+---------------+--------------------+------------------+-----------------------+-----------------------------------------------+
| Bucket Identifier  | Public Access | MIME Types Allowed | File Size Limit  | Key Pattern           | Description                                   |
+--------------------+---------------+--------------------+------------------+-----------------------+-----------------------------------------------+
| tracks             | Yes           | audio/mpeg         | 25 MB            | track-{001..030}.mp3  | Uncompressed 320kbps MP3 music files.         |
| covers             | Yes           | image/webp         | 5 MB             | cover-{001..030}.webp | 512x512 square album artwork.                 |
| ambient            | Yes           | audio/mpeg         | 15 MB            | {rain,thunder,vinyl}  | Continuous looping ambient soundboard stems.  |
+--------------------+---------------+--------------------+------------------+-----------------------+-----------------------------------------------+

---

## 4. Realtime Presence Ephemeral State Dictionary

Transport: Secure WebSockets (wss://)  
Channel Name: room:solitude-global  
Storage Footprint: In-memory distributed state (Zero PostgreSQL writes).

+-------------+---------+-----------------------------------------------------------------------------+
| Key         | Type    | Description                                                                 |
+-------------+---------+-----------------------------------------------------------------------------+
| userId      | string  | Anonymous ephemeral session identifier (user_ + base36 random string).      |
| joinedAt    | number  | Unix epoch millisecond timestamp marking session start.                     |
+-------------+---------+-----------------------------------------------------------------------------+

---

## 5. Client LocalStorage Key-Value Dictionary

Domain: Client Web Browser Sandbox  
Storage Overhead: < 2 KB total.

+--------------------------+---------+---------------+---------------+---------------------------------------------------------+
| Key                      | Type    | Default Value | Serialization | Functional Purpose                                      |
+--------------------------+---------+---------------+---------------+---------------------------------------------------------+
| solitude:volume          | number  | 0.85          | Float string  | Master output volume level (0.00 to 1.00).               |
| solitude:lofi            | boolean | false         | "true"/"false"| Persisted state of the 850 Hz low-pass filter.          |
| solitude:lighting        | string  | "candle"      | Plain string  | Active environmental theme (candle/midnight/rain/void). |
| solitude:ambient_rain    | number  | 0.40          | Float string  | Volume level of rain soundboard fader.                  |
| solitude:ambient_thunder | number  | 0.20          | Float string  | Volume level of thunder soundboard fader.               |
| solitude:ambient_vinyl   | number  | 0.30          | Float string  | Volume level of vinyl crackle soundboard fader.         |
| solitude:last_track      | number  | 1             | Integer string| Last active track order index (1 to 30).                |
+--------------------------+---------+---------------+---------------+---------------------------------------------------------+