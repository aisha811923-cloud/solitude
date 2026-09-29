# Super Animations & Visual Physics Engine (SUPER_ANIMATIONS.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)  
Document Purpose: Advanced procedural rendering specifications, particle vector fields, condensation coalescence mathematics, vinyl anisotropic shaders, and CRT noise algorithms.  
Document Version: 2.0.0  
Target Environment: Google Antigravity IDE  

---

## 1. Rain Droplet Kinematics & Refraction Rendering

The rain system uses a 2D velocity vector field with gravity, horizontal wind shear, and kinetic splash calculations.

### 1.1 Droplet Physics Equations
For each drop i at frame t:

    v_x,i(t) = v_x,wind + delta_v_x,i
    v_y,i(t) = v_y,base * mu_i

    p_x,i(t + dt) = p_x,i(t) + v_x,i(t) * dt
    p_y,i(t + dt) = p_y,i(t) + v_y,i(t) * dt

Where:
* v_x,wind = -1.4 px/frame (constant nocturnal prevailing breeze)
* delta_v_x,i in [-0.2, 0.2] (stochastic air turbulence)
* v_y,base = 14.0 px/frame
* mu_i in [0.85, 1.25] (mass-to-drag scaling coefficient)

### 1.2 Impact Splashing Kinetics
When p_y,i >= H_viewport, a splash event is spawned:
* Spawn 2 to 4 micro-droplets with randomized upward velocity: v_y in [-2.0, -4.5] px/frame and spread angle theta in [pi/4, 3*pi/4].
* Splash particles decay over 8 frames using an exponential alpha taper: alpha(k) = alpha_0 * exp(-0.35 * k).

---

## 2. Condensation Adhesion, Surface Tension & Coalescence

Condensation beads collect on the outer virtual window glass. Droplets accumulate mass until gravity overcomes the capillary pinning force.

### 2.1 Static vs Dynamic Pinning Threshold

    F_gravity = m_i * g
    F_capillary = 2 * gamma * r_i * (cos(theta_R) - cos(theta_A))

* When F_gravity <= F_capillary: The droplet remains stationary (v_y = 0). It continuously accretes atmospheric moisture at rate dm/dt = k_humidity * r_i.
* When F_gravity > F_capillary: The droplet breaks pinning equilibrium and streaks downwards.

### 2.2 Streak Trail Deformation Algorithm
As a droplet slides, it deposits a decaying fluid trail:

    export function stepCondensationPhysics(drop: CondensationDrop, height: number) {
      if (!drop.isSlipping) {
        drop.weight += 0.004 * Math.random();
        if (drop.weight > drop.slipThreshold) {
          drop.isSlipping = true;
          drop.slipSpeed = 0.8;
        }
        return;
      }

      // Droplet slipping phase
      drop.y += drop.slipSpeed;
      drop.slipSpeed = Math.min(drop.slipSpeed + 0.08, 4.2);

      // Deposit trail point every 4 pixels of descent
      if (Math.floor(drop.y) % 4 === 0) {
        drop.trail.push({
          x: drop.x + (Math.random() - 0.5) * 0.8,
          y: drop.y,
          radius: drop.radius * 0.55,
          alpha: 0.28
        });
      }

      // Decay fluid trail
      for (let i = drop.trail.length - 1; i >= 0; i--) {
        drop.trail[i].alpha -= 0.0018;
        if (drop.trail[i].alpha <= 0) {
          drop.trail.splice(i, 1);
        }
      }

      // Reset when exiting screen bottom
      if (drop.y > height + 20) {
        drop.y = -10;
        drop.x = Math.random() * window.innerWidth;
        drop.weight = 0.05;
        drop.isSlipping = false;
        drop.slipSpeed = 0;
        drop.trail = [];
      }
    }

---

## 3. Vinyl Turntable Anisotropic Reflection Shader

To simulate genuine pressed vinyl, the turntable platter features circular micro-groove specular highlights that react to rotational angle.

### 3.1 CSS Radial-Conic Anisotropic Highlight
Applied to the vinyl disc overlay layer:

    .vinyl-anisotropic-layer {
      position: absolute;
      inset: 0;
      border-radius: 9999px;
      background: conic-gradient(
        from var(--vinyl-rotation, 0deg),
        rgba(255, 255, 255, 0.0) 0deg,
        rgba(255, 255, 255, 0.12) 45deg,
        rgba(255, 255, 255, 0.0) 90deg,
        rgba(255, 255, 255, 0.15) 225deg,
        rgba(255, 255, 255, 0.0) 270deg,
        rgba(255, 255, 255, 0.12) 315deg,
        rgba(255, 255, 255, 0.0) 360deg
      );
      pointer-events: none;
      mix-blend-mode: overlay;
    }

### 3.2 Inertial Platter Drag Deceleration
On pause, turntable rotational velocity decays with quadratic angular friction:

    omega(t) = omega_0 * (1 - (t / T_stop))^2   for 0 <= t <= T_stop

Where:
* T_stop = 1.2 seconds
* Continuous rotational period: T_nominal = 18.0 seconds (omega_0 = 20 deg/sec).

---

## 4. Atmospheric Candlelight Perlin Noise Flicker

The candlelight flame does not oscillate using periodic sine waves; it utilizes pseudo-random 1D Perlin noise to create organic draft micro-flickers.

    export function getCandleFlickerTransform(timeMs: number) {
      const t = timeMs * 0.003;
      const noiseScale = Math.sin(t) * 0.5 + Math.sin(t * 2.3) * 0.3 + Math.sin(t * 5.7) * 0.2;
      const noiseRotate = Math.sin(t * 0.8) * 0.6 + Math.sin(t * 3.1) * 0.4;

      const scaleY = 1.0 + noiseScale * 0.08;
      const scaleX = 1.0 - noiseScale * 0.05;
      const rotationDeg = noiseRotate * 2.2;
      const glowAlpha = 0.65 + noiseScale * 0.25;

      return {
        transform: `scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}) rotate(${rotationDeg.toFixed(2)}deg)`,
        filter: `drop-shadow(0 0 10px rgba(245, 158, 11, ${glowAlpha.toFixed(2)})) drop-shadow(0 0 24px rgba(217, 119, 6, 0.35))`
      };
    }

---

## 5. CRT Scanline & Grain Post-Processing

Layer 2 of the viewport applies an analog film grain shader over the ambient cityscape:

    .crt-scanlines {
      background: linear-gradient(
        rgba(18, 16, 16, 0) 50%, 
        rgba(0, 0, 0, 0.25) 50%
      ), linear-gradient(
        90deg,
        rgba(255, 0, 0, 0.03),
        rgba(0, 255, 0, 0.01),
        rgba(0, 0, 255, 0.03)
      );
      background-size: 100% 3px, 3px 100%;
      pointer-events: none;
    }