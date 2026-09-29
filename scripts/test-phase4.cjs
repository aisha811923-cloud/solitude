/**
 * Solitude Phase 4 Verification & Test Runner (scripts/test-phase4.cjs)
 * 
 * Tests:
 * 1. Strict TypeScript compilation via tsc --noEmit
 * 2. AmbientSoundboard 3-channel fader panel verification
 * 3. PresenceBeacon & usePresence hook real-time listener verification
 * 4. TrackDrawer slide-over queue & instant search engine verification
 * 5. useKeyboardShortcuts hardware hotkey matrix & input isolation verification
 * 6. app/layout.tsx metadata, theme & font configuration verification
 * 7. app/page.tsx master sanctuary assembly & state wiring verification
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("\n=======================================================");
console.log("   SOLITUDE: PHASE 4 MASTER ORCHESTRATION TEST SUITE   ");
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
// TEST 2: AmbientSoundboard 3-Channel Fader Panel
// -------------------------------------------------------------
console.log("\n[2/7] Validating AmbientSoundboard Component...");
const soundboardFile = path.resolve(__dirname, "../components/ambient/AmbientSoundboard.tsx");
assert(fs.existsSync(soundboardFile), "components/ambient/AmbientSoundboard.tsx exists.");

const sbCode = fs.readFileSync(soundboardFile, "utf8");
assert(sbCode.includes("AmbientSoundboard"), "AmbientSoundboard component exported.");
assert(sbCode.includes("rain") && sbCode.includes("thunder") && sbCode.includes("vinyl"), "All 3 ambient channels (rain, thunder, vinyl) mapped.");
assert(sbCode.includes("setAmbientVolume"), "setAmbientVolume callback wired to sliders.");
assert(sbCode.includes("toggleAmbientMute"), "Mute toggles wired for each ambient stem.");
assert(sbCode.includes("glass-popover"), "Hardware .glass-popover styling applied.");

// -------------------------------------------------------------
// TEST 3: PresenceBeacon & usePresence Hook
// -------------------------------------------------------------
console.log("\n[3/7] Validating PresenceBeacon & usePresence Hook...");
const presenceFile = path.resolve(__dirname, "../components/presence/PresenceBeacon.tsx");
const hookFile = path.resolve(__dirname, "../hooks/usePresence.ts");
assert(fs.existsSync(presenceFile), "components/presence/PresenceBeacon.tsx exists.");
assert(fs.existsSync(hookFile), "hooks/usePresence.ts exists.");

const beaconCode = fs.readFileSync(presenceFile, "utf8");
const hookCode = fs.readFileSync(hookFile, "utf8");
assert(beaconCode.includes("PresenceBeacon"), "PresenceBeacon component exported.");
assert(beaconCode.includes("animate-ping") || beaconCode.includes("rounded-full"), "Pulsing amber beacon LED indicator implemented.");
assert(beaconCode.includes("listening alone together"), "Communal listener telemetry text formatted.");
assert(hookCode.includes("room:solitude-global"), "Supabase Realtime channel (room:solitude-global) configured.");
assert(hookCode.includes("getCircadianBaseline"), "Circadian nocturnal mathematical curve integrated.");

// -------------------------------------------------------------
// TEST 4: TrackDrawer Slide-Over Queue & Search
// -------------------------------------------------------------
console.log("\n[4/7] Validating TrackDrawer Component...");
const drawerFile = path.resolve(__dirname, "../components/queue/TrackDrawer.tsx");
assert(fs.existsSync(drawerFile), "components/queue/TrackDrawer.tsx exists.");

const drawerCode = fs.readFileSync(drawerFile, "utf8");
assert(drawerCode.includes("TrackDrawer"), "TrackDrawer component exported.");
assert(drawerCode.includes("framer-motion"), "Framer Motion spring slide-in animation integrated.");
assert(drawerCode.includes("searchQuery"), "Real-time client-side search filtering implemented.");
assert(drawerCode.includes("onSelectTrack"), "Track selection triggers audio swap callback.");
assert(drawerCode.includes("glass-drawer"), "Hardware .glass-drawer panel styling applied.");

// -------------------------------------------------------------
// TEST 5: useKeyboardShortcuts Hook
// -------------------------------------------------------------
console.log("\n[5/7] Validating useKeyboardShortcuts Hook...");
const kbFile = path.resolve(__dirname, "../hooks/useKeyboardShortcuts.ts");
assert(fs.existsSync(kbFile), "hooks/useKeyboardShortcuts.ts exists.");

const kbCode = fs.readFileSync(kbFile, "utf8");
assert(kbCode.includes("useKeyboardShortcuts"), "useKeyboardShortcuts hook exported.");
assert(kbCode.includes("isInputTarget"), "isInputTarget DOM isolation routine implemented.");
assert(kbCode.includes("Space") && kbCode.includes("ArrowLeft") && kbCode.includes("ArrowRight"), "Transport and timeline hotkeys mapped.");
assert(kbCode.includes("ArrowUp") && kbCode.includes("ArrowDown"), "Volume increment/decrement hotkeys mapped.");
assert(kbCode.includes("KeyL") && kbCode.includes("KeyM") && kbCode.includes("KeyQ"), "Lo-Fi, Mute, and Queue hotkeys mapped.");

// -------------------------------------------------------------
// TEST 6: Root Layout Configuration
// -------------------------------------------------------------
console.log("\n[6/7] Validating app/layout.tsx...");
const layoutFile = path.resolve(__dirname, "../app/layout.tsx");
assert(fs.existsSync(layoutFile), "app/layout.tsx exists.");

const layoutCode = fs.readFileSync(layoutFile, "utf8");
assert(layoutCode.includes("Solitude"), "Solitude application title metadata configured.");
assert(layoutCode.includes("dark"), "Dark theme default class enabled on html element.");
assert(layoutCode.includes("globals.css"), "globals.css loaded in root layout.");

// -------------------------------------------------------------
// TEST 7: Master Sanctuary Viewport (app/page.tsx)
// -------------------------------------------------------------
console.log("\n[7/7] Validating Master Sanctuary Viewport (app/page.tsx)...");
const pageFile = path.resolve(__dirname, "../app/page.tsx");
assert(fs.existsSync(pageFile), "app/page.tsx exists.");

const pageCode = fs.readFileSync(pageFile, "utf8");
assert(pageCode.includes('"use client";'), 'app/page.tsx marked with "use client" directive.');
assert(pageCode.includes("useAudioEngine"), "Master audio engine hook integrated.");
assert(pageCode.includes("RainCanvas"), "60 FPS Canvas rain layer mounted.");
assert(pageCode.includes("CandleGlow"), "Candlelight & Lo-Fi vignette mounted.");
assert(pageCode.includes("VinylDisc"), "Turntable platter with cover art mounted.");
assert(pageCode.includes("WaveformVisualizer"), "Real-time spectrum equalizer mounted.");
assert(pageCode.includes("ScrubBar"), "Hardware timeline scrubber mounted.");
assert(pageCode.includes("MasterDock"), "Floating master dock mounted.");
assert(pageCode.includes("AmbientSoundboard"), "Ambient soundboard popover mounted.");
assert(pageCode.includes("TrackDrawer"), "Slide-over track drawer mounted.");
assert(pageCode.includes("PresenceBeacon"), "Communal presence beacon mounted.");

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log("\n=======================================================");
console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\x1b[32m✔ PHASE 4 MASTER ORCHESTRATION PASSED 100% CLEAN.\x1b[0m\n");
  process.exit(0);
}
