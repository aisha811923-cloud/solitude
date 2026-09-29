# Accessibility (a11y) & Inclusive Design Specification (ACCESSIBILITY.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Standards, keyboard navigation flows, ARIA landmark architecture, live region announcements, and screen-reader ergonomics for WCAG 2.1 AA compliance in a nocturnal interface.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Compliance Target & Inclusive Nocturnal Philosophy

Solitude is designed to meet WCAG 2.1 Level AA standards while preserving its moody, midnight aesthetic.

Core Accessibility Tenets:
1. Complete Non-Pointer Navigability: Every control (playback, volume, queue drawer, search, ambient faders, theme cycling) must be operable via keyboard alone.
2. Screen-Reader Semantic Transparency: All visual metaphors (flickering candle, rotating vinyl, falling rain, muffled room sound) must provide descriptive ARIA states and live text equivalents.
3. Sensory Contrast & Comfort: Dark-mode typography maintains a minimum 4.5:1 contrast ratio against translucent backgrounds, with support for system high-contrast and reduced-motion preferences.

---

## 2. ARIA Landmark Architecture & Viewport Semantics

<!-- Timeline Scrub Bar -->
<div 
  role="slider" 
  aria-label="Track progress"
  aria-valuemin="0"
  aria-valuemax="241"
  aria-valuenow="84"
  aria-valuetext="1 minute 24 seconds of 4 minutes 1 second"
  tabindex="0"
/>

<!-- Control Buttons -->
<button aria-label="Open ambient soundboard faders" aria-haspopup="dialog" aria-expanded="false" />
<button aria-label="Previous track" />
<button aria-label="Pause playback" aria-pressed="true" />
<button aria-label="Next track" />
<button aria-label="Lo-Fi muffled acoustics mode" aria-pressed="false" />
<button aria-label="Cycle atmospheric lighting: current mode Warm Candlelight" />
<button aria-label="Toggle queue drawer, 30 tracks available" aria-haspopup="dialog" aria-expanded="false" />
3. Keyboard Navigation & Focus Management
3.1 Logical Tab Order Sequence
Communal Presence Badge (Informational skip link target)

Ambient Soundboard Toggle Button

Previous Track Button (P)

Play / Pause Button (Space)

Next Track Button (N)

Timeline Scrub Slider (Left / Right arrows)

Lo-Fi Mode Toggle Button

Environmental Lighting Switcher Button

Queue Drawer Toggle Button (Q)

3.2 Slide-Over Queue Drawer Focus Trap
When the queue drawer opens (via Q or button click):

Focus immediately transfers to the search input (searchRef.current.focus()).

Tab key navigation is trapped within the drawer: pressing Tab on the last song row cycles back to the search input.

Pressing Escape:

If search input has text, first Escape clears text.

Second Escape closes the drawer and restores focus to the Queue Drawer Toggle Button.

Pressing Enter or Space on any song row plays the track immediately.

3.3 Focus Indicators (Focus-Visible Styling)
To avoid distracting mouse users while ensuring keyboard navigability, focus rings apply exclusively to :focus-visible:

/* Global tactile focus ring */
button:focus-visible,
div[role="slider"]:focus-visible,
input:focus-visible {
  outline: 2px solid #F59E0B;
  outline-offset: 3px;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.45);
}
4. Screen-Reader Announcements & Live Regions
Dynamic state changes must be broadcast to assistive technologies without interrupting track audio:

4.1 Track Transition Announcement
A visually hidden live region updates on song skip:

<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {`Now playing ${currentTrack.title} by ${currentTrack.artist}`}
</div>
4.2 Lo-Fi Mode State Change
When the Lo-Fi muffled mode is toggled, screen readers receive explicit acoustic status:

Active: "Lo-Fi muffled acoustic mode enabled. High frequencies filtered."

Bypass: "Lo-Fi muffled acoustic mode disabled. Full frequency playback restored."

4.3 Ambient Fader Slider Roles
Each fader in the ambient soundboard implements standard ARIA slider semantics:

<div
  role="slider"
  aria-label="Rain on glass volume"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={Math.round(rainVolume * 100)}
  aria-valuetext={`${Math.round(rainVolume * 100)} percent`}
  tabIndex={0}
  onKeyDown={handleFaderKeyDown}
/>
5. High-Contrast & Reduced Motion Modes
5.1 CSS prefers-reduced-motion Directives
Users sensitive to motion sickness or vestibular disorders can disable atmospheric movements via OS preferences:

@media (prefers-reduced-motion: reduce) {
  /* 1. Halt vinyl continuous spinning and inertial drag */
  .vinyl-spinning,
  .vinyl-inertial-pause {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }

  /* 2. Freeze candle flame flicker */
  .candle-flame {
    animation: none !important;
    transform: scale(1) !important;
  }

  /* 3. Disable rain particle simulation */
  canvas#solitude-rain-canvas {
    display: none !important;
  }

  /* 4. Instant drawer transitions */
  .drawer-slide {
    transition: opacity 0.15s ease-out !important;
    transform: none !important;
  }
}
5.2 Color Contrast Compliance Matrix
All foreground typography satisfies WCAG AA minimum 4.5:1 ratio against dark surfaces:

+----------------------+--------------------+--------------------+-----------------------+
| Text Element         | Foreground Color   | Background Color   | Contrast Ratio        |
+----------------------+--------------------+--------------------+-----------------------+
| Track Title          | #FFFFFF (Pure)     | #070B14 (Midnight) | 18.2:1 (Passes AAA)   |
| Artist Name          | #94A3B8 (Slate 400)| #070B14 (Midnight) | 6.8:1  (Passes AA)    |
| Poetic Quote         | #E2E8F0 (Slate 200)| #070B14 (Midnight) | 13.5:1 (Passes AAA)   |
| Keycap HUD Badges    | #F59E0B (Amber 500)| #0B1329 (Navy)     | 7.4:1  (Passes AA)    |
| Elapsed Time Display | #CBD5E1 (Slate 300)| #0B1329 (Navy)     | 9.6:1  (Passes AAA)   |
+----------------------+--------------------+--------------------+-----------------------+

6. Touch Targets & Mobile Ergonomics
On touch devices (smartphones and tablets), small clickable areas frustrate users and cause accidental skips:

Primary Play / Pause button: 48x48 px minimum clickable bounding box.

Skip and mode toggle buttons: 44x44 px touch area with transparent 8px padding hitboxes.

Timeline Scrub Bar: Visual line is 6px high, but touch target is padded to 32px height for effortless finger scrubbing without accidental track skips.