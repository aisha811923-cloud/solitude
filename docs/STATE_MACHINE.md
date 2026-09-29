# Finite State Machine Specifications (STATE_MACHINE.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Mathematical and deterministic Finite State Machine (FSM) models governing Audio Playback, Web Audio Lo-Fi Routing, UI Drawers, Environmental Lighting, and Realtime Presence.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. Master Audio Playback FSM

Manages audio hardware access, buffering, crossfades, track navigation, and playback lifecycle.

### 1.1 State Set (S_audio)
* STANDBY_SUSPENDED: Initial state on boot. AudioContext is suspended. Awaiting first user gesture.
* BUFFERING: Audio URL assigned; initial byte ranges streaming over HTTP 206 via Supabase Storage.
* PLAYING: Hardware audio buffer running, master gain at target volume, vinyl rotating.
* PAUSED: Playback suspended, master gain muted, vinyl smoothly decelerating.
* CROSSFADING: Transient state during track skips (N, P, or queue selection) where gain ramps to zero before loading the next audio stream.
* ERROR: Audio decoding failure, network timeout, or CORS rejection.

### 1.2 Event Set (E_audio)
* FIRST_GESTURE: First click or Space keypress on the viewport.
* PLAY_TRIGGERED: Master play button clicked or Space pressed when paused.
* PAUSE_TRIGGERED: Master pause button clicked or Space pressed when playing.
* TRACK_SELECTED(index): Specific song selected from queue or skip triggered (N / P).
* CANPLAY_FIRED: Audio element dispatches canplay or canplaythrough.
* WAITING_FIRED: Network buffer underrun or read stall.
* FADE_OUT_COMPLETE: 150ms gain ramp-down complete.
* AUDIO_ERROR(err): Media decoding error or network abort.

### 1.3 Transition Diagram & Guard Matrix

+--------------------+------------------+-----------------------+--------------------+---------------------------------------------------+
| Source State       | Event            | Guard Condition       | Target State       | Transition Actions                                |
+--------------------+------------------+-----------------------+--------------------+---------------------------------------------------+
| STANDBY_SUSPENDED  | FIRST_GESTURE    | AudioContext exists   | BUFFERING          | unlockAudioContext(), loadTrack(0), audio.play()  |
+--------------------+------------------+-----------------------+--------------------+---------------------------------------------------+
| BUFFERING          | CANPLAY_FIRED    | Audio unlocked        | PLAYING            | rampMasterGain(targetGain, 200ms), startVinyl()   |
| BUFFERING          | AUDIO_ERROR      | None                  | ERROR              | logError(), notifyUI(), setFallbackTrack()        |
+--------------------+------------------+-----------------------+--------------------+---------------------------------------------------+
| PLAYING            | PAUSE_TRIGGERED  | None                  | PAUSED             | rampMasterGain(0, 50ms), audio.pause(), stopVinyl()|
| PLAYING            | WAITING_FIRED    | None                  | BUFFERING          | showBufferingSpinner()                            |
| PLAYING            | TRACK_SELECTED   | index != currentIndex | CROSSFADING        | rampMasterGain(0.001, 150ms), scheduleNext(index) |
+--------------------+------------------+-----------------------+--------------------+---------------------------------------------------+
| PAUSED             | PLAY_TRIGGERED   | None                  | PLAYING            | audio.play(), rampMasterGain(targetGain, 50ms)    |
| PAUSED             | TRACK_SELECTED   | index != currentIndex | BUFFERING          | loadTrack(index), audio.play()                    |
+--------------------+------------------+-----------------------+--------------------+---------------------------------------------------+
| CROSSFADING        | FADE_OUT_COMPLETE| None                  | BUFFERING          | setAudioSrc(newUrl), audio.load(), audio.play()   |
+--------------------+------------------+-----------------------+--------------------+---------------------------------------------------+
| ERROR              | FIRST_GESTURE    | None                  | BUFFERING          | retryLoadTrack(currentIndex)                      |
| ERROR              | TRACK_SELECTED   | None                  | BUFFERING          | loadTrack(index)                                  |
+--------------------+------------------+-----------------------+--------------------+---------------------------------------------------+

---

## 2. Web Audio Lo-Fi Filter FSM

Controls real-time acoustic muffling using the native BiquadFilterNode low-pass filter.

### 2.1 State Set (S_lofi)
* BYPASS: Filter set to "allpass". Cutoff is flat (20,000 Hz). Audio is clean.
* RAMPING_TO_LOFI: Active transition. Cutoff sweeping from 20,000 Hz down to 850 Hz over 280ms.
* ACTIVE_LOFI: Lowpass mode active (850 Hz cutoff, Q = 3.5). Ambient soundboard remains unaffected.
* RAMPING_TO_BYPASS: Active transition. Cutoff sweeping from 850 Hz up to 20,000 Hz over 200ms.

### 2.2 Transition Logic

   [BYPASS]
      |
      | TOGGLE_LOFI (target: active)
      v
[RAMPING_TO_LOFI] ---> (280ms exponential ramp: 20000Hz -> 850Hz, Q -> 3.5)
      |
      v
 [ACTIVE_LOFI]
      |
      | TOGGLE_LOFI (target: bypass)
      v
[RAMPING_TO_BYPASS] -> (200ms exponential ramp: 850Hz -> 20000Hz, Q -> 0.7)
      |
      v
   [BYPASS]

### 2.3 Audio Parameter Scheduling Rule
To prevent hardware clipping, always execute scheduled cancellations prior to initiating any ramp transition:

    filterNode.frequency.cancelScheduledValues(audioContext.currentTime);
    filterNode.Q.cancelScheduledValues(audioContext.currentTime);

---

## 3. UI Drawer & Keyboard Input Isolation FSM

Ensures seamless navigation between player controls, queue inspection, and text search without hotkey conflicts.

### 3.1 State Set (S_ui)
* MAIN_VIEWPORT: Queue closed, search inactive. Global hotkeys (Space, Left, Right, N, P, Q, /) fully active.
* DRAWER_BROWSING: Queue drawer visible on right. Focus is on list items. Global hotkeys active.
* SEARCH_FOCUSED: Text input within drawer holds active DOM focus. All single-key player hotkeys are neutralized.

### 3.2 Transition Matrix

+-----------------+-------------------+----------------------+-----------------+---------------------------------------------+
| Source State    | Input Event       | Guard Condition      | Target State    | Action Executed                             |
+-----------------+-------------------+----------------------+-----------------+---------------------------------------------+
| MAIN_VIEWPORT   | KEY_Q             | !isInputFocused      | DRAWER_BROWSING | openQueueDrawer(), animateSlideIn()         |
| MAIN_VIEWPORT   | KEY_SLASH         | !isInputFocused      | SEARCH_FOCUSED  | e.preventDefault(), openDrawer(), focusInput|
+-----------------+-------------------+----------------------+-----------------+---------------------------------------------+
| DRAWER_BROWSING | KEY_Q             | !isInputFocused      | MAIN_VIEWPORT   | closeQueueDrawer(), animateSlideOut()       |
| DRAWER_BROWSING | KEY_ESCAPE        | None                 | MAIN_VIEWPORT   | closeQueueDrawer()                          |
| DRAWER_BROWSING | CLICK_SEARCH      | None                 | SEARCH_FOCUSED  | focusInput(), highlightSearchRing()         |
| DRAWER_BROWSING | CLICK_BACKDROP    | None                 | MAIN_VIEWPORT   | closeQueueDrawer()                          |
+-----------------+-------------------+----------------------+-----------------+---------------------------------------------+
| SEARCH_FOCUSED  | KEY_ESCAPE        | isInputFocused       | DRAWER_BROWSING | blurInput(), clearQuery(), restoreHotkeys() |
| SEARCH_FOCUSED  | INPUT_TYPING      | None                 | SEARCH_FOCUSED  | filterTracksInMemory(query), updateCount()  |
| SEARCH_FOCUSED  | SELECT_TRACK(idx) | None                 | DRAWER_BROWSING | blurInput(), dispatch(TRACK_SELECTED(idx))  |
+-----------------+-------------------+----------------------+-----------------+---------------------------------------------+

---

## 4. Dynamic Environmental Lighting FSM

Deterministic 4-state cycle controlling viewport tinting, candle graphics, and rain particle density.

       [CANDLE (Default)]
         |           ^
CLICK    |           | CLICK
CANDLE   v           | CANDLE
      [MIDNIGHT]     |
         |           |
CLICK    |           |
CANDLE   v           |
    [RAINY-DUSK]     |
         |           |
CLICK    |           |
CANDLE   v           |
       [VOID] -------+

### 4.1 State Definitions & Parametric Outputs

+---------------+--------------------+------------------------------+--------------------+------------------------+
| Mode Key      | Theme Name         | Radial Vignette Glow         | Candle Flame State | Rain Engine Multiplier |
+---------------+--------------------+------------------------------+--------------------+------------------------+
| candle        | Warm Candlelight   | rgba(245, 158, 11, 0.22)     | Lit (Flickering)   | 1.0x (120 drops)       |
| midnight      | Midnight Solitude  | rgba(56, 189, 248, 0.12)     | Extinguished       | 1.0x (120 drops)       |
| rainy-dusk    | Rainy Cold Blue    | rgba(14, 116, 144, 0.18)     | Extinguished       | 1.35x (162 drops)      |
| void          | The Void           | rgba(0, 0, 0, 0.90)          | Extinguished       | 0.5x (60 drops)        |
+---------------+--------------------+------------------------------+--------------------+------------------------+

---

## 5. Communal Presence WebSocket FSM

Governs real-time connectivity to the Supabase Realtime presence channel (room:solitude-global) with automated exponential backoff.

### 5.1 State Set (S_presence)
* DISCONNECTED: Initial state or network offline.
* CONNECTING: Establishing WebSocket connection to Supabase.
* CONNECTED_SYNCED: Channel active, client presence tracked, listening to sync events.
* RECONNECTING_BACKOFF: Connection interrupted. Retrying with exponential backoff (2^n * 1000ms).

### 5.2 Transition Logic

   [DISCONNECTED]
          |
          | mount / network online
          v
    [CONNECTING]
          |
          +---> SUCCESS ---> [CONNECTED_SYNCED]
          |                        |
          |                        | channel error / socket drop
          v                        v
  [RECONNECTING_BACKOFF] <---------+
          |
          | timer expires (1s, 2s, 4s, 8s, max 30s)
          v
    [CONNECTING]

* Fallback Mechanism: While in DISCONNECTED or RECONNECTING_BACKOFF, the HUD display count does not show 0. Instead, it gracefully falls back to the local getCircadianBaseline() algorithm to preserve the nocturnal sanctuary atmosphere.