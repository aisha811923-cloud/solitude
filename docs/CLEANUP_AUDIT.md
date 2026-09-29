# Senior Engineer Repository Audit Pass — Phase 1 (Audit Only)

**Status:** Phase 1 Complete (Zero changes made). Stopping and awaiting your explicit approval before Phase 2.

---

## 1. Audit Summary Table

| # | Category | Item / Identifier | Location | Evidence | Confidence | Risk Level | Recommended Action |
|:--|:---|:---|:---|:---|:---:|:---:|:---|
| **1** | **Unused File** | `docs/tracks.ts` | `docs/tracks.ts` (13.1 KB) | Outdated draft of `lib/constants/tracks.ts` containing dummy `[PROJECT_REF]` URL. Excluded in `tsconfig.json` (`exclude: ["docs"]`). Zero imports across repo. | **100%** | **Low** | **Delete** |
| **2** | **Unused File** | `docs/contracts.ts` | `docs/contracts.ts` (6.3 KB) | Exact duplicate/early draft of `types/contracts.ts`. Excluded from compilation. Zero imports across repo. | **100%** | **Low** | **Delete** |
| **3** | **Unused File** | `assets/media/sanctuary-bg.webp` | `assets/media/` (842 KB) | Identical byte-for-byte duplicate of `public/media/sanctuary-bg.webp`. Next.js only serves static assets from `public/`. Zero references in code. | **100%** | **Low** | **Delete** |
| **4** | **Unused File** | `screenshot-desktop.png` & `screenshot-mobile.png` | Root directory (~1.0 MB) | Transient root-level screenshots generated during manual verification. Zero references in any code or tests. | **100%** | **Low** | **Delete** |
| **5** | **Malformed Filename** | `docs/WEB_FLOW.md.md` | `docs/` | Contains double extension `.md.md`. Valid documentation file that needs extension cleanup. | **100%** | **Low** | **Rename** to `docs/WEB_FLOW.md` |
| **6** | **Unused Import** | `Radio` | `components/player/MasterDock.tsx:33` | `Radio` is imported from `lucide-react` but never referenced or rendered in JSX (`TS6133`). | **100%** | **Low** | **Remove import** |
| **7** | **Unused Variable** | `jitter`, `setJitter` | `hooks/usePresence.ts:44` | State tuple `const [jitter, setJitter] = useState<number>(0)` is declared but never read or called (`TS6133`). | **100%** | **Low** | **Remove state hook** |
| **8** | **Unused Dependency** | `clsx` | `package.json` | Package installed (`^2.1.1`) but 0 imports exist in any `.ts`, `.tsx`, `.js`, or `.cjs` file. Classes use template literals. | **100%** | **Low** | **Remove from `package.json`** |
| **9** | **Unused Dependency** | `tailwind-merge` | `package.json` | Package installed (`^3.0.1`) but 0 imports exist in the codebase. No `cn()` utility was built. | **100%** | **Low** | **Remove from `package.json`** |
| **10** | **Critical Peer Dep** | `react-dom` | `package.json` | Not explicitly imported in application files, but **required** peer dependency for React 19 / Next.js 15 runtime. | **<90%** (0% for deletion) | **DO NOT DELETE** | **Retain in `package.json`** |
| **11** | **Unused Env Vars** | `VITE_SUPABASE_*`, `SUPABASE_*`, `NEXT_PUBLIC_APP_URL` | `.env.local:6-13` | `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `SUPABASE_PROJECT_ID`, `SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_APP_URL` are not referenced anywhere in source code. (Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used). | **95%** | **Low** | **Clean from `.env.local` & `.env.local.example`** |
| **12** | **Duplicated Logic** | Time Formatter (`formatTime` / `formatDuration`) | `components/player/ScrubBar.tsx:27-32` & `components/queue/TrackDrawer.tsx:37-41` | Identical minutes:seconds padding algorithm (`mm:ss`) duplicated across both components. | **100%** | **Low** | **Extract to `lib/utils/formatTime.ts`** |
| **13** | **Duplicated Logic** | Ambient Channel Metadata | `components/ambient/AmbientSoundboard.tsx:38-59` & `components/mobile/MobileControlDrawer.tsx:68-93` | Stem keys, labels ("Rain on Glass", "Distant Thunder", "Vinyl Crackle"), and descriptions duplicated. | **100%** | **Low** | **Centralize in `lib/constants/ambient.ts`** |
| **14** | **Oversized Component** | `app/page.tsx` | `app/page.tsx` (403 lines) | Contains top navbar, listener beacon pill, mobile triggers, hero platter, visualizer, shayari, footer dock, and drawer wrappers. | **95%** | **Medium** | **Extract `<SanctuaryHeader />` (lines 160–252)** into `components/navigation/SanctuaryHeader.tsx` |
| **15** | **Oversized Component** | `components/mobile/MobileControlDrawer.tsx` | `components/mobile/MobileControlDrawer.tsx` (452 lines) | Houses drawer shell + inlined weather fader rows + lo-fi toggles + candlelight + volume controls. | **95%** | **Medium** | **Extract channel fader rows** into a shared component |
| **16** | **Oversized Hook** | `hooks/useAudioEngine.ts` | `hooks/useAudioEngine.ts` (676 lines) | Orchestrates track playback, DSP Butterworth filter, timeupdate throttling, and 3-stem ambient bus. | **<90%** (for splitting) | **High** | **Keep unified** (prevents Web Audio graph timing & test regressions) |
| **17** | **Unreferenced Type Exports** | Contract Types (`SongInsert`, `SongUpdate`, `LightingThemeTokens`, etc.) | `types/contracts.ts` | Exported type declarations from the architecture spec with no current consumer in UI components. | **<90%** (for deletion) | **DO NOT DELETE** | **Retain as core domain contract library** |

---

## 2. In-Depth Audit Findings

### 2.1 Unused Files, Components, Hooks, Utils
- **`docs/tracks.ts` & `docs/contracts.ts`:**
  - These two `.ts` files were preliminary drafts placed in `docs/` before the true application directories (`lib/constants/tracks.ts` and `types/contracts.ts`) were scaffolded.
  - Both are explicitly excluded from compilation in `tsconfig.json:28` (`"exclude": ["node_modules", "docs"]`).
  - AST analysis confirms zero references exist anywhere in the project.
- **`assets/media/sanctuary-bg.webp`:**
  - Exact binary clone of `public/media/sanctuary-bg.webp` (both 842,298 bytes). Next.js App Router serves public media exclusively from the `public/` directory. `assets/` is completely dead.
- **`screenshot-desktop.png` & `screenshot-mobile.png`:**
  - Transient screenshots placed in root (over 1 MB total).
- **`scripts/inspect-dom.cjs` & `scripts/test-drawer-open.cjs`:**
  - Ad-hoc scripts used for headless Chrome DevTools Protocol viewport measurements during the responsive verification step. Not part of the official `package.json` test suites. Can be cleaned or moved to a scratch directory.

---

### 2.2 Unused Imports & Variables
- **`components/player/MasterDock.tsx:33`:**
  - `Radio` is imported from `lucide-react`:
    ```typescript
    import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Sliders, ListMusic, Radio, CloudRain, CloudOff } from "lucide-react";
    ```
  - `Radio` is never rendered or used anywhere in `MasterDock.tsx`.
- **`hooks/usePresence.ts:44`:**
  - Unused state variable and setter:
    ```typescript
    const [jitter, setJitter] = useState<number>(0);
    ```
  - Never consumed in the presence telemetry pipeline.

---

### 2.3 Unused Dependencies in `package.json`
- **`clsx` (`^2.1.1`):** 0 imports across the codebase. All classes use native template strings.
- **`tailwind-merge` (`^3.0.1`):** 0 imports across the codebase.
- **`react-dom`:** Even though `import ... from 'react-dom'` is not in application source files, it is an essential peer dependency of Next.js 15 and React 19. **Must NOT be removed.**

---

### 2.4 Unused Environment Variables & Routes
- In `.env.local` and `.env.local.example`:
  - `NEXT_PUBLIC_APP_URL`
  - `SUPABASE_PROJECT_ID`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_URL`
  Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are utilized by `lib/supabase/client.ts`. The `VITE_*` and legacy keys are dead boilerplate residues.
- **Routes & API Endpoints:** No orphaned API routes exist. The application is a client-side audio sanctuary driven by `app/page.tsx` with `app/manifest.ts`, `app/error.tsx`, and `app/not-found.tsx`.

---

### 2.5 Commented-Out Code Blocks
- Codebase scan confirmed **zero** dead commented-out code blocks or orphaned JSX tags. All comments in `RainCanvas.tsx`, `useAudioEngine.ts`, and `filterNode.ts` are architectural documentation.

---

### 2.6 Duplicated Logic in 2+ Places
1. **Timestamp Formatting (`formatTime` vs `formatDuration`):**
   - `components/player/ScrubBar.tsx`:
     ```typescript
     function formatTime(seconds: number): string {
       if (isNaN(seconds) || seconds < 0) return "00:00";
       const mins = Math.floor(seconds / 60);
       const secs = Math.floor(seconds % 60);
       return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
     }
     ```
   - `components/queue/TrackDrawer.tsx`:
     ```typescript
     function formatDuration(seconds: number): string {
       const m = Math.floor(seconds / 60);
       const s = Math.floor(seconds % 60);
       return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
     }
     ```
   - Both perform identical time conversion.
2. **Ambisonic Weather Stem Configuration:**
   - Both `components/ambient/AmbientSoundboard.tsx` and `components/mobile/MobileControlDrawer.tsx` hardcode identical channel metadata (Rain, Thunder, Vinyl crackle descriptions and icons).

---

### 2.7 Files that Have Grown Too Large & Recommended Refactoring
1. **`app/page.tsx` (403 lines):**
   - The Top Navigation Bar (`<header>` lines 160–252) spans ~93 lines of JSX handling presence status, ambient trigger, and track counter.
   - **Recommended Split:** Extract lines 160–252 into `components/navigation/SanctuaryHeader.tsx`. Reduces `page.tsx` down to ~310 lines.
2. **`components/mobile/MobileControlDrawer.tsx` (452 lines):**
   - Contains duplicated ambient channel slider logic.
   - **Recommended Split:** Extract channel fader row into `components/ambient/AmbientChannelRow.tsx` shared between `AmbientSoundboard.tsx` and `MobileControlDrawer.tsx`.
3. **`hooks/useAudioEngine.ts` (676 lines):**
   - **Recommendation:** Keep unified. The Web Audio graph connections, Lo-Fi Butterworth filter, master gain node, and ambient gain nodes rely on cross-referencing mutable refs (`audioCtxRef`, `ambientGainRefs`). Splitting this hook carries a high risk of subtle AudioContext lifecycle or autoplay timing bugs, and would require rewriting test assertions in `test-phase2.cjs` and `test-all.cjs`.

---

## 3. Flagged Items (< 90% Confidence — DO NOT TOUCH)

1. **`react-dom` in `package.json`:**
   - Do NOT delete. Essential peer dependency for Next.js 15.
2. **Contract Interfaces in `types/contracts.ts`:**
   - Types like `SongInsert`, `SongUpdate`, `LightingThemeTokens`, `RainEngineConfig`, `UIState` are domain schema specifications from `docs/contracts.ts`. Removing them would degrade code documentation and future extensibility.
3. **`getCircadianBaseline` in `hooks/usePresence.ts`:**
   - Exported mathematical formula representing nocturnal listening curves. Tested in `scripts/test-phase4.cjs`. Retain as an exported utility.
4. **Architecture Hook `useAudioEngine.ts`:**
   - Do not split across multiple files to avoid Web Audio graph lifecycle regressions.

---

## 4. Phase 2 Execution Plan (Awaiting Your Approval)

Upon your approval, Phase 2 will execute the following surgical cleanup:

1. **Deletions:**
   - Delete dead TS drafts: `docs/tracks.ts` and `docs/contracts.ts`.
   - Delete redundant asset: `assets/media/sanctuary-bg.webp`.
   - Delete root screenshots: `screenshot-desktop.png` and `screenshot-mobile.png`.
   - Remove unused dependencies `clsx` and `tailwind-merge` from `package.json`.
   - Clean legacy/Vite env keys from `.env.local` and `.env.local.example`.
2. **Code Cleanup:**
   - Remove unused `Radio` import from `components/player/MasterDock.tsx`.
   - Remove unused `[jitter, setJitter]` from `hooks/usePresence.ts`.
   - Rename `docs/WEB_FLOW.md.md` to `docs/WEB_FLOW.md`.
3. **Refactoring & Deduplication:**
   - Create shared `lib/utils/formatTime.ts` and import it in both `ScrubBar.tsx` and `TrackDrawer.tsx`.
   - Create shared ambient constants in `lib/constants/ambient.ts` for `AmbientSoundboard.tsx` and `MobileControlDrawer.tsx`.
   - Extract `components/navigation/SanctuaryHeader.tsx` from `app/page.tsx`.
4. **Verification:**
   - Run `npx tsc --noEmit` (confirm 0 errors).
   - Run `npm test` (`node scripts/test-all.cjs`) to verify 100% compliance across all phases.
   - Run `npm run build` to confirm clean production bundle.
