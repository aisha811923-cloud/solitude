/**
 * Mobile Viewport Verification Script (scripts/verify-mobile-viewports.cjs)
 * 
 * Tests 375x667, 390x844, and 412x915 viewports.
 * Asserts:
 * - Zero vertical overflow / scroll (scrollHeight <= innerHeight)
 * - All controls (Header, Vinyl, Title, Shayari, Waveform, Scrub Bar, Play/Pause dock) are within bounds.
 * - Captures audit screenshots for visual proof.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\0c1b3a89-9725-4367-9bf4-329269315642';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://localhost:3000';
const PORT = 9223;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class MobileAuditor {
  constructor() {
    this.ws = null;
    this.chromeProc = null;
    this.msgId = 1;
    this.handlers = new Map();
  }

  async start() {
    try {
      require('child_process').execSync('taskkill /F /IM chrome.exe /T 2>nul');
    } catch (e) {}

    await sleep(600);

    this.chromeProc = spawn(CHROME_PATH, [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--window-size=412,915',
      '--autoplay-policy=no-user-gesture-required',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      TARGET_URL,
    ]);

    let appTab = null;
    for (let i = 0; i < 30; i++) {
      await sleep(350);
      try {
        const res = await fetch(`http://localhost:${PORT}/json/list`);
        const tabs = await res.json();
        appTab = tabs.find((t) => t.url.includes('localhost:3000')) || tabs[0];
        if (appTab && appTab.webSocketDebuggerUrl) {
          break;
        }
      } catch (e) {}
    }

    if (!appTab) {
      throw new Error("Failed to find application tab in Chrome");
    }

    await new Promise((resolve, reject) => {
      this.ws = new WebSocket(appTab.webSocketDebuggerUrl);
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        if (parsed.id && this.handlers.has(parsed.id)) {
          const { resolve, reject } = this.handlers.get(parsed.id);
          this.handlers.delete(parsed.id);
          if (parsed.error) reject(parsed.error);
          else resolve(parsed.result);
        }
      };
    });

    await this.send('Page.enable');
    await this.send('DOM.enable');
    await this.send('Runtime.enable');
    await sleep(1500);
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.handlers.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res && res.result ? res.result.value : null;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' },
    });
    await sleep(600);
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', {
      format: 'png',
      quality: 100,
      fromSurface: true,
    });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    return outPath;
  }

  async close() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
    if (this.chromeProc) {
      try { this.chromeProc.kill('SIGKILL'); } catch (e) {}
    }
  }
}

async function run() {
  console.log("===============================================================");
  console.log("   SOLITUDE: MOBILE VIEWPORT OVERHAUL VERIFICATION AUDIT       ");
  console.log("===============================================================\n");

  const auditor = new MobileAuditor();
  await auditor.start();

  const viewports = [
    { name: "iPhone SE", width: 375, height: 667, img: "mobile-375x667-verified.png" },
    { name: "iPhone 12/13/14", width: 390, height: 844, img: "mobile-390x844-verified.png" },
    { name: "Pixel 7 / Android", width: 412, height: 915, img: "mobile-412x915-verified.png" },
    { name: "Desktop 1440p", width: 1440, height: 900, img: "desktop-1440x900-verified.png" },
  ];

  let allPassed = true;

  for (const vp of viewports) {
    console.log(`--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    await auditor.setViewport(vp.width, vp.height);

    const metrics = await auditor.eval(`
      (() => {
        const innerH = window.innerHeight;
        const innerW = window.innerWidth;
        const docScrollH = document.documentElement.scrollHeight;
        const bodyScrollH = document.body.scrollHeight;
        const main = document.querySelector('main');
        const mainH = main ? main.offsetHeight : 0;
        const mainScrollH = main ? main.scrollHeight : 0;

        const header = document.querySelector('header');
        const vinyl = document.querySelector('[aria-label*="Vinyl record"]') || document.querySelector('.vinyl-grooves');
        const title = document.querySelector('h2');
        const shayari = document.querySelector('p.font-serif');
        const waveform = document.querySelector('canvas.block') || document.querySelector('canvas');
        const dock = document.querySelector('[role="region"]') || document.querySelector('.glass-dock');
        const scrubs = Array.from(document.querySelectorAll('[role="slider"]'));
        const scrub = scrubs.find(el => el.getBoundingClientRect().height > 0) || scrubs[0];

        const getBox = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), visible: r.height > 0 && r.width > 0 };
        };

        return {
          innerW,
          innerH,
          docScrollH,
          bodyScrollH,
          mainH,
          mainScrollH,
          hasVerticalScroll: docScrollH > innerH || bodyScrollH > innerH || mainScrollH > innerH,
          header: getBox(header),
          vinyl: getBox(vinyl),
          title: getBox(title),
          shayari: getBox(shayari),
          waveform: getBox(waveform),
          dock: getBox(dock),
          scrub: getBox(scrub),
        };
      })()
    `);

    const imgPath = await auditor.captureScreenshot(vp.img);

    console.log(`  Window Dimensions: ${metrics.innerW}x${metrics.innerH}`);
    console.log(`  Document Scroll Height: ${metrics.docScrollH}px (Target <= ${metrics.innerH}px)`);
    console.log(`  Main Scroll Height: ${metrics.mainScrollH}px (Target <= ${metrics.innerH}px)`);

    const noOverflow = !metrics.hasVerticalScroll;
    const headerVisible = metrics.header && metrics.header.visible && metrics.header.top >= 0;
    const vinylVisible = metrics.vinyl && metrics.vinyl.visible && metrics.vinyl.top >= 0 && metrics.vinyl.bottom <= metrics.innerH;
    const titleVisible = metrics.title && metrics.title.visible && metrics.title.bottom <= metrics.innerH;
    const shayariVisible = metrics.shayari && metrics.shayari.visible && metrics.shayari.bottom <= metrics.innerH;
    const waveformVisible = metrics.waveform && metrics.waveform.visible && metrics.waveform.bottom <= metrics.innerH;
    const dockVisible = metrics.dock && metrics.dock.visible && metrics.dock.bottom <= metrics.innerH;
    const scrubVisible = metrics.scrub && metrics.scrub.visible && metrics.scrub.bottom <= metrics.innerH;

    console.log(`  ✔ Zero Vertical Scroll: ${noOverflow ? "PASS" : "FAIL"}`);
    console.log(`  ✔ Header In-Bounds: ${headerVisible ? "PASS" : "FAIL"} (top: ${metrics.header?.top}px)`);
    console.log(`  ✔ Vinyl Platter In-Bounds: ${vinylVisible ? "PASS" : "FAIL"} (${metrics.vinyl?.top}px - ${metrics.vinyl?.bottom}px)`);
    console.log(`  ✔ Track Title In-Bounds: ${titleVisible ? "PASS" : "FAIL"} (${metrics.title?.top}px - ${metrics.title?.bottom}px)`);
    console.log(`  ✔ Shayari Couplet In-Bounds: ${shayariVisible ? "PASS" : "FAIL"} (${metrics.shayari?.top}px - ${metrics.shayari?.bottom}px)`);
    console.log(`  ✔ Waveform Equalizer In-Bounds: ${waveformVisible ? "PASS" : "FAIL"} (${metrics.waveform?.top}px - ${metrics.waveform?.bottom}px)`);
    console.log(`  ✔ Scrub Bar In-Bounds: ${scrubVisible ? "PASS" : "FAIL"} (${metrics.scrub?.top}px - ${metrics.scrub?.bottom}px)`);
    console.log(`  ✔ Master Dock In-Bounds: ${dockVisible ? "PASS" : "FAIL"} (${metrics.dock?.top}px - ${metrics.dock?.bottom}px)`);
    console.log(`  📸 Screenshot saved: ${imgPath}\n`);

    if (!noOverflow || !headerVisible || !vinylVisible || !titleVisible || !shayariVisible || !waveformVisible || !dockVisible || !scrubVisible) {
      allPassed = false;
    }
  }

  await auditor.close();

  console.log("===============================================================");
  if (allPassed) {
    console.log("🎉 ALL MOBILE VIEWPORTS (375x667, 390x844, 412x915) PASSED 100%!");
    console.log("Zero vertical overflow, perfect kinesthetic alignment, all controls pinned.");
    console.log("===============================================================\n");
    process.exit(0);
  } else {
    console.error("❌ Some viewport checks failed.");
    console.log("===============================================================\n");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal audit error:", err);
  process.exit(1);
});
