/**
 * Master Sanctuary Viewport (app/page.tsx)
 * 
 * Project: Solitude (Midnight Sad Songs Sanctuary)
 * Runtime: Next.js 15, React 19, TypeScript (Strict Mode)
 * Architecture: Master layout assembly uniting audio, canvas, presence, and tactile controls
 * 
 * Layers:
 * 1. Background Visual with atmospheric zoom breathing
 * 2. Fullscreen 60 FPS Canvas Rain & Glass Condensation (RainCanvas)
 * 3. Nocturnal Ambient Lighting & Lo-Fi Vignette Warmth (CandleGlow)
 * 4. Top Navigation (Brand, Communal PresenceBeacon, Quick Actions)
 * 5. Center Stage (Hardware VinylDisc, Shayari Couplet Card, WaveformVisualizer)
 * 6. Timeline ScrubBar & Floating MasterDock
 * 7. Multi-Channel Ambient Soundboard Popover (Desktop / Tablet)
 * 8. Mobile Right-Edge Swipe Drawer & Tactile Pull-Tab (< md)
 * 9. Slide-Over Track Catalogue Queue Drawer (TrackDrawer)
 * 10. Keyboard Shortcuts Navigation HUD (KeyboardShortcutsHud)
 * 
 * Zero 'any' types, zero stubs, production-ready implementation.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaSession } from "@/hooks/useMediaSession";
import { RainCanvas } from "@/components/canvas/RainCanvas";
import { CandleGlow } from "@/components/lighting/CandleGlow";
import { VinylDisc } from "@/components/player/VinylDisc";
import { WaveformVisualizer } from "@/components/player/WaveformVisualizer";
import { ScrubBar } from "@/components/player/ScrubBar";
import { MasterDock } from "@/components/player/MasterDock";
import { AmbientSoundboard } from "@/components/ambient/AmbientSoundboard";
import { MobileControlDrawer } from "@/components/mobile/MobileControlDrawer";
import { TrackDrawer } from "@/components/queue/TrackDrawer";
import { KeyboardShortcutsHud } from "@/components/player/KeyboardShortcutsHud";
import { SanctuaryHeader } from "@/components/navigation/SanctuaryHeader";

export default function SanctuaryPage() {
  // 1. Audio Engine Master State & Controls
  const audio = useAudioEngine();

  // 2. Hardware Media Session API Integration (Lock screen, remotes, CarPlay)
  useMediaSession({
    currentTrack: audio.currentTrack,
    isPlaying: audio.isPlaying,
    playbackStatus: audio.playbackStatus,
    currentTime: audio.currentTime,
    duration: audio.duration,
    play: audio.play,
    pause: audio.pause,
    togglePlay: audio.togglePlay,
    nextTrack: audio.nextTrack,
    prevTrack: audio.prevTrack,
    seek: audio.seek,
    seekRelative: audio.seekRelative,
  });

  // 3. UI Viewport State
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState<boolean>(false);
  const [isCandleLit, setIsCandleLit] = useState<boolean>(true);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // 4. Mobile Right-Edge Inward Swipe Gesture Detection (< 768px)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);

        // If swipe starts within 45px of the right screen edge and moves left > 35px
        if (touchStartX >= window.innerWidth - 45 && deltaX < -35 && deltaY < 80) {
          setIsMobileControlsOpen(true);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // 5. Hardware Keyboard Navigation Engine
  const { activeKeycode } = useKeyboardShortcuts(
    {
      togglePlay: audio.togglePlay,
      seekRelative: audio.seekRelative,
      volume: audio.volume,
      setVolume: audio.setVolume,
      nextTrack: audio.nextTrack,
      prevTrack: audio.prevTrack,
      toggleQueue: () => setIsQueueOpen((prev) => !prev),
      openAndFocusSearch: () => {
        setIsQueueOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 120);
      },
      closeQueue: () => setIsQueueOpen(false),
      toggleMute: audio.toggleMute,
      toggleLoFi: audio.toggleLoFi,
    },
    { isQueueOpen }
  );

  return (
    <main className="relative w-screen h-dvh overflow-hidden flex flex-col justify-between select-none px-4 py-2 sm:py-4 md:px-8">
      {/* -------------------------------------------------------------------- */}
      {/* LAYER 1: ATMOSPHERIC BACKGROUND WITH SUBTLE DRIFT                    */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Image
          src={audio.currentTrack.cover_url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 filter brightness-[0.45] contrast-[1.1] transition-transform duration-[12000ms] ease-out"
        />
        {/* Deep midnight ambient color wash */}
        <div className="absolute inset-0 bg-[#070B14]/65 mix-blend-multiply" />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 2: 60 FPS CANVAS RAIN & CONDENSATION ENGINE                   */}
      {/* -------------------------------------------------------------------- */}
      <RainCanvas speedMultiplier={audio.isLoFi ? 0.85 : 1.0} />

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 3: CANDLELIGHT ATMOSPHERE & LO-FI VIGNETTE                    */}
      {/* -------------------------------------------------------------------- */}
      <CandleGlow
        isLit={isCandleLit}
        isLoFi={audio.isLoFi}
        onToggleLit={() => setIsCandleLit((p) => !p)}
      />

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 4: TOP NAVIGATION HEADER & ACTION TRIGGERS                     */}
      {/* -------------------------------------------------------------------- */}
      <SanctuaryHeader
        trackCount={audio.tracks.length}
        isSoundboardOpen={isSoundboardOpen}
        isMobileControlsOpen={isMobileControlsOpen}
        isQueueOpen={isQueueOpen}
        isAmbientMuted={audio.isAmbientMuted}
        onToggleSoundboard={() => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            setIsMobileControlsOpen((p) => !p);
          } else {
            setIsSoundboardOpen((p) => !p);
          }
        }}
        onToggleQueue={() => setIsQueueOpen((p) => !p)}
        onOpenMobileControls={() => setIsMobileControlsOpen(true)}
      />

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 5: CENTER STAGE (TURNTABLE, SHAYARI & VISUALIZER)              */}
      {/* -------------------------------------------------------------------- */}
      <section className="relative z-20 flex-1 flex flex-col items-center justify-center min-h-0 py-1 gap-1.5 sm:gap-3 md:gap-4 my-auto">
        {/* Hardware Vinyl Turntable Platter */}
        <div className="mb-0 sm:mb-1 md:mb-4 scale-75 min-[400px]:scale-90 sm:scale-90 md:scale-95 lg:scale-100 transition-transform origin-center">
          <VinylDisc
            isPlaying={audio.isPlaying}
            coverUrl={audio.currentTrack.cover_url}
            title={audio.currentTrack.title}
            artist={audio.currentTrack.artist}
          />
        </div>

        {/* Track Title & Artist Center Stage */}
        <div className="text-center max-w-[280px] xs:max-w-[320px] sm:max-w-md mx-auto mb-0.5 sm:mb-1 md:mb-2">
          <h2 className="text-sm sm:text-base md:text-2xl font-medium md:font-bold tracking-tight text-white mb-0.5 sm:mb-1 drop-shadow-md truncate">
            {audio.currentTrack.title}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-neutral-400 font-sans truncate">
            {audio.currentTrack.artist}
          </p>
        </div>

        {/* Introspective Urdu/Hindi Shayari Card */}
        {audio.currentTrack.shayari_quote && (
          <div className="max-w-[340px] md:max-w-lg mx-auto px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm text-center mb-0.5 sm:mb-1 md:mb-3 transition-all duration-500 shadow-sm">
            <p className="font-serif italic text-xs sm:text-xs md:text-sm text-amber-200/90 tracking-wide leading-relaxed line-clamp-2 md:line-clamp-none">
              &ldquo;{audio.currentTrack.shayari_quote}&rdquo;
            </p>
          </div>
        )}

        {/* Real-time Frequency Spectrum Equalizer */}
        <div className="w-full flex justify-center items-center mx-auto my-1">
          <WaveformVisualizer
            analyserNode={audio.analyserNode}
            isPlaying={audio.isPlaying}
            barCount={32}
            width={240}
            height={28}
          />
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 6: BOTTOM MASTER TRANSPORT DECK & HUD                           */}
      {/* -------------------------------------------------------------------- */}
      <footer className="relative z-30 w-full flex flex-col items-center pb-2 sm:pb-6 px-0 sm:px-4 shrink-0">
        {/* Multi-Channel Ambient Soundboard Popover (Desktop / Tablet) */}
        <AmbientSoundboard
          isOpen={isSoundboardOpen}
          onClose={() => setIsSoundboardOpen(false)}
          ambientVolumes={audio.ambientVolumes}
          setAmbientVolume={audio.setAmbientVolume}
          toggleAmbientMute={audio.toggleAmbientMute}
          isAmbientMuted={audio.isAmbientMuted}
          onToggleMasterAmbientMute={audio.toggleMasterAmbientMute}
        />

        {/* Tactile Keyboard Shortcuts HUD (Elevated above ScrubBar on Desktop) */}
        <div className="mb-2 hidden sm:block">
          <KeyboardShortcutsHud
            activeKeycode={activeKeycode}
            isQueueOpen={isQueueOpen}
          />
        </div>

        {/* Timeline Scrub Bar (Desktop >= md) */}
        <div className="mb-2.5 sm:mb-3 w-full hidden md:flex justify-center">
          <ScrubBar
            currentTime={audio.currentTime}
            duration={audio.duration}
            onSeek={audio.seek}
          />
        </div>

        {/* Floating Master Transport Dock */}
        <MasterDock
          currentTrack={audio.currentTrack}
          isPlaying={audio.isPlaying}
          playbackStatus={audio.playbackStatus}
          isLoFi={audio.isLoFi}
          volume={audio.volume}
          isMuted={audio.isMuted}
          onTogglePlay={audio.togglePlay}
          onNext={audio.nextTrack}
          onPrev={audio.prevTrack}
          onToggleLoFi={audio.toggleLoFi}
          onVolumeChange={audio.setVolume}
          onToggleMute={audio.toggleMute}
          onToggleSoundboard={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setIsMobileControlsOpen((p) => !p);
            } else {
              setIsSoundboardOpen((p) => !p);
            }
          }}
          isSoundboardOpen={isSoundboardOpen || isMobileControlsOpen}
          onToggleQueue={() => setIsQueueOpen((p) => !p)}
          isQueueOpen={isQueueOpen}
          isAmbientMuted={audio.isAmbientMuted}
          onToggleAmbientMute={audio.toggleMasterAmbientMute}
          currentTime={audio.currentTime}
          duration={audio.duration}
          onSeek={audio.seek}
        />
      </footer>

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 7: AMBIENT SOUNDBOARD POPOVER (DESKTOP & TABLET >= md)         */}
      {/* -------------------------------------------------------------------- */}
      <AmbientSoundboard
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        ambientVolumes={audio.ambientVolumes}
        setAmbientVolume={audio.setAmbientVolume}
        toggleAmbientMute={audio.toggleAmbientMute}
        isAmbientMuted={audio.isAmbientMuted}
        onToggleMasterAmbientMute={audio.toggleMasterAmbientMute}
      />

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 7: MOBILE RIGHT-EDGE CONTROL & AMBIENT DRAWER (< md)           */}
      {/* -------------------------------------------------------------------- */}
      <MobileControlDrawer
        isOpen={isMobileControlsOpen}
        onClose={() => setIsMobileControlsOpen(false)}
        ambientVolumes={audio.ambientVolumes}
        isAmbientMuted={audio.isAmbientMuted}
        onToggleAmbientMute={audio.toggleMasterAmbientMute}
        setAmbientVolume={audio.setAmbientVolume}
        toggleChannelMute={audio.toggleAmbientMute}
        isLoFi={audio.isLoFi}
        onToggleLoFi={audio.toggleLoFi}
        volume={audio.volume}
        isMuted={audio.isMuted}
        onVolumeChange={audio.setVolume}
        onToggleMute={audio.toggleMute}
        onOpenQueue={() => setIsQueueOpen(true)}
        trackCount={audio.tracks.length}
        isCandleLit={isCandleLit}
        onToggleCandle={() => setIsCandleLit((p) => !p)}
      />

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 8: SLIDE-OVER TRACK CATALOGUE QUEUE DRAWER                    */}
      {/* -------------------------------------------------------------------- */}
      <TrackDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        tracks={audio.tracks}
        currentTrackIndex={audio.currentTrackIndex}
        isPlaying={audio.isPlaying}
        onSelectTrack={(idx) => {
          audio.selectTrack(idx, true);
          // On mobile, auto-close drawer after track selection
          if (typeof window !== "undefined" && window.innerWidth < 640) {
            setIsQueueOpen(false);
          }
        }}
        searchInputRef={searchInputRef}
      />
    </main>
  );
}
