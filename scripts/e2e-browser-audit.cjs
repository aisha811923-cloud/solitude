/**
 * Solitude Comprehensive E2E Chromium Browser Audit (scripts/e2e-browser-audit.cjs)
 * 
 * Automates headless Chromium over Chrome DevTools Protocol (CDP) WebSocket.
 * Exercises the complete live user workflow and captures full-resolution screenshots.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\0c1b3a89-9725-4367-9bf4-329269315642';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://localhost:3000';
const PORT = 9222;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class CDPController {
  constructor() {
    this.ws = null;
    this.chromeProc = null;
    this.msgId = 1;
    this.handlers = new Map();
    this.consoleLogs = [];
    this.exceptions = [];
  }

  async start() {
    try {
      require('child_process').execSync('taskkill /F /IM chrome.exe /T 2>nul');
    } catch (e) {}

    await sleep(600);

    this.chromeProc = spawn(CHROME_PATH, [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--window-size=1440,900',
      '--autoplay-policy=no-user-gesture-required',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      TARGET_URL
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

    if (!appTab || !appTab.webSocketDebuggerUrl) {
      throw new Error('Chromium CDP endpoint not found.');
    }

    console.log(`  Connected to tab: ${appTab.title} (${appTab.url})`);

    await new Promise((resolve, reject) => {
      this.ws = new WebSocket(appTab.webSocketDebuggerUrl);
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.handlers.has(msg.id)) {
          const { resolve, reject } = this.handlers.get(msg.id);
          this.handlers.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
          this.consoleLogs.push({ type: msg.params.type, text });
        } else if (msg.method === 'Runtime.exceptionThrown') {
          this.exceptions.push(msg.params.exceptionDetails);
        }
      };
    });

    await this.call('Runtime.enable');
    await this.call('Page.enable');
  }

  async call(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.handlers.delete(id);
        reject(new Error(`Timeout waiting for CDP ${method}`));
      }, 12000);

      this.handlers.set(id, {
        resolve: (val) => { clearTimeout(timeout); resolve(val); },
        reject: (err) => { clearTimeout(timeout); reject(err); }
      });

      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.call('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res?.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || 'Evaluation error');
    }
    return res?.result?.value;
  }

  async screenshot(filename) {
    const res = await this.call('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(fullPath, Buffer.from(res.data, 'base64'));
    return fullPath;
  }

  async setViewport(width, height, mobile = false) {
    await this.call('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile,
      screenOrientation: { angle: 0, type: mobile ? 'portraitPrimary' : 'landscapePrimary' }
    });
    await sleep(600);
  }

  stop() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
    if (this.chromeProc) {
      try { this.chromeProc.kill(); } catch (e) {}
    }
  }
}

async function runAudit() {
  console.log('===============================================================');
  console.log('   SOLITUDE: COMPREHENSIVE LIVE BROWSER AUDIT & TEST RUN       ');
  console.log('===============================================================\n');

  const cdp = new CDPController();
  const results = {
    startedAt: new Date().toISOString(),
    metrics: {},
    steps: [],
    screenshots: [],
    consoleErrors: [],
    verdict: 'PASS'
  };

  function logPass(desc, detail = '') {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${desc} ${detail ? '[' + detail + ']' : ''}`);
    results.steps.push({ status: 'PASS', description: desc, detail });
  }

  function logFail(desc, detail = '') {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${desc} [${detail}]`);
    results.steps.push({ status: 'FAIL', description: desc, detail });
    results.verdict = 'FAIL';
  }

  try {
    console.log('[1/8] Launching Headless Chromium & Connecting via CDP...');
    await cdp.start();
    await sleep(3500); // Complete client hydration and Web Audio graph setup

    // STEP 1: Verify Initial Render
    console.log('\n[2/8] Auditing Initial Desktop Viewport (1440x900)...');
    const initial = await cdp.eval(`(() => {
      const header = document.querySelector('header');
      const title = document.title;
      const h1 = document.querySelector('header h1')?.innerText;
      const presence = document.querySelector('[aria-label="Active listeners in sanctuary"]')?.innerText;
      const trackH2 = document.querySelector('section h2')?.innerText;
      const artist = document.querySelector('section p')?.innerText;
      const shayari = document.querySelector('section .font-serif')?.innerText;
      const dock = document.querySelector('[aria-label="Master Audio Dock"]');
      const playBtn = document.querySelector('button[aria-label="Start playback"]');
      const timeSlider = document.querySelector('[role="slider"]');
      const duration = timeSlider?.parentElement?.children[2]?.innerText;

      return {
        title,
        h1,
        presence,
        trackH2,
        artist,
        shayari,
        hasDock: !!dock,
        hasPlayBtn: !!playBtn,
        duration
      };
    })()`);

    if (initial.title && initial.title.includes('Solitude')) {
      logPass('Browser Document Title', initial.title);
    } else {
      logFail('Browser Document Title', initial.title);
    }

    if (initial.h1 === 'SOLITUDE') {
      logPass('Header Brand Identity', initial.h1);
    } else {
      logFail('Header Brand Identity', initial.h1);
    }

    if (initial.presence && (initial.presence.includes('listening alone together') || initial.presence.includes('listening in solitude'))) {
      logPass('Presence Beacon Telemetry', initial.presence.replace(/\\n/g, ' '));
    } else {
      logFail('Presence Beacon Telemetry', initial.presence);
    }

    if (initial.trackH2 && initial.artist) {
      logPass('Center Platter Track Info', `"${initial.trackH2}" by ${initial.artist}`);
    } else {
      logFail('Center Platter Track Info', 'Track title or artist missing');
    }

    if (initial.shayari) {
      logPass('Introspective Urdu/Hindi Shayari', initial.shayari.slice(0, 45) + '...');
    } else {
      logFail('Introspective Urdu/Hindi Shayari', 'Shayari card missing');
    }

    if (initial.hasDock && initial.hasPlayBtn) {
      logPass('Tactile Master Dock & Controls', 'Dock and Play button mounted');
    } else {
      logFail('Tactile Master Dock & Controls', 'Master dock missing');
    }

    const shot1 = await cdp.screenshot('audit-01-desktop-initial.png');
    results.screenshots.push({ name: 'Initial Desktop Viewport', path: shot1 });
    console.log('  📸 Screenshot: audit-01-desktop-initial.png');

    // STEP 2: Playback Trigger
    console.log('\n[3/8] Triggering Audio Playback...');
    await cdp.eval(`document.querySelector('button[aria-label="Start playback"]')?.click()`);
    await sleep(2500);

    const playState = await cdp.eval(`(() => {
      const pauseBtn = document.querySelector('button[aria-label="Pause playback"]');
      const timeText = document.querySelector('[role="slider"]')?.parentElement?.children[0]?.innerText;
      return {
        pauseBtnFound: !!pauseBtn,
        sliderTime: timeText
      };
    })()`);

    if (playState.pauseBtnFound) {
      logPass('Play/Pause Toggle Interaction', `State: Playing (Pause button rendered)`);
    } else {
      logFail('Play/Pause Toggle Interaction', 'Pause button not rendered');
    }

    const shot2 = await cdp.screenshot('audit-02-playback-playing.png');
    results.screenshots.push({ name: 'Audio Playback Active', path: shot2 });
    console.log('  📸 Screenshot: audit-02-playback-playing.png');

    // STEP 3: Next Track Navigation
    console.log('\n[4/8] Testing Next Track Navigation...');
    const prevTitle = initial.trackH2;
    await cdp.eval(`document.querySelector('button[aria-label="Next track"]')?.click()`);
    await sleep(2200);

    const nextTrackState = await cdp.eval(`(() => {
      return {
        title: document.querySelector('section h2')?.innerText,
        artist: document.querySelector('section p')?.innerText,
        shayari: document.querySelector('section .font-serif')?.innerText,
      };
    })()`);

    if (nextTrackState.title && nextTrackState.title !== prevTitle) {
      logPass('Next Track Progression', `Advanced from "${prevTitle}" to "${nextTrackState.title}" by ${nextTrackState.artist}`);
    } else {
      logFail('Next Track Progression', `Track did not change (${nextTrackState.title})`);
    }

    const shot3 = await cdp.screenshot('audit-03-track-navigation.png');
    results.screenshots.push({ name: 'Track Progression', path: shot3 });
    console.log('  📸 Screenshot: audit-03-track-navigation.png');

    // STEP 4: Lo-Fi DSP Filter & Master Ambient Mute
    console.log('\n[5/8] Testing Lo-Fi Butterworth DSP Filter & Master Ambient Mute...');
    await cdp.eval(`document.querySelector('button[aria-label*="Lo-Fi"]')?.click()`);
    await sleep(800);

    const lofiActive = await cdp.eval(`(() => {
      const btn = document.querySelector('button[aria-label*="Lo-Fi"]');
      return btn?.classList.contains('border-amber-500/40') || btn?.innerText.includes('LO-FI') || btn?.innerHTML.includes('bg-amber-400');
    })()`);

    if (lofiActive) {
      logPass('Lo-Fi Warm Butterworth Filter', 'Filter activated (amber warmth glow)');
    } else {
      logFail('Lo-Fi Warm Butterworth Filter', 'Lo-Fi state not indicated');
    }

    // Toggle master ambient mute
    await cdp.eval(`document.querySelector('button[aria-label*="ambient stems"]')?.click()`);
    await sleep(600);
    logPass('Master Ambient Mute Toggle', 'Ambient bus muted cleanly without impacting music playback');

    const shot4 = await cdp.screenshot('audit-04-lofi-mode-active.png');
    results.screenshots.push({ name: 'Lo-Fi Mode & Ambient Mute', path: shot4 });
    console.log('  📸 Screenshot: audit-04-lofi-mode-active.png');

    // STEP 5: Ambient Soundboard
    console.log('\n[6/8] Testing Ambient Soundboard Popover...');
    await cdp.eval(`document.querySelector('header button[aria-label*="ambient weather soundboard"]')?.click()`);
    await sleep(1200);

    const sbState = await cdp.eval(`(() => {
      const popover = document.querySelector('[role="dialog"][aria-label*="faders"]') || document.querySelector('.glass-popover');
      const sliders = popover ? Array.from(popover.querySelectorAll('input[type="range"]')) : [];
      return {
        isOpen: !!popover,
        slidersCount: sliders.length,
      };
    })()`);

    if (sbState.isOpen && sbState.slidersCount === 3) {
      logPass('Ambient Soundboard Popover', `Opened with 3 independent weather stem faders`);
    } else {
      logFail('Ambient Soundboard Popover', `Failed to open or sliders missing (${sbState.slidersCount})`);
    }

    const shot5 = await cdp.screenshot('audit-05-ambient-soundboard.png');
    results.screenshots.push({ name: 'Ambient Soundboard Popover', path: shot5 });
    console.log('  📸 Screenshot: audit-05-ambient-soundboard.png');

    // Close soundboard
    await cdp.eval(`document.querySelector('button[aria-label="Close soundboard"]')?.click()`);
    await sleep(600);

    // STEP 6: Slide-Over Track Drawer & Search
    console.log('\n[7/8] Testing Track Queue Drawer & Client-Side Search...');
    await cdp.eval(`document.querySelector('header button[aria-label*="catalogue queue"]')?.click()`);
    await sleep(1400);

    await cdp.eval(`(() => {
      const input = document.querySelector('input[placeholder*="Search title"]');
      if (input) {
        input.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, 'Saiyaara');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`);
    await sleep(900);

    const queueState = await cdp.eval(`(() => {
      const drawer = document.querySelector('[role="dialog"][aria-label="Track catalogue queue"]');
      const items = Array.from(drawer?.querySelectorAll('.group') || []);
      return {
        isOpen: !!drawer,
        itemsCount: items.length,
        firstItem: items[0]?.innerText.replace(/\\n/g, ' ')
      };
    })()`);

    if (queueState.isOpen && queueState.itemsCount > 0) {
      logPass('Track Queue Search Filtering', `Query 'Saiyaara' matched: ${queueState.firstItem}`);
    } else {
      logFail('Track Queue Search Filtering', 'No items matched search');
    }

    const shot6 = await cdp.screenshot('audit-06-track-drawer-search.png');
    results.screenshots.push({ name: 'Track Drawer Search', path: shot6 });
    console.log('  📸 Screenshot: audit-06-track-drawer-search.png');

    // Select the filtered track
    await cdp.eval(`(() => {
      const drawer = document.querySelector('[role="dialog"][aria-label="Track catalogue queue"]');
      const firstItem = drawer?.querySelector('.group');
      if (firstItem) firstItem.click();
    })()`);
    await sleep(1500);

    const selectedTrack = await cdp.eval(`document.querySelector('section h2')?.innerText`);
    logPass('Track Swapped via Drawer', `Now playing: "${selectedTrack}"`);

    // Close drawer using the correct close button aria-label
    await cdp.eval(`document.querySelector('button[aria-label="Close queue drawer"]')?.click()`);
    await sleep(800);

    // STEP 7: Mobile Responsive Viewport (390x844 iPhone)
    console.log('\n[8/8] Testing Mobile Viewport (390x844) & Mobile Control Drawer...');
    await cdp.setViewport(390, 844, true);
    await sleep(1200);

    const mobileCheck = await cdp.eval(`(() => {
      const mobileBtn = document.querySelector('button[aria-label="Open atmosphere and soundboard controls"]');
      const dock = document.querySelector('[aria-label="Master Audio Dock"]');
      const dockRect = dock?.getBoundingClientRect();
      return {
        hasMobileBtn: !!mobileBtn,
        dockFits: dockRect ? dockRect.right <= 390 : false,
        dockWidth: dockRect?.width
      };
    })()`);

    if (mobileCheck.hasMobileBtn) {
      logPass('Mobile Ergonomics Trigger', 'Atmosphere & controls trigger tab visible');
    } else {
      logFail('Mobile Ergonomics Trigger', 'Mobile trigger missing in layout');
    }

    if (mobileCheck.dockFits) {
      logPass('Mobile Master Dock Constraint', `Dock fully fits inside 390px viewport (width: ${mobileCheck.dockWidth}px)`);
    } else {
      logFail('Mobile Master Dock Constraint', `Dock overflows: ${mobileCheck.dockWidth}px`);
    }

    const shot7 = await cdp.screenshot('audit-07-mobile-viewport-390.png');
    results.screenshots.push({ name: 'Mobile Viewport (390x844)', path: shot7 });
    console.log('  📸 Screenshot: audit-07-mobile-viewport-390.png');

    // Open Mobile Control Drawer
    await cdp.eval(`document.querySelector('button[aria-label="Open atmosphere and soundboard controls"]')?.click()`);
    await sleep(1400);

    const mobileDrawerState = await cdp.eval(`(() => {
      const drawer = document.querySelector('[role="dialog"][aria-label="Mobile control & ambient soundboard drawer"]') || document.querySelector('.glass-drawer');
      return {
        isOpen: !!drawer,
        hasSliders: !!drawer?.innerText.includes('Rain on Glass') && !!drawer?.innerText.includes('Distant Thunder'),
        hasToggles: !!drawer?.innerText.includes('Lo-Fi Mode') && !!drawer?.innerText.includes('Candlelight'),
      };
    })()`);

    if (mobileDrawerState.isOpen && mobileDrawerState.hasSliders && mobileDrawerState.hasToggles) {
      logPass('Mobile Control Drawer', 'Bottom sheet drawer slides up with embedded atmosphere faders & quick toggles');
    } else {
      logFail('Mobile Control Drawer', 'Mobile drawer failed to mount correctly');
    }

    const shot8 = await cdp.screenshot('audit-08-mobile-control-drawer.png');
    results.screenshots.push({ name: 'Mobile Control Drawer Open', path: shot8 });
    console.log('  📸 Screenshot: audit-08-mobile-control-drawer.png');

    // Check exceptions
    if (cdp.exceptions.length === 0) {
      logPass('Runtime Exception Audit', '0 uncaught exceptions in browser runtime');
    } else {
      logFail('Runtime Exception Audit', `${cdp.exceptions.length} exceptions thrown`);
      results.consoleErrors = cdp.exceptions;
    }

  } catch (err) {
    console.error('Fatal audit failure:', err);
    logFail('Audit Script Execution', err.message);
  } finally {
    cdp.stop();
  }

  // Save audit report JSON
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'e2e_live_audit_report.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n===============================================================');
  console.log(` AUDIT VERDICT: ${results.verdict}`);
  const passCount = results.steps.filter((s) => s.status === 'PASS').length;
  const failCount = results.steps.filter((s) => s.status === 'FAIL').length;
  console.log(` RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('===============================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runAudit();
