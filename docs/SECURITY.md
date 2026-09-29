# Security Policy & Hardening Guidelines (SECURITY.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Security architectures, Content Security Policy (CSP), Supabase Row Level Security (RLS), input hygiene, environment secret management, and CDN hotlinking mitigations.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Threat Model & Security Posture

Solitude is an anonymous client-side music sanctuary. It does not process monetary payments, capture passwords, or store personal identifiable information (PII).

Primary security objectives:
1. Safeguard Supabase database tables from unauthenticated writes or tampering.
2. Prevent arbitrary JavaScript injection (XSS) via search fields or track metadata.
3. Protect media streaming endpoints from unauthorized file uploads or deletion.
4. Establish Content Security Policies (CSP) permitting Web Audio API execution and Supabase WebSocket channels while blocking malicious cross-origin resources.

---

## 2. Supabase Row Level Security (RLS) Configuration

All database operations operate under strict Row Level Security.
Public anonymous clients have read-only permissions; insert, update, and delete actions are permanently forbidden.

    -- Ensure RLS is active on public.songs
    ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

    -- 1. Explicit read-only policy for anon/authenticated roles
    CREATE POLICY "Allow public read access on songs"
      ON public.songs
      FOR SELECT
      TO public
      USING (true);

    -- 2. Disallow all writes (INSERT, UPDATE, DELETE) for public / anon
    CREATE POLICY "Forbid all client inserts"
      ON public.songs
      FOR INSERT
      TO public
      WITH CHECK (false);

    CREATE POLICY "Forbid all client updates"
      ON public.songs
      FOR UPDATE
      TO public
      USING (false);

    CREATE POLICY "Forbid all client deletes"
      ON public.songs
      FOR DELETE
      TO public
      USING (false);

---

## 3. Storage Security & Write Isolation

Storage buckets (tracks, covers, ambient) must be locked against unauthorized public uploads:

    -- Grant select (download / stream) access to public
    CREATE POLICY "Public Read Only on Storage Tracks"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id IN ('tracks', 'covers', 'ambient'));

    -- Reject all public uploads, modifications, or deletes
    CREATE POLICY "Deny Public Uploads"
      ON storage.objects
      FOR INSERT
      TO public
      WITH CHECK (false);

    CREATE POLICY "Deny Public Updates"
      ON storage.objects
      FOR UPDATE
      TO public
      USING (false);

    CREATE POLICY "Deny Public Deletions"
      ON storage.objects
      FOR DELETE
      TO public
      USING (false);

---

## 4. Content Security Policy (CSP) Specifications

In Next.js 15, the Content Security Policy must explicitly allow Supabase Storage media streaming, Supabase Realtime WebSocket handshakes, and unhampered Canvas execution:

### 4.1 CSP Header Directive (next.config.js or middleware.ts)

    const ContentSecurityPolicy = `
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
    `.replace(/\s{2,}/g, ' ').trim();

    module.exports = {
      async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: ContentSecurityPolicy,
              },
              {
                key: 'X-Frame-Options',
                value: 'DENY',
              },
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff',
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

---

## 5. Input Sanitation & Search Query Defense

The track drawer includes a real-time search input. To protect against DOM XSS:
1. Search queries are treated strictly as string literals, never evaluated or passed into dangerouslySetInnerHTML.
2. Input strings are limited to 60 characters and trimmed before processing:

    export function sanitizeSearchInput(input: string): string {
      if (!input) return "";
      return input
        .slice(0, 60)
        .replace(/[^\w\s\-\u0900-\u097F]/gi, "")
        .trim();
    }

---

## 6. Environment Variable Boundaries

    # Client-Exposed Variables (Safe for public bundle)
    NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_PUBLIC_KEY]

    # Server-Only Variables (STRICTLY PROHIBITED ON CLIENT)
    # NEVER prefix the service role key with NEXT_PUBLIC_
    SUPABASE_SERVICE_ROLE_KEY=[SECRET_SERVICE_ROLE_KEY]

* Audit Rule: The SUPABASE_SERVICE_ROLE_KEY must never be referenced inside client-side components, hooks, or bundle files.