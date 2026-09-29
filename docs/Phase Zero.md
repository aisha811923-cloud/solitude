# Phase Zero: Foundation & Project Scaffolding (PHASE_ZERO.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)  
Document Purpose: Complete initial scaffolding instructions, dependency manifests, configuration files, and directory bootstrap routines.  
Document Version: 2.0.0  
Target Environment: Google Antigravity IDE  

---

## 1. Project Initialization Command

Execute from the workspace terminal to initialize the Next.js 15 App Router shell:

    npx create-next-app@latest solitude \
      --typescript \
      --tailwind \
      --app \
      --src-dir=false \
      --import-alias="@/*" \
      --use-npm

---

## 2. Production package.json

    {
      "name": "solitude",
      "version": "2.0.0",
      "private": true,
      "scripts": {
        "dev": "next dev --turbopack",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      "dependencies": {
        "@supabase/supabase-js": "^2.48.0",
        "clsx": "^2.1.1",
        "framer-motion": "^12.0.0",
        "lucide-react": "^0.475.0",
        "next": "15.1.7",
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "tailwind-merge": "^3.0.1"
      },
      "devDependencies": {
        "@types/node": "^22.13.0",
        "@types/react": "^19.0.8",
        "@types/react-dom": "^19.0.3",
        "postcss": "^8.5.1",
        "tailwindcss": "^4.0.0",
        "typescript": "^5.7.3"
      }
    }

---

## 3. Strict tsconfig.json

    {
      "compilerOptions": {
        "target": "ES2022",
        "lib": ["dom", "dom.iterable", "esnext"],
        "allowJs": true,
        "skipLibCheck": true,
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noEmit": true,
        "esModuleInterop": true,
        "module": "esnext",
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true,
        "plugins": [
          {
            "name": "next"
          }
        ],
        "paths": {
          "@/*": ["./*"]
        }
      },
      "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      "exclude": ["node_modules"]
    }

---

## 4. Production next.config.ts

    import type { NextConfig } from "next";

    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https://*.supabase.co;
      media-src 'self' blob: https://*.supabase.co;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co;
      font-src 'self' data:;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, " ").trim();

    const nextConfig: NextConfig = {
      reactStrictMode: true,
      images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "**.supabase.co",
            pathname: "/storage/v1/object/public/**",
          },
        ],
      },
      async headers() {
        return [
          {
            source: "/(.*)",
            headers: [
              {
                key: "Content-Security-Policy",
                value: cspHeader,
              },
              {
                key: "X-Frame-Options",
                value: "DENY",
              },
              {
                key: "X-Content-Type-Options",
                value: "nosniff",
              },
              {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
              },
            ],
          },
        ];
      },
    };

    export default nextConfig;

---

## 5. Tailwind CSS v4 Directives (app/globals.css)

    @import "tailwindcss";

    @layer base {
      :root {
        --bg-midnight: #070B14;
        --accent-amber: #F59E0B;
        --border-frosted: rgba(255, 255, 255, 0.08);
      }

      body {
        background-color: var(--bg-midnight);
        color: #F8FAFC;
        overflow: hidden;
        user-select: none;
        -webkit-font-smoothing: antialiased;
      }
    }

    /* Glassmorphic Panel Classes */
    .glass-dock {
      background: rgba(11, 19, 41, 0.65);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 
        inset 0 1px 1px rgba(255, 255, 255, 0.12),
        0 12px 32px rgba(0, 0, 0, 0.55);
    }

    .glass-drawer {
      background: rgba(7, 11, 20, 0.88);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border-left: 1px solid rgba(255, 255, 255, 0.08);
    }

---

## 6. Environment Template (.env.local.example)

    # Supabase Connectivity
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

    # Canonical Host
    NEXT_PUBLIC_APP_URL=https://solitude-sanctuary.vercel.app

---

## 7. Directory Tree Bootstrap Script (scripts/bootstrap.sh)

    #!/usr/bin/env bash
    set -e

    echo "==> Creating Solitude Sanctuary directory architecture..."

    mkdir -p app/api/health
    mkdir -p components/ambient
    mkdir -p components/canvas
    mkdir -p components/lighting
    mkdir -p components/player
    mkdir -p components/presence
    mkdir -p components/queue
    mkdir -p hooks
    mkdir -p lib/audio
    mkdir -p lib/constants
    mkdir -p lib/supabase
    mkdir -p lib/utils
    mkdir -p public/icons
    mkdir -p types

    touch .env.local
    touch types/contracts.ts
    touch lib/constants/tracks.ts
    touch lib/audio/audioContext.ts
    touch lib/audio/filterNode.ts
    touch lib/audio/gainCurves.ts

    echo "==> Scaffolding complete. Phase Zero ready."