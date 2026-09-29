# Progressive Web App & Offline Caching Specification (PWA_SPEC.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)  
Document Purpose: Service Worker lifecycle, Web App Manifest tokens, cache partitioning, background audio lockscreen integration, and offline fallback modes.  
Document Version: 2.0.0  
Target Environment: Google Antigravity IDE  

---

## 1. Web App Manifest (public/manifest.webmanifest)

    {
      "name": "Solitude - Midnight Sanctuary",
      "short_name": "Solitude",
      "description": "An intimate midnight sanctuary for sad songs, authentic Lo-Fi acoustics, and gentle rain.",
      "start_url": "/",
      "scope": "/",
      "display": "standalone",
      "orientation": "portrait-primary",
      "background_color": "#070B14",
      "theme_color": "#070B14",
      "lang": "en",
      "categories": ["music", "lifestyle", "mental-health"],
      "icons": [
        {
          "src": "/icons/icon-192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "/icons/icon-512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "/icons/icon-maskable-512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "maskable"
        }
      ],
      "shortcuts": [
        {
          "name": "Enter Sanctuary",
          "short_name": "Sanctuary",
          "description": "Immediately resume music playback",
          "url": "/?autoplay=true",
          "icons": [{ "src": "/icons/icon-192.png", "sizes": "192x192" }]
        }
      ]
    }

---

## 2. Service Worker Caching Strategies

Cache Storage is divided into distinct named caches to isolate critical UI shells from large media files:

    Cache Storage
    |-- solitude-static-v1        # HTML, CSS, Next.js JS bundles, fonts (Cache-First)
    |-- solitude-covers-v1        # 30 WebP album art images (Cache-First, 30 days)
    `-- solitude-ambient-v1       # 3 looping ambient stems (Stale-While-Revalidate)

### 2.1 Media Streaming Byte-Range Handling Rule
* CRITICAL: Do NOT attempt to cache dynamic HTTP 206 Partial Content MP3 responses in standard Service Worker caches using simple cache.put().
* Browsers throw an error when caching partial synthetic responses. All MP3 audio range requests bypass the service worker directly to Supabase Storage Edge CDN via fetch(request).

---

## 3. Service Worker Implementation (public/sw.js)

    const STATIC_CACHE = "solitude-static-v2";
    const COVERS_CACHE = "solitude-covers-v2";
    const AMBIENT_CACHE = "solitude-ambient-v2";

    const STATIC_ASSETS = [
      "/",
      "/manifest.webmanifest",
      "/favicon.ico",
      "/icons/icon-192.png",
      "/icons/icon-512.png"
    ];

    // 1. INSTALL
    self.addEventListener("install", (event) => {
      event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
          return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
      );
    });

    // 2. ACTIVATE (Purge obsolete caches)
    self.addEventListener("activate", (event) => {
      const allowedCaches = [STATIC_CACHE, COVERS_CACHE, AMBIENT_CACHE];
      event.waitUntil(
        caches.keys().then((keys) => {
          return Promise.all(
            keys.map((key) => {
              if (!allowedCaches.includes(key)) {
                return caches.delete(key);
              }
            })
          );
        }).then(() => self.clients.claim())
      );
    });

    // 3. FETCH (Partitioned Routing)
    self.addEventListener("fetch", (event) => {
      const url = new URL(event.request.url);

      // Bypass Web Audio Range requests
      if (event.request.headers.has("range") || url.pathname.includes("/tracks/")) {
        return;
      }

      // Cover Images: Cache-First
      if (url.pathname.includes("/covers/")) {
        event.respondWith(
          caches.open(COVERS_CACHE).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
              if (cachedResponse) return cachedResponse;
              return fetch(event.request).then((networkResponse) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            });
          })
        );
        return;
      }

      // Ambient Stems: Stale-While-Revalidate
      if (url.pathname.includes("/ambient/")) {
        event.respondWith(
          caches.open(AMBIENT_CACHE).then((cache) => {
            return cache.match(event.request).then((cached) => {
              const networkFetch = fetch(event.request).then((fresh) => {
                cache.put(event.request, fresh.clone());
                return fresh;
              });
              return cached || networkFetch;
            });
          })
        );
        return;
      }

      // Standard Static Assets: Cache-First, fallback to network
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
    });

---

## 4. Background Audio & MediaSession API Integration

To guarantee persistent playback when the screen is locked, minimized, or when navigating away:

    export function syncMediaSessionMetadata(track: Song) {
      if (typeof window === "undefined" || !("mediaSession" in navigator)) {
        return;
      }

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: "Solitude (Midnight Sad Songs)",
        artwork: [
          { src: track.cover_url, sizes: "512x512", type: "image/webp" }
        ]
      });

      navigator.mediaSession.setActionHandler("play", () => {
        window.dispatchEvent(new CustomEvent("solitude:play"));
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        window.dispatchEvent(new CustomEvent("solitude:pause"));
      });

      navigator.mediaSession.setActionHandler("nexttrack", () => {
        window.dispatchEvent(new CustomEvent("solitude:next"));
      });

      navigator.mediaSession.setActionHandler("previoustrack", () => {
        window.dispatchEvent(new CustomEvent("solitude:prev"));
      });

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) {
          window.dispatchEvent(new CustomEvent("solitude:seek", { detail: details.seekTime }));
        }
      });
    }

---

## 5. Offline Fallback & Disconnect Handling

When the user loses internet connection during active sanctuary use:
1. Static UI elements, Canvas rain, and previously loaded album art continue rendering from Cache Storage.
2. The active buffered audio stream continues playing until the buffer runs out.
3. The Communal Presence Pill switches from amber to a muted slate pulse: "[* Sanctuary offline - Reconnecting...]".
4. If a non-buffered track is requested, the player surfaces a subtle notification: "Sanctuary offline. Reconnecting to midnight stream..." without throwing fatal JavaScript runtime errors.