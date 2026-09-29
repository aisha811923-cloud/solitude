/**
 * Fullscreen 60 FPS Canvas Rain & Condensation Engine (components/canvas/RainCanvas.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Rendering: Hardware-accelerated Canvas 2D decoupled from React state reconciliation
 * 
 * Physics Specifications:
 * - 120 active raindrop vectors with terminal velocity, wind shear drift, and window sill splashes.
 * - 35 glass condensation droplets with mass accumulation, surface tension breakaway, and decaying trails.
 * - Auto-scaling High-DPI support (devicePixelRatio capped at 2 to preserve GPU fill rate).
 * - Page Visibility API lifecycle optimization (throttles to 0 FPS when tab is obscured).
 * - Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React, { useEffect, useRef } from "react";
import { RainDrop, CondensationDroplet } from "@/types/contracts";

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  radius: number;
}

interface RainCanvasProps {
  speedMultiplier?: number;
  rainDensityMultiplier?: number;
  className?: string;
}

const DEFAULT_DROP_COUNT = 120;
const DEFAULT_CONDENSATION_COUNT = 35;
const WIND_SHEAR_X = -1.4;

export const RainCanvas: React.FC<RainCanvasProps> = ({
  speedMultiplier = 1.0,
  rainDensityMultiplier = 1.0,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isTabVisible = document.visibilityState === "visible";

    // Decoupled Physics State Arrays (Pure JS to prevent React render cycles)
    let raindrops: RainDrop[] = [];
    let condensationDrops: CondensationDroplet[] = [];
    let splashParticles: SplashParticle[] = [];

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ------------------------------------------------------------------------
    // 1. CANVAS SIZING & RESOLUTION NORMALIZATION
    // ------------------------------------------------------------------------
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    // ------------------------------------------------------------------------
    // 2. PARTICLE SYSTEM INITIALIZATION
    // ------------------------------------------------------------------------
    const initRaindrops = () => {
      const targetCount = Math.floor(DEFAULT_DROP_COUNT * rainDensityMultiplier);
      raindrops = [];
      for (let i = 0; i < targetCount; i++) {
        const speedY = 12 + Math.random() * 6; // 12 to 18 px/frame
        raindrops.push({
          x: Math.random() * (width + 300) - 100,
          y: Math.random() * height,
          length: speedY * 1.8,
          speedY,
          speedX: WIND_SHEAR_X + (Math.random() * 0.4 - 0.2),
          opacity: 0.15 + Math.random() * 0.20,
          thickness: 1.0 + Math.random() * 0.8,
        });
      }
    };

    const initCondensation = () => {
      condensationDrops = [];
      for (let i = 0; i < DEFAULT_CONDENSATION_COUNT; i++) {
        condensationDrops.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.85,
          radius: 1.2 + Math.random() * 2.2,
          weight: 0.1 + Math.random() * 0.4,
          slipThreshold: 0.85 + Math.random() * 0.40,
          isSlipping: false,
          slipSpeed: 0,
          trail: [],
        });
      }
    };

    resizeCanvas();
    initRaindrops();
    initCondensation();

    // ------------------------------------------------------------------------
    // 3. SPLASH PARTICLES ON IMPACT
    // ------------------------------------------------------------------------
    const triggerSplash = (x: number, y: number) => {
      if (splashParticles.length > 60) return; // Pool bounding
      const particleCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.PI + (Math.random() * Math.PI); // Upward arc
        const speed = 1.0 + Math.random() * 2.0;
        splashParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed + (WIND_SHEAR_X * 0.5),
          vy: Math.sin(angle) * speed,
          alpha: 0.4,
          radius: 0.8 + Math.random() * 0.8,
        });
      }
    };

    // ------------------------------------------------------------------------
    // 4. ANIMATION & PHYSICS STEP (60 FPS DECOUPLED LOOP)
    // ------------------------------------------------------------------------
    const render = () => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // --- 4.1 Falling Raindrops Update & Draw ---
      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        drop.y += drop.speedY * speedMultiplier;
        drop.x += drop.speedX * speedMultiplier;

        // Reset and trigger splash when hitting bottom window sill
        if (drop.y >= height) {
          triggerSplash(drop.x, height - 2);
          drop.y = -drop.length - Math.random() * 40;
          drop.x = Math.random() * (width + 300) - 100;
        }

        if (drop.x < -100) {
          drop.x = width + 100;
        }

        // Render Raindrop vector
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.speedX * 1.4, drop.y + drop.length);
        ctx.strokeStyle = `rgba(180, 210, 240, ${drop.opacity})`;
        ctx.lineWidth = drop.thickness;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // --- 4.2 Splash Particle Simulation ---
      for (let i = splashParticles.length - 1; i >= 0; i--) {
        const p = splashParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity
        p.alpha -= 0.025;

        if (p.alpha <= 0 || p.y >= height + 10) {
          splashParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 220, 255, ${p.alpha})`;
        ctx.fill();
      }

      // --- 4.3 Glass Condensation Beads Simulation ---
      for (let i = 0; i < condensationDrops.length; i++) {
        const bead = condensationDrops[i];

        // Moisture accumulation
        bead.weight += Math.random() * 0.006 * speedMultiplier;

        if (bead.weight > bead.slipThreshold) {
          bead.isSlipping = true;
        }

        if (bead.isSlipping) {
          bead.slipSpeed = Math.min(bead.slipSpeed + 0.10, 4.2);
          bead.y += bead.slipSpeed * speedMultiplier;

          // Record decaying moisture streak trail
          if (Math.random() < 0.6) {
            bead.trail.push({
              x: bead.x + (Math.random() * 0.6 - 0.3),
              y: bead.y,
              radius: bead.radius * 0.55,
              alpha: 0.28,
            });
          }

          // Reset when reaching bottom of glass
          if (bead.y >= height - 10) {
            bead.y = Math.random() * (height * 0.25);
            bead.x = Math.random() * width;
            bead.weight = 0.1;
            bead.isSlipping = false;
            bead.slipSpeed = 0;
            bead.radius = 1.2 + Math.random() * 2.2;
            bead.slipThreshold = 0.85 + Math.random() * 0.40;
          }
        }

        // Draw and decay moisture trail
        for (let j = bead.trail.length - 1; j >= 0; j--) {
          const t = bead.trail[j];
          t.alpha -= 0.0025;
          if (t.alpha <= 0) {
            bead.trail.splice(j, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 225, 255, ${t.alpha})`;
          ctx.fill();
        }

        // Draw primary bead
        ctx.beginPath();
        ctx.arc(bead.x, bead.y, bead.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(220, 235, 255, 0.38)";
        ctx.fill();

        // Specular streetlamp reflection highlight
        ctx.beginPath();
        ctx.arc(
          bead.x - bead.radius * 0.3,
          bead.y - bead.radius * 0.3,
          bead.radius * 0.35,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // ------------------------------------------------------------------------
    // 5. LIFECYCLE LISTENERS & VISIBILITY THROTTLING
    // ------------------------------------------------------------------------
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === "visible";
    };

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [speedMultiplier, rainDensityMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
};
