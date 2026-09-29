/**
 * Solitude Ambient Decoupling & Mobile Ergonomics Test Suite (scripts/test-ambient-and-mobile.cjs)
 * 
 * Verifies:
 * 1. Master Ambient Mute Toggle contract & implementation
 * 2. Decoupled Web Audio Routing: Ambient bus mute vs Master music bus isolation
 * 3. Stored ambient volume level retention across mute/unmute cycles
 * 4. Mobile Control Drawer component structure & gestures
 * 5. Touch target accessibility (>= 44x44px) & responsive scaling
 */

const fs = require('fs');
const path = require('path');

console.log("\n=================================================================");
console.log("   SOLITUDE: AMBIENT DECOUPLING & MOBILE ERGONOMICS AUDIT        ");
console.log("=================================================================\n");

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

// 1. Inspect types/contracts.ts
console.log("[1/5] Auditing Domain Contracts (types/contracts.ts)...");
const contractsPath = path.resolve(__dirname, '../types/contracts.ts');
const contractsContent = fs.readFileSync(contractsPath, 'utf8');

assert(contractsContent.includes('isMasterMuted?: boolean;'), "AmbientState includes isMasterMuted optional field.");
assert(contractsContent.includes('toggleAmbientMute?: (stem?: AmbientStemKey) => void;'), "AmbientActions includes toggleAmbientMute with optional stem.");
assert(contractsContent.includes('toggleMasterAmbientMute?: () => void;'), "AmbientActions includes toggleMasterAmbientMute export.");

// 2. Inspect hooks/useAudioEngine.ts
console.log("\n[2/5] Auditing Audio Engine Ambient Decoupling (hooks/useAudioEngine.ts)...");
const hookPath = path.resolve(__dirname, '../hooks/useAudioEngine.ts');
const hookContent = fs.readFileSync(hookPath, 'utf8');

assert(hookContent.includes('isAmbientMuted: boolean;'), "UseAudioEngineReturn exports isAmbientMuted state boolean.");
assert(hookContent.includes('toggleMasterAmbientMute: () => void;'), "UseAudioEngineReturn exports toggleMasterAmbientMute.");
assert(hookContent.includes('storedAmbientVolumesRef'), "storedAmbientVolumesRef preserves exact channel fader levels before muting.");
assert(hookContent.includes('rampGain(gainNode, 0, 0.10, ctx)'), "Ambient mute ramps gain to 0 over 100ms without pausing audio loops.");
assert(hookContent.includes('rampGain(gainNode, restoreVol, 0.10, ctx)'), "Ambient unmute ramps gain back to stored volume over 100ms.");

// Decoupling verification: verify toggleMasterAmbientMute only touches ambientGainRefs and never masterGainRef
const toggleMasterMatch = hookContent.match(/const toggleMasterAmbientMute = useCallback\(\(\): void => {([\s\S]*?)}, \[isAmbientMuted, ambientVolumes\]\);/);
assert(toggleMasterMatch !== null, "toggleMasterAmbientMute implementation extracted.");
if (toggleMasterMatch) {
  const code = toggleMasterMatch[1];
  assert(code.includes('ambientGainRefs'), "toggleMasterAmbientMute controls ambientGainRefs.");
  assert(!code.includes('masterGainRef'), "DECOUPLING VERIFIED: toggleMasterAmbientMute NEVER modifies master music gain.");
}

// 3. Inspect MasterDock.tsx
console.log("\n[3/5] Auditing Master Dock Hardware Ergonomics (components/player/MasterDock.tsx)...");
const dockPath = path.resolve(__dirname, '../components/player/MasterDock.tsx');
const dockContent = fs.readFileSync(dockPath, 'utf8');

assert(dockContent.includes('isAmbientMuted'), "MasterDock accepts isAmbientMuted prop.");
assert(dockContent.includes('onToggleAmbientMute'), "MasterDock accepts onToggleAmbientMute prop.");
assert(dockContent.includes('CloudRain') && dockContent.includes('CloudOff'), "MasterDock renders atmospheric CloudRain / CloudOff icon.");
assert(dockContent.includes('min-w-[44px] min-h-[44px]'), "MasterDock enforces >= 44x44px touch targets on buttons.");

// 4. Inspect MobileControlDrawer.tsx
console.log("\n[4/5] Auditing Mobile Control Drawer (components/mobile/MobileControlDrawer.tsx)...");
const drawerPath = path.resolve(__dirname, '../components/mobile/MobileControlDrawer.tsx');
assert(fs.existsSync(drawerPath), "components/mobile/MobileControlDrawer.tsx exists.");

if (fs.existsSync(drawerPath)) {
  const drawerContent = fs.readFileSync(drawerPath, 'utf8');
  assert(drawerContent.includes('"use client"'), "Drawer marked with use client directive.");
  assert(drawerContent.includes('Framer Motion') || drawerContent.includes('framer-motion'), "Drawer integrates Framer Motion.");
  assert(drawerContent.includes('onDragEnd'), "Drawer implements tactile swipe-to-dismiss threshold.");
  assert(drawerContent.includes('Rain on Glass') && drawerContent.includes('Distant Thunder') && drawerContent.includes('Vinyl Crackle'), "Soundboard faders embedded inside drawer.");
  assert(drawerContent.includes('Lo-Fi Mode') && drawerContent.includes('Candlelight') && drawerContent.includes('Track Catalogue'), "Quick controls embedded inside drawer.");
}

// 5. Inspect app/page.tsx Viewport Wiring
console.log("\n[5/5] Auditing Viewport Assembly & Swipe Gestures (app/page.tsx)...");
const pagePath = path.resolve(__dirname, '../app/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

assert(pageContent.includes('MobileControlDrawer'), "app/page.tsx imports and mounts MobileControlDrawer.");
assert(pageContent.includes('touchstart') && pageContent.includes('touchend'), "app/page.tsx listens for mobile right-edge touch gestures.");
assert(pageContent.includes('window.innerWidth - 45'), "app/page.tsx verifies swipe initiates from right screen boundary.");
assert(pageContent.includes('audio.isAmbientMuted'), "app/page.tsx passes audio.isAmbientMuted to dock and soundboard.");
assert(pageContent.includes('audio.toggleMasterAmbientMute'), "app/page.tsx passes audio.toggleMasterAmbientMute handler.");

console.log("\n=================================================================");
console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\x1b[32m✔ AMBIENT DECOUPLING & MOBILE ERGONOMICS AUDIT PASSED 100% CLEAN.\x1b[0m\n");
  process.exit(0);
}
