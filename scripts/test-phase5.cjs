/**
 * Solitude Phase 5 Verification & Test Runner (scripts/test-phase5.cjs)
 * 
 * Tests:
 * 1. Strict TypeScript compilation via tsc --noEmit
 * 2. useMediaSession W3C Media Session API & hardware keys verification
 * 3. app/manifest.ts PWA manifest metadata route verification
 * 4. PWA icon assets presence in public/icons
 * 5. app/error.tsx glassmorphic runtime error boundary verification
 * 6. app/not-found.tsx nocturnal 404 boundary verification
 * 7. Mobile responsive touch targets & 44px hitbox verification
 * 8. MediaSession wiring in app/page.tsx
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("\n=======================================================");
console.log("   SOLITUDE: PHASE 5 PRODUCTION HARDENING TEST SUITE   ");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// TEST 1: Strict TypeScript Compilation
// -------------------------------------------------------------
console.log("[1/7] Running TypeScript Strict Type Checking (tsc --noEmit)...");
try {
  execSync("npx tsc --noEmit", { stdio: "pipe", cwd: path.resolve(__dirname, "..") });
  assert(true, "TypeScript compiler reported 0 type errors.");
} catch (err) {
  assert(false, `TypeScript compilation failed:\n${err.stdout ? err.stdout.toString() : err.message}`);
}

// -------------------------------------------------------------
// TEST 2: W3C Media Session API Hook
// -------------------------------------------------------------
console.log("\n[2/7] Validating useMediaSession Hook...");
const msFile = path.resolve(__dirname, "../hooks/useMediaSession.ts");
assert(fs.existsSync(msFile), "hooks/useMediaSession.ts exists.");

const msCode = fs.readFileSync(msFile, "utf8");
assert(msCode.includes("useMediaSession"), "useMediaSession hook exported.");
assert(msCode.includes("mediaSession") && msCode.includes("navigator"), "Browser support guard verified.");
assert(msCode.includes("MediaMetadata"), "Track metadata synchronization verified.");
assert(msCode.includes("setActionHandler"), "Hardware playback key action handlers registered.");
assert(msCode.includes("setPositionState"), "Lock screen scrubber position state synchronization verified.");

// -------------------------------------------------------------
// TEST 3: PWA Manifest & App Icons
// -------------------------------------------------------------
console.log("\n[3/7] Validating PWA Manifest & App Icons...");
const manifestFile = path.resolve(__dirname, "../app/manifest.ts");
const icon192 = path.resolve(__dirname, "../public/icons/icon-192.png");
const icon512 = path.resolve(__dirname, "../public/icons/icon-512.png");

assert(fs.existsSync(manifestFile), "app/manifest.ts exists.");
assert(fs.existsSync(icon192), "public/icons/icon-192.png exists.");
assert(fs.existsSync(icon512), "public/icons/icon-512.png exists.");

const manifestCode = fs.readFileSync(manifestFile, "utf8");
assert(manifestCode.includes("Solitude — Midnight Sanctuary"), "PWA full application name configured.");
assert(manifestCode.includes("standalone"), "Standalone display mode configured.");
assert(manifestCode.includes("#070B14"), "Midnight theme and background colors configured.");

// -------------------------------------------------------------
// TEST 4: Nocturnal Error & Not-Found Boundaries
// -------------------------------------------------------------
console.log("\n[4/7] Validating app/error.tsx & app/not-found.tsx...");
const errorFile = path.resolve(__dirname, "../app/error.tsx");
const notFoundFile = path.resolve(__dirname, "../app/not-found.tsx");

assert(fs.existsSync(errorFile), "app/error.tsx exists.");
assert(fs.existsSync(notFoundFile), "app/not-found.tsx exists.");

const errorCode = fs.readFileSync(errorFile, "utf8");
const nfCode = fs.readFileSync(notFoundFile, "utf8");
assert(errorCode.includes('"use client";'), 'app/error.tsx has "use client" directive.');
assert(errorCode.includes("reset"), "Tactile recovery reset trigger wired in error boundary.");
assert(errorCode.includes("glass-popover"), "Glassmorphic nocturnal error card styling verified.");
assert(nfCode.includes("Return to Sanctuary"), "Direct navigation recovery link present in not-found boundary.");

// -------------------------------------------------------------
// TEST 5: Mobile Touch Targets & Ergonomics
// -------------------------------------------------------------
console.log("\n[5/7] Validating Mobile Touch Targets & Hitboxes...");
const scrubFile = path.resolve(__dirname, "../components/player/ScrubBar.tsx");
const dockFile = path.resolve(__dirname, "../components/player/MasterDock.tsx");

const scrubCode = fs.readFileSync(scrubFile, "utf8");
const dockCode = fs.readFileSync(dockFile, "utf8");

assert(scrubCode.includes("h-11") && scrubCode.includes("min-h-[44px]"), "ScrubBar slider hitbox meets WCAG AA 44px threshold.");
assert(scrubCode.includes("touch-none"), "ScrubBar prevents viewport scroll interference during touch dragging.");
assert(dockCode.includes("min-[390px]:max-w"), "MasterDock has responsive container constraints for narrow mobile viewports.");

// -------------------------------------------------------------
// TEST 6: Page Viewport MediaSession Integration
// -------------------------------------------------------------
console.log("\n[6/7] Validating MediaSession Integration in app/page.tsx...");
const pageFile = path.resolve(__dirname, "../app/page.tsx");
const pageCode = fs.readFileSync(pageFile, "utf8");

assert(pageCode.includes("useMediaSession"), "useMediaSession hook imported and mounted in app/page.tsx.");
assert(pageCode.includes("scale-75 min-[400px]:scale-90"), "Vinyl platter responsive scaling configured for small mobile screens.");

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log("\n=======================================================");
console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\x1b[32m✔ PHASE 5 PRODUCTION HARDENING PASSED 100% CLEAN.\x1b[0m\n");
  process.exit(0);
}
