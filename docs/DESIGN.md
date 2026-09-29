# Design System & Styling Specification (DESIGN.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Definitive visual tokens, glassmorphic matrices, color palettes, typography hierarchies, and layout geometry.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Design Philosophy & Aesthetic Core

Solitude is an intimate nocturnal audio space. The aesthetic blends:
1. Midnight Tactile Minimalism: Hardware-inspired interfaces, rounded tactile buttons, and realistic friction.
2. Atmospheric Glassmorphism: Multi-layered frosted glass with subtle specular edge highlights and dark transparency.
3. Environmental Lighting: Candlelight amber illumination interacting with deep midnight navy surfaces.

---

## 2. Color System & Color Tokens

### 2.1 Core Neutral Palette (Midnight Base)
* Void Pure: `#020408` (Darkest backdrop tint, applied in The Void theme)
* Midnight Sanctuary: `#070B14` (Default background canvas)
* Indigo Shade: `#0B1329` (Secondary surface background)
* Border Frosted: `rgba(255, 255, 255, 0.08)` (Neutral panel edge highlight)
* Border Active: `rgba(245, 158, 11, 0.45)` (Amber focused edge glow)

### 2.2 Accent Palette (Warm Candlelight & Lo-Fi Tubes)
* Amber Glow: `#F59E0B` (Primary accent, active buttons, scrub bar progress)
* Amber Light: `#FDE68A` (Scrub bar thumb, high-contrast badges)
* Amber Deep: `#B45309` (Active border rings, shadow casts)
* Amber Vacuum: `rgba(245, 158, 11, 0.15)` (Active Lo-Fi button fill)

### 2.3 Atmospheric Environmental Themes

+---------------+--------------------+--------------------------+----------------------------+
| Theme Mode    | Display Name       | Viewport Tint            | Accent Radial Glow         |
+---------------+--------------------+--------------------------+----------------------------+
| `candle`      | Warm Candlelight   | #070B14 (Midnight)       | rgba(245, 158, 11, 0.22)   |
| `midnight`    | Midnight Solitude  | #0B1329 (Indigo Navy)    | rgba(56, 189, 248, 0.12)   |
| `rainy-dusk`  | Rainy Cold Blue    | #082F49 (Deep Cyan Dusk) | rgba(14, 116, 144, 0.20)   |
| `void`        | The Void           | #020408 (Near Black)     | rgba(0, 0, 0, 0.95)        |
+---------------+--------------------+--------------------------+----------------------------+

---

## 3. Glassmorphic Surface Specifications

To avoid GPU frame drops, backdrop blur is strictly capped at `16px` to `20px` with a single compositing pass:

### 3.1 Master Deck Dock Surface
    .glass-dock {
      background: rgba(11, 19, 41, 0.65);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 
        inset 0 1px 1px rgba(255, 255, 255, 0.12),
        0 12px 32px rgba(0, 0, 0, 0.55),
        0 0 24px rgba(245, 158, 11, 0.15);
      border-radius: 9999px; /* Pill shape */
    }

### 3.2 Slide-Over Queue Drawer Surface
    .glass-drawer {
      background: rgba(7, 11, 20, 0.88);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: -16px 0 48px rgba(0, 0, 0, 0.75);
    }

### 3.3 Ambient Soundboard Popover Surface
    .glass-popover {
      background: rgba(11, 19, 41, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.10);
      box-shadow: 
        inset 0 1px 1px rgba(255, 255, 255, 0.15),
        0 16px 40px rgba(0, 0, 0, 0.65);
      border-radius: 1.25rem;
    }

---

## 4. Typography Scale & Font Architecture

* Primary Sans: `Inter`, system-ui, -apple-system, sans-serif (Clean UI labels, artist names, descriptions)
* Monospace HUD: `Geist Mono`, `ui-monospace`, monospace (Timestamps, keyboard shortcuts, listener counter)
* Poetic Serif: `Playfair Display`, `Georgia`, serif (Shayari quotes, introspective track couplets)

### 4.1 Typography Scale Matrix

+----------------------+--------------------+--------------------+-----------------------+
| Token Name           | Font Family        | Size / Leading     | Weight / Tracking     |
+----------------------+--------------------+--------------------+-----------------------+
| `track-title`        | Inter              | 1.75rem / 2.25rem  | Bold (700) / -0.02em  |
| `track-artist`       | Inter              | 1.00rem / 1.50rem  | Medium (500) / normal |
| `shayari-quote`      | Playfair Display   | 1.125rem / 1.75rem | Italic (400) / normal |
| `timestamp-mono`     | Geist Mono         | 0.8125rem / 1.0rem | Regular (400) / tabular|
| `hud-keycap`         | Geist Mono         | 0.6875rem / 0.85rem| Medium (500) / 0.04em |
| `presence-badge`     | Geist Mono         | 0.75rem / 1.0rem   | Medium (500) / normal |
+----------------------+--------------------+--------------------+-----------------------+

---

## 5. Master Layout Geometry & Sizing Dimensions

+--------------------------------------------------------------------------+
| Top Bar (h-14, px-6):                                                    |
|  - Presence Pill: h-8, px-3, rounded-full                                |
|  - Action Buttons: w-8, h-8, rounded-full                                |
+--------------------------------------------------------------------------+
| Center Turntable Section:                                                |
|  - Vinyl Outer Diameter: 240px (Desktop) / 190px (Mobile)                |
|  - Vinyl Center Label: 96px (Desktop) / 76px (Mobile)                    |
|  - Vinyl Center Spindle: 14px, rounded-full                              |
|  - Shayari Quote Card: max-w-lg, min-h-[48px]                            |
+--------------------------------------------------------------------------+
| Bottom Master Player Deck:                                               |
|  - Scrub Bar: w-[580px] (Desktop) / w-[92vw] (Mobile), h-1.5             |
|  - Master Dock: w-[620px] (Desktop) / w-[96vw] (Mobile), h-16            |
|  - Primary Play Button: w-12, h-12, rounded-full                         |
|  - Secondary Buttons: w-10, h-10, rounded-full                           |
+--------------------------------------------------------------------------+
| Bottom Keycap HUD:                                                       |
|  - Pill Container: h-7, px-4, rounded-full                               |
|  - Individual Keycap: min-w-[20px], h-4.5, text-[10px], rounded          |
+--------------------------------------------------------------------------+


---

## 6. Keyboard Shortcuts HUD Keycap Tokens

Each keycap simulates a physical mechanical keyboard switch:

    .kbd-cap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.125rem 0.375rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-bottom: 2px solid rgba(255, 255, 255, 0.22);
      border-radius: 0.25rem;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: #94A3B8;
      transition: all 0.12s ease-in-out;
    }

    .kbd-cap-active {
      background: #F59E0B;
      color: #070B14;
      border-color: #FBBF24;
      border-bottom-width: 1px;
      transform: translateY(1px);
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    }