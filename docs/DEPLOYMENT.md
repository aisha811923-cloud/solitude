# Deployment & Production Operations Runbook (DEPLOYMENT.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Complete deployment guide for Vercel, Supabase production settings, Next.js 15 build configurations, Progressive Web App (PWA) installation, and edge media optimization.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Production Architecture Overview

Solitude is hosted on a high-availability serverless topology:
* Web Application Tier: Vercel (Next.js 15 App Router Edge CDN).
* Database & Realtime Presence: Supabase (PostgreSQL 15 Managed Cluster + Realtime WebSockets).
* Media Streaming Tier: Supabase Storage Public Buckets (HTTP 206 Partial Content byte ranges).

+-----------------------+           +-----------------------+
|                       |  HTTPS    |                       |
|   Vercel Edge Network |<--------->| Next.js 15 Client     |
|   (Static SPA Shell)  |           | (Browser Web Audio)   |
|                       |           |                       |
+-----------------------+           +-----------+-----------+
                                                |
                              HTTP 206 Streaming| WSS Presence
                                                v
                                    +-----------------------+
                                    |                       |
                                    |   Supabase Backend    |
                                    |   - Storage (Tracks)  |
                                    |   - Storage (Ambient) |
                                    |   - Realtime Channel  |
                                    |                       |
                                    +-----------------------+

---

## 2. Environment Variables Configuration

Configure the following environment variables in your Vercel Dashboard (Project Settings -> Environment Variables) and locally in .env.local:

    # Public Supabase API Endpoint
    NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co

    # Public Anon API Key (Safe for client browsers, restricted by RLS)
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    # Production URL (Canonical domain for OpenGraph and PWA)
    NEXT_PUBLIC_APP_URL=https://solitude-sanctuary.vercel.app

---

## 3. Next.js 15 Production Configuration (next.config.js)

    /** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**.supabase.co',
            pathname: '/storage/v1/object/public/**',
          },
        ],
      },
      async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff',
              },
              {
                key: 'X-Frame-Options',
                value: 'DENY',
              },
              {
                key: 'Referrer-Policy',
                value: 'strict-origin-when-cross-origin',
              },
              {
                key: 'Permissions-Policy',
                value: 'camera=(), microphone=(), geolocation=()',
              },
            ],
          },
        ];
      },
    };

    module.exports = nextConfig;

---

## 4. Progressive Web App (PWA) Manifest Configuration

Create public/manifest.webmanifest to allow users to install Solitude to their mobile home screens and desktop application docks:

    {
      "name": "Solitude - Midnight Sanctuary",
      "short_name": "Solitude",
      "description": "An intimate midnight sanctuary for sad songs, authentic Lo-Fi acoustics, and gentle rain.",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#070B14",
      "theme_color": "#070B14",
      "orientation": "portrait-primary",
      "icons": [
        {
          "src": "/icons/icon-192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any maskable"
        },
        {
          "src": "/icons/icon-512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "any maskable"
        }
      ]
    }

---

## 5. Supabase Production Readiness Checklist

Before public launch, verify the following configurations in your Supabase dashboard:

1. Storage Public Flags:
   Confirm that buckets 'tracks', 'covers', and 'ambient' have Public Bucket toggled to ON.
2. Row Level Security:
   Confirm that the public.songs table has RLS enabled with only SELECT allowed.
3. Storage CORS Directives:
   Confirm that cors.json has been added via Supabase CLI with Origin: ["*"] and headers: ["Content-Type", "Range", "Accept-Ranges"].
4. Database Poolers:
   Use direct or Transaction pooler (Port 6543 / 5432) as appropriate for client queries.

---

## 6. Vercel Deployment Commands

Deploy directly from your CLI or connect your GitHub repository to Vercel:

    # 1. Install Vercel CLI
    npm install -g vercel

    # 2. Authenticate
    vercel login

    # 3. Link project
    vercel link

    # 4. Pull production environment variables
    vercel env pull .env.local

    # 5. Build and verify locally
    npm run build

    # 6. Deploy to Production
    vercel --prod

---

## 7. Post-Deployment Verification (Smoke Test)

Run the following checks immediately following deployment:

1. Asset Verification:
   Load the production URL in an incognito window. Verify that Track 001 cover image loads with HTTP 200.
2. HTTP 206 Partial Content:
   Inspect browser Network DevTools, play Track 001, and scrub forward by 30 seconds. Verify that range requests return status 206 Partial Content.
3. AudioContext Autoplay:
   Verify that clicking "Enter Sanctuary" unlocks audio and starts track playback without console errors.
4. Realtime Presence:
   Open the production URL in two separate browser windows (or desktop and mobile). Verify that the presence counter synchronizes both active sockets.