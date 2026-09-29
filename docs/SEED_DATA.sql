-- ============================================================================
-- Solitude Database Schema & 30 Curated Sad Songs Seed Data (SEED_DATA.sql)
--
-- Target: Supabase (PostgreSQL 15)
-- Purpose: Schema definition, indexing, RLS security policies, and 30 curated tracks
-- ============================================================================

-- 1. CLEANUP & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS public.songs CASCADE;

-- 2. SCHEMA DEFINITION
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_order INT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration_seconds INT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  shayari_quote TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. INDEXING
CREATE INDEX idx_songs_track_order ON public.songs(track_order ASC);
CREATE INDEX idx_songs_search ON public.songs USING GIN (to_tsvector('english', title || ' ' || artist));

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on songs"
  ON public.songs
  FOR SELECT
  USING (true);

-- 5. SEED DATA (30 CURATED TRACKS) --[cite: 1]
-- Note: Replace [PROJECT_REF] with your Supabase project reference id.
INSERT INTO public.songs (track_order, title, artist, duration_seconds, audio_url, cover_url, shayari_quote)
VALUES
(
  1,
  'Raanjhan',
  'Sachet Tandon, Parampara Tandon',
  241,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-001.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-001.webp',
  'Raanjhan dhoondhan main chali, khud hi se ghum ho gayi...'
),
(
  2,
  'Finding Her (Slowed + Reverb)',
  'Kushagra, Vanshika Kashyap, Bharath',
  233,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-002.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-002.webp',
  'Kuch yaadein be-awaaz hoti hain, bas aankhon se beh jaati hain.'
),
(
  3,
  'Saiyaara',
  'Ek Tha Tiger / Saiyaara',
  371,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-003.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-003.webp',
  'Saiyaara tu toh sitaara bana, hum andheron mein bhatakte reh gaye.'
),
(
  4,
  'Sahiba',
  'Stebin Ben, Jasleen Royal',
  191,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-004.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-004.webp',
  'Sahiba agar milna likha na tha, toh yeh faasle itne haseen kyun banaaye?'
),
(
  5,
  'ISHQ (Slowed & Reverb)',
  'Faheem Abdullah, Rauhan Malik',
  273,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-005.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-005.webp',
  'Ishq woh aag hai jismein khamoshi sabse zyada shor machati hai.'
),
(
  6,
  'Ishq Hai',
  'Anurag Saikia',
  313,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-006.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-006.webp',
  'Tere bina har raat ek lambe intezaar jaisi lagti hai.'
),
(
  7,
  'Tum Hi Ho',
  'Arijit Singh (Aashiqui 2)',
  262,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-007.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-007.webp',
  'Tere bina ab jee na sakenge, khud se hi rooth baithe hain hum.'
),
(
  8,
  'AGAR TUM SAATH HO',
  'Alka Yagnik, Arijit Singh (Tamasha)',
  342,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-008.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-008.webp',
  'Pal bhar thehar jaao, yeh dard thoda aur sehne do.'
),
(
  9,
  'Tere Sang Yaara (Slowed + Reverb)',
  'Atif Aslam',
  302,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-009.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-009.webp',
  'Woh lamhe jo tere saath the, wahi meri aakhiri panah hain.'
),
(
  10,
  'Sunn Raha Hai',
  'Ankit Tiwari (Aashiqui 2)',
  391,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-010.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-010.webp',
  'Waqt ne cheen liya sab kuch, bas rone ka haq chhod diya.'
),
(
  11,
  'O Bedardeya (Film Version)',
  'Arijit Singh, Pritam (TJMM)',
  326,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-011.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-011.webp',
  'Humne toh dil diya tha, tune toh saansein hi cheen leen.'
),
(
  12,
  'Chahun Main Ya Naa',
  'Arijit Singh, Palak Muchhal (Aashiqui 2)',
  305,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-012.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-012.webp',
  'Tu bata de dil ki yeh uljhan, tujhe chahein ya khud ko bhula dein.'
),
(
  13,
  'Tum Hi Aana',
  'Jubin Nautiyal (Marjaavaan)',
  250,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-013.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-013.webp',
  'Maut bhi aa jaaye toh ruk jaayegi, bas tera aana zaroori hai.'
),
(
  14,
  'Bulleya',
  'Papon (Sultan)',
  186,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-014.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-014.webp',
  'Ranjhan de yaar bulleya, sun le meri fariyaad.'
),
(
  15,
  'Mere Rashke Qamar',
  'Nusrat Fateh Ali Khan, Rahat Fateh Ali Khan',
  221,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-015.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-015.webp',
  'Aankh jhuki toh qayamat huyi, aankh uthi toh fasana ban gaya.'
),
(
  16,
  'Zihaal e Miskin',
  'Vishal Mishra, Shreya Ghoshal',
  264,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-016.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-016.webp',
  'Zihaal-e-miskin makun baranjish, be-haal dil ki khabar lo.'
),
(
  17,
  'Lut Gaye',
  'Jubin Nautiyal',
  229,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-017.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-017.webp',
  'Ek pal mein sab lut gaya, jab se tune nazar pheri.'
),
(
  18,
  'KABHI JO BAADAL BARSE',
  'Arijit Singh (Jackpot)',
  255,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-018.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-018.webp',
  'Baarish ki har boond mein teri hi aahat mehsoos hoti hai.'
),
(
  19,
  'Zaroori Tha',
  'Rahat Fateh Ali Khan',
  343,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-019.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-019.webp',
  'Lafz kam pad gaye the us din, warna dard behisaab tha.'
),
(
  20,
  'Teri Deewani',
  'Kailash Kher',
  324,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-020.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-020.webp',
  'Ishq mein hum fanaa ho gaye, par tere deedar ko taras gaye.'
),
(
  21,
  'Bekhayali',
  'Sachet Tandon (Kabir Singh)',
  372,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-021.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-021.webp',
  'Bekhayali mein bhi tera hi khayal aaye, aisi aadat bana di tune.'
),
(
  22,
  'Hamari Adhuri Kahani (Title Track)',
  'Arijit Singh',
  399,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-022.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-022.webp',
  'Kahaani adhoori reh gayi, par zakham poore mil gaye.'
),
(
  23,
  'Phir Bhi Tumko Chaahunga',
  'Arijit Singh, Shashaa Tirupati',
  352,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-023.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-023.webp',
  'Marte dam tak yeh dil tera hi naam pukarega.'
),
(
  24,
  'Roke Na Ruke Naina',
  'Arijit Singh (Badrinath Ki Dulhania)',
  279,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-024.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-024.webp',
  'Koshish toh bohot ki rokne ki, par yeh naina baaghi nikle.'
),
(
  25,
  'Hasi (Male Version)',
  'Ami Mishra (Hamari Adhuri Kahani)',
  273,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-025.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-025.webp',
  'Kabhi kisi ki hasi ban kar jeene ka maza hi kuch aur tha.'
),
(
  26,
  'Jhol (Slowed + Reverb)',
  'Maanu x Annural Khalid (Coke Studio PK)',
  286,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-026.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-026.webp',
  'Dil ke jhol mein phans kar, hum khud ko hi haar baithe.'
),
(
  27,
  'Pal Pal',
  'Afusic / Ali Zafar',
  147,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-027.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-027.webp',
  'Pal pal guzar raha hai, bas ek tera saya peeche chhoot raha hai.'
),
(
  28,
  'Afsos',
  'PropheC',
  192,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-028.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-028.webp',
  'Afsos yeh nahi ki tum chali gayi, afsos yeh hai ki hum sambhal na sake.'
),
(
  29,
  'Taare',
  'Tanishk Bagchi',
  155,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-029.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-029.webp',
  'Tootte taare ko dekh kar manga tha tujhe, shayad dua hi tooti huyi thi.'
),
(
  30,
  'Ae Dil Hai Mushkil Title Track',
  'Arijit Singh, Pritam',
  270,
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/tracks/track-030.mp3',
  'https://[PROJECT_REF].supabase.co/storage/v1/object/public/covers/cover-030.webp',
  'Junoon hai mera banu main tere kabil, tere bina guzara ae dil hai mushkil.'
);

-- 6. VERIFICATION QUERY
SELECT track_order, title, artist, duration_seconds FROM public.songs ORDER BY track_order ASC;