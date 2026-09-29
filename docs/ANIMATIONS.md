# Visual Effects & Animation Specifications (ANIMATIONS.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Detailed mathematical models, physics equations, Canvas 2D render loops, CSS keyframes, and Framer Motion transitions for atmospheric visual effects.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. HTML5 Canvas 2D Rain Simulation Engine

The rain visualizer runs behind all UI layers on a full-screen hardware-accelerated 2D canvas context. It simulates two distinct physical phenomena: falling raindrops in the atmosphere and static condensation droplets trickling down the glass windowpane.

### 1.1 Canvas Setup & High-DPI Scaling

    export function initializeCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
      const ctx = canvas.getContext("2d", { alpha: true })!;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x to preserve GPU performance

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.scale(dpr, dpr);
      return ctx;
    }

---

### 1.2 Falling Raindrops Particle Physics

120 active raindrop vectors fall continuously with simulated terminal velocity and wind shear.

#### Data Structure
    export interface Drop {
      x: number;
      y: number;
      length: number;
      speedY: number;
      speedX: number;
      opacity: number;
      thickness: number;
    }

#### Vector Equations & Initialization
* Vertical Velocity (speedY): Uniform random distribution between 12 px/frame and 18 px/frame.
* Horizontal Velocity (speedX): Wind shear constant at -1.4 px/frame (simulating steady left-drifting wind).
* Drop Length: Proportional to vertical speed: length = speedY * 1.8 (yielding lengths between 21.6 px and 32.4 px).
* Opacity: Between 0.15 and 0.35.

#### Physics Update & Reset Logic
    export function updateRaindrop(drop: Drop, width: number, height: number, speedMultiplier: number = 1.0) {
      drop.y += drop.speedY * speedMultiplier;
      drop.x += drop.speedX * speedMultiplier;

      // Reset when drop exits viewport bottom or left
      if (drop.y > height) {
        drop.y = -drop.length;
        drop.x = Math.random() * (width + 200); // Offset to account for wind angle
      }
      if (drop.x < -50) {
        drop.x = width + 50;
      }
    }

#### Canvas Drawing Method
    export function drawRaindrop(ctx: CanvasRenderingContext2D, drop: Drop) {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + drop.speedX * 1.2, drop.y + drop.length);
      ctx.strokeStyle = `rgba(180, 210, 240, ${drop.opacity})`;
      ctx.lineWidth = drop.thickness;
      ctx.lineCap = "round";
      ctx.stroke();
    }

---

### 1.3 Condensation & Window Glass Streaks

35 stationary condensation beads adhere to the window glass. Droplets collect moisture until their mass overcomes surface tension, causing them to slip downward and leave a decaying trail.

#### Data Structure
    export interface CondensationDrop {
      x: number;
      y: number;
      radius: number;
      weight: number;
      slipThreshold: number;
      isSlipping: boolean;
      slipSpeed: number;
      trail: { x: number; y: number; radius: number; alpha: number }[];
    }

#### Slipping Logic
* Droplets accumulate weight: weight += Math.random() * 0.008 per frame.
* When weight > slipThreshold (0.85 to 1.25), isSlipping = true.
* Slipping velocity: slipSpeed = Math.min(slipSpeed + 0.12, 4.5) px/frame.
* As the droplet slips, it leaves stationary trail points: trail.push({ x: drop.x, y: drop.y, radius: drop.radius * 0.6, alpha: 0.25 }).
* Trail points decay: alpha -= 0.002 per frame. When alpha <= 0, they are pruned from memory.
* When slipping drop reaches viewport bottom: reset to random position at top (y = Math.random() * 80), reset weight = 0.1, isSlipping = false, slipSpeed = 0.

#### Canvas Condensation Drawing Method
    export function drawCondensation(ctx: CanvasRenderingContext2D, drop: CondensationDrop) {
      // 1. Draw decaying streak trail
      for (let i = 0; i < drop.trail.length; i++) {
        const t = drop.trail[i];
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 225, 255, ${t.alpha})`;
        ctx.fill();
      }

      // 2. Draw active primary bead
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220, 235, 255, 0.4)";
      ctx.fill();

      // 3. Specular highlight (simulating streetlamp reflection)
      ctx.beginPath();
      ctx.arc(drop.x - drop.radius * 0.3, drop.y - drop.radius * 0.3, drop.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fill();
    }

---

## 2. Candle Flame Physics & Keyframes (CSS)

The candle in the bottom dock features dynamic micro-flickering, gentle drafts, and an extinguish sequence.

### 2.1 Flame Core & Halos CSS Keyframes

    @keyframes flameFlicker {
      0%, 100% {
        transform: scale(1) rotate(-1deg);
        filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.75)) drop-shadow(0 0 20px rgba(217, 119, 6, 0.4));
      }
      25% {
        transform: scale(0.96, 1.05) rotate(1.5deg);
        filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.85)) drop-shadow(0 0 24px rgba(217, 119, 6, 0.5));
      }
      50% {
        transform: scale(1.03, 0.94) rotate(-0.5deg);
        filter: drop-shadow(0 0 7px rgba(245, 158, 11, 0.65)) drop-shadow(0 0 16px rgba(217, 119, 6, 0.35));
      }
      75% {
        transform: scale(0.98, 1.02) rotate(2deg);
        filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.9)) drop-shadow(0 0 28px rgba(217, 119, 6, 0.6));
      }
    }

    @keyframes flameExtinguish {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      40% {
        transform: scale(1.3, 0.4) skewX(25deg);
        opacity: 0.8;
      }
      100% {
        transform: scale(0.1, 0.1) translateY(-10px);
        opacity: 0;
      }
    }

    @keyframes smokeRise {
      0% {
        transform: translateY(0) scale(0.8);
        opacity: 0.6;
      }
      100% {
        transform: translateY(-24px) scale(2.2);
        opacity: 0;
      }
    }

---

## 3. Vinyl Disc Turntable Animation Engine

The center vinyl record rotates continuously while music is playing and decelerates with physical inertia when paused.

### 3.1 Continuous Rotation & Inertial Deceleration

    /* Spin keyframe running continuously during playback */
    @keyframes spinVinyl {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Applied dynamically via React ref */
    .vinyl-spinning {
      animation: spinVinyl 18s linear infinite;
    }

### 3.2 Inertial Stop Math
When playback pauses, instead of an abrupt freeze, the element transitions using a turntable motor curve:

    export function pauseVinylWithInertia(vinylElement: HTMLElement) {
      const computedStyle = window.getComputedStyle(vinylElement);
      const matrix = new DOMMatrix(computedStyle.transform);
      const currentAngle = Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));
      const normalizedAngle = currentAngle < 0 ? currentAngle + 360 : currentAngle;

      // Stop continuous keyframe
      vinylElement.classList.remove("vinyl-spinning");

      // Add 45 degrees of inertial drag over 1200ms
      const finalAngle = normalizedAngle + 45;
      vinylElement.style.transition = "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)";
      vinylElement.style.transform = `rotate(${finalAngle}deg)`;
    }

---

## 4. UI Transition & Spring Physics (Framer Motion)

### 4.1 Slide-Over Queue Drawer
* Spring Settings: stiffness: 300, damping: 28, mass: 0.8.
* Variants:
    export const drawerVariants = {
      closed: { x: "100%", opacity: 0.4, transition: { type: "spring", stiffness: 320, damping: 32 } },
      open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 28 } }
    };

### 4.2 Track Metadata Slide-Crossfade
Executes when skipping between tracks (`N` / `P`):
    export const metadataCrossfadeVariants = {
      initial: { opacity: 0, y: 10, filter: "blur(4px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] } },
      exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }
    };

### 4.3 Ambient Soundboard Popover
Pops up above the master dock with anchor origin at bottom-left:
    export const popoverVariants = {
      closed: { scale: 0.94, opacity: 0, y: 12, pointerEvents: "none" },
      open: { scale: 1.0, opacity: 1, y: 0, pointerEvents: "auto", transition: { type: "spring", stiffness: 340, damping: 26 } }
    };

---

## 5. Audio-Reactive Visualizer (Analysers & Equalizers)

Three miniature animated bars inside the active track item in the queue drawer:

    @keyframes eqBarPulse1 {
      0%, 100% { height: 4px; }
      50% { height: 16px; }
    }
    @keyframes eqBarPulse2 {
      0%, 100% { height: 14px; }
      50% { height: 6px; }
    }
    @keyframes eqBarPulse3 {
      0%, 100% { height: 8px; }
      50% { height: 18px; }
    }

    .eq-bar-1 { animation: eqBarPulse1 0.75s ease-in-out infinite; }
    .eq-bar-2 { animation: eqBarPulse2 0.55s ease-in-out infinite; }
    .eq-bar-3 { animation: eqBarPulse3 0.85s ease-in-out infinite; }