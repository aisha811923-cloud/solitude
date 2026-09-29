# Testing Strategy & Quality Assurance Protocol (TESTING.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Automated test suites, Web Audio API hardware mocking harness, state machine verification, audio parameter assertions, and performance benchmarking.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Testing Philosophy & Scope

Because Solitude is an audio-first, hardware-accelerated ambient application, standard DOM testing alone is insufficient. The verification strategy spans four distinct layers:

1. Web Audio API Unit Tests: Mocking AudioContext, BiquadFilterNode, and GainNode to assert DSP frequency cutoff transitions and zero-click gain ramps.
2. State Machine Integration Tests: Verifying audio state transitions (STANDBY -> BUFFERING -> PLAYING -> CROSSFADING) under network latency and error conditions.
3. User Interaction & Input Isolation Tests: Verifying that global hotkeys (Space, N, P, Q, /) are properly neutralized when typing in search fields.
4. Canvas & Memory Performance Tests: Benchmarking the 60 FPS rain loop and ensuring clean disconnection of audio nodes to prevent memory leaks.

---

## 2. Web Audio API Mocking Harness

Modern headless test environments (such as Jest or Vitest in JSDOM) lack native Web Audio API implementations. A deterministic mock suite must be registered in test setups (tests/setupAudioMock.ts).

### 2.1 Audio Node Mock Implementation

    export class MockAudioParam {
      value: number;
      defaultValue: number;

      constructor(defaultValue: number = 0) {
        this.value = defaultValue;
        this.defaultValue = defaultValue;
      }

      setValueAtTime(value: number, _startTime: number): MockAudioParam {
        this.value = value;
        return this;
      }

      linearRampToValueAtTime(value: number, _endTime: number): MockAudioParam {
        this.value = value;
        return this;
      }

      exponentialRampToValueAtTime(value: number, _endTime: number): MockAudioParam {
        this.value = value;
        return this;
      }

      cancelScheduledValues(_startTime: number): MockAudioParam {
        return this;
      }
    }

    export class MockGainNode {
      gain: MockAudioParam;
      connectedTo: any = null;

      constructor() {
        this.gain = new MockAudioParam(1);
      }

      connect(destination: any) {
        this.connectedTo = destination;
      }

      disconnect() {
        this.connectedTo = null;
      }
    }

    export class MockBiquadFilterNode {
      type: BiquadFilterType = "allpass";
      frequency: MockAudioParam;
      Q: MockAudioParam;
      connectedTo: any = null;

      constructor() {
        this.frequency = new MockAudioParam(20000);
        this.Q = new MockAudioParam(0.707);
      }

      connect(destination: any) {
        this.connectedTo = destination;
      }

      disconnect() {
        this.connectedTo = null;
      }
    }

    export class MockAudioContext {
      state: "suspended" | "running" | "closed" = "suspended";
      currentTime: number = 0;
      destination: any = {};

      async resume() {
        this.state = "running";
      }

      async close() {
        this.state = "closed";
      }

      createGain() {
        return new MockGainNode();
      }

      createBiquadFilter() {
        return new MockBiquadFilterNode();
      }

      createBuffer(channels: number, length: number, sampleRate: number) {
        return { channels, length, sampleRate };
      }

      createBufferSource() {
        return {
          buffer: null,
          connect: (_dest: any) => {},
          start: (_time: number) => {},
          stop: (_time: number) => {},
          disconnect: () => {}
        };
      }
    }

---

## 3. Web Audio Unit Tests (tests/unit/audio.test.ts)

### 3.1 Lo-Fi Filter DSP Sweep Test

    import { activateLoFi, deactivateLoFi } from "@/lib/audio/filterNode";
    import { MockAudioContext, MockBiquadFilterNode } from "../setupAudioMock";

    describe("Lo-Fi BiquadFilterNode Transitions", () => {
      let ctx: MockAudioContext;
      let filter: MockBiquadFilterNode;

      beforeEach(() => {
        ctx = new MockAudioContext();
        filter = ctx.createBiquadFilter();
      });

      test("activateLoFi switches type to lowpass and sweeps to 850 Hz", () => {
        activateLoFi(filter as any, ctx as any);
        
        expect(filter.type).toBe("lowpass");
        expect(filter.frequency.value).toBe(850);
        expect(filter.Q.value).toBe(3.5);
      });

      test("deactivateLoFi sweeps back to flat 20000 Hz bypass", () => {
        activateLoFi(filter as any, ctx as any);
        deactivateLoFi(filter as any, ctx as any);

        expect(filter.frequency.value).toBe(20000);
        expect(filter.Q.value).toBe(0.707);
      });
    });

### 3.2 Perceptual Logarithmic Volume Curve Test

    import { calculatePerceptualGain } from "@/lib/audio/gainCurves";

    describe("Gain Staging Calculations", () => {
      test("50% slider value maps to 25% acoustic power", () => {
        const gain = calculatePerceptualGain(0.5);
        expect(gain).toBeCloseTo(0.25, 4);
      });

      test("boundary conditions clamp securely between 0 and 1", () => {
        expect(calculatePerceptualGain(-0.2)).toBe(0);
        expect(calculatePerceptualGain(1.5)).toBe(1);
        expect(calculatePerceptualGain(0)).toBe(0);
        expect(calculatePerceptualGain(1)).toBe(1);
      });
    });

---

## 4. Input Target Isolation & Hotkey Tests (tests/unit/shortcuts.test.ts)

    import { isInputTarget } from "@/hooks/useKeyboardShortcuts";

    describe("Keyboard Input Isolation Guard", () => {
      test("identifies standard HTML input fields as active input targets", () => {
        const inputElem = document.createElement("input");
        const event = { target: inputElem } as unknown as KeyboardEvent;
        expect(isInputTarget(event)).toBe(true);
      });

      test("identifies textarea elements as active input targets", () => {
        const textareaElem = document.createElement("textarea");
        const event = { target: textareaElem } as unknown as KeyboardEvent;
        expect(isInputTarget(event)).toBe(true);
      });

      test("identifies contenteditable containers as active input targets", () => {
        const editableElem = document.createElement("div");
        editableElem.contentEditable = "true";
        const event = { target: editableElem } as unknown as KeyboardEvent;
        expect(isInputTarget(event)).toBe(true);
      });

      test("returns false for standard button, document body, or vinyl disc clicks", () => {
        const buttonElem = document.createElement("button");
        const event = { target: buttonElem } as unknown as KeyboardEvent;
        expect(isInputTarget(event)).toBe(false);
      });
    });

---

## 5. Circadian Algorithm & Fallback Tests (tests/unit/presence.test.ts)

    import { getCircadianBaseline } from "@/hooks/usePresence";

    describe("Circadian Nocturnal Presence Model", () => {
      test("generates peak listener counts at 1:30 AM midnight sanctuary", () => {
        const midnightDate = new Date();
        midnightDate.setHours(1, 30, 0, 0);

        const count = getCircadianBaseline(midnightDate);
        expect(count).toBeGreaterThanOrEqual(450);
        expect(count).toBeLessThanOrEqual(580);
      });

      test("tapers smoothly during midday daylight hours (14:00 PM)", () => {
        const afternoonDate = new Date();
        afternoonDate.setHours(14, 0, 0, 0);

        const count = getCircadianBaseline(afternoonDate);
        expect(count).toBeGreaterThanOrEqual(90);
        expect(count).toBeLessThanOrEqual(200);
      });
    });

---

## 6. End-to-End Smoke Verification Checklist

Run these manual or automated Playwright smoke tests before production deployment:

+----+--------------------------------+-------------------------------------------------------------+
| No | Test Case                      | Expected Result                                             |
+----+--------------------------------+-------------------------------------------------------------+
| 01 | First Click Autoplay Unlock    | AudioContext status changes from suspended to running.      |
| 02 | Track Next Skip (N key)        | 150ms crossfade executes; track index increments from 0 to 1|
| 03 | Spacebar in Search Input       | Space character prints in input field; song continues playing|
| 04 | Lo-Fi Toggle Click             | Audio muffles instantly; dock Lo-Fi button glows warm amber |
| 05 | Queue Drawer Open (Q key)      | Right drawer slides in with spring; active song highlighted |
| 06 | Scrub Bar Drag                 | Audio element currentTime seeks accurately; no buffer stall |
| 07 | Environmental Lighting Click   | Background tint shifts through Candle, Midnight, Dusk, Void |
| 08 | Soundboard Rain Fader Drag     | Rain background loop volume shifts without affecting music  |
+----+--------------------------------+-------------------------------------------------------------+