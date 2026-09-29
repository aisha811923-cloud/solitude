# Communal Presence & Realtime Architecture (PRESENCE_SYSTEM.md)

Project Name: Solitude (Midnight Sad Songs Sanctuary)
Document Purpose: Architecture and technical implementation for the communal nocturnal presence engine, combining Supabase Realtime WebSockets with circadian mathematical algorithms and UI beacon integration.
Document Version: 2.0.0
Target Environment: Google Antigravity IDE

---

## 1. System Overview & The Illusion of Shared Solitude

The presence system counters feelings of cold isolation by providing a persistent, subtle indicator:
"542 broken hearts listening with you"

To guarantee reliability, avoid empty rooms during off-peak daytime hours, and respect free-tier database limits, the displayed listener count is governed by a hybrid architecture:
1. True WebSocket Sockets: Connected browser sessions tracked via Supabase Realtime Presence (room:solitude-global).
2. Circadian Nocturnal Curve: A mathematical model reflecting late-night emotional listening behaviors peaking between 12:00 AM and 4:30 AM local time.
3. Organic Micro-Jitter: Subtle increments (+1, -2, +3) every 8 to 15 seconds simulating ongoing entries and departures.

---

## 2. Mathematical Fluctuation Model

DisplayCount(t) = ConnectedClients(t) + CircadianBaseline(t) + MicroJitter(t)

### 2.1 Circadian Baseline Equation
The baseline listener count is calculated dynamically based on the listener's local system clock:

B(h) = 450 + 120 * sin((h - 23) * 0.8)   [if h >= 23 or h < 4.5 (Midnight Peak)]
B(h) = 260 - 80 * cos((h - 4.5) * 0.4)   [if 4.5 <= h < 11.0 (Dawn Drawdown)]
B(h) = 140 + 50 * sin(h * 0.25)          [if 11.0 <= h < 23.0 (Daylight Hours)]

Where h is current local time represented as fractional hours: h = hours + (minutes / 60).

---

## 3. Supabase Realtime Presence Channel Specification

### 3.1 Channel Topology & Identity
* Channel Name: room:solitude-global
* Transport: Secure WebSockets (wss://[PROJECT_REF].supabase.co/realtime/v1/websocket)
* Broadcast Payload Contract:

    export interface PresencePayload {
      userId: string;
      joinedAt: number;
    }

### 3.2 Channel Rules & RLS
Presence tracking operates entirely in memory via the Supabase Realtime cluster.
No database read/write queries are issued, consuming zero PostgreSQL IOPS or database storage.

---

## 4. Production Hook Implementation (hooks/usePresence.ts)

    "use client";

    import { useEffect, useState, useMemo } from "react";
    import { supabase } from "@/lib/supabase/client";
    import { RealtimeChannel } from "@supabase/supabase-js";

    interface PresenceState {
      connectedSockets: number;
      displayCount: number;
      isConnected: boolean;
    }

    export function getCircadianBaseline(date: Date = new Date()): number {
      const h = date.getHours() + date.getMinutes() / 60;
      
      if (h >= 23 || h < 4.5) {
        const delta = h >= 23 ? h - 23 : h + 1;
        return Math.floor(450 + Math.sin(delta * 0.8) * 120);
      } else if (h >= 4.5 && h < 11.0) {
        return Math.floor(260 - Math.cos((h - 4.5) * 0.4) * 80);
      }
      return Math.floor(140 + Math.sin(h * 0.25) * 50);
    }

    export function usePresence(): PresenceState {
      const [connectedSockets, setConnectedSockets] = useState<number>(1);
      const [jitter, setJitter] = useState<number>(0);
      const [isConnected, setIsConnected] = useState<boolean>(false);

      const userId = useMemo(() => {
        if (typeof window === "undefined") return "anon";
        let id = sessionStorage.getItem("solitude_uid");
        if (!id) {
          id = "user_" + Math.random().toString(36).substring(2, 9);
          sessionStorage.setItem("solitude_uid", id);
        }
        return id;
      }, []);

      useEffect(() => {
        let channel: RealtimeChannel | null = null;

        try {
          channel = supabase.channel("room:solitude-global", {
            config: { presence: { key: userId } },
          });

          channel
            .on("presence", { event: "sync" }, () => {
              const state = channel?.presenceState() || {};
              const count = Object.keys(state).length;
              setConnectedSockets(Math.max(1, count));
            })
            .subscribe(async (status) => {
              if (status === "SUBSCRIBED") {
                setIsConnected(true);
                await channel?.track({
                  userId,
                  joinedAt: Date.now(),
                });
              } else {
                setIsConnected(false);
              }
            });
        } catch (err) {
          console.warn("Realtime presence unavailable, using circadian fallback:", err);
          setIsConnected(false);
        }

        const jitterInterval = setInterval(() => {
          setJitter(Math.floor(Math.random() * 5) - 2);
        }, 10000);

        return () => {
          clearInterval(jitterInterval);
          if (channel) {
            channel.untrack().catch(() => {});
            supabase.removeChannel(channel).catch(() => {});
          }
        };
      }, [userId]);

      const displayCount = useMemo(() => {
        const baseline = getCircadianBaseline();
        return Math.max(12, connectedSockets + baseline + jitter);
      }, [connectedSockets, jitter]);

      return {
        connectedSockets,
        displayCount,
        isConnected,
      };
    }

---

## 5. UI Beacon Component (components/presence/PresenceBeacon.tsx)

    "use client";

    import React from "react";
    import { usePresence } from "@/hooks/usePresence";

    export const PresenceBeacon: React.FC = () => {
      const { displayCount, isConnected } = usePresence();

      return (
        <aside 
          aria-label="Active listeners in sanctuary"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] select-none transition-all duration-300 hover:bg-white/[0.07]"
        >
          <div className="relative flex items-center justify-center w-2 h-2">
            <span 
              className={`absolute inline-flex w-full h-full rounded-full animate-ping opacity-75 ${
                isConnected ? "bg-amber-400" : "bg-slate-400"
              }`} 
            />
            <span 
              className={`relative inline-flex w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-amber-500" : "bg-slate-500"
              }`} 
            />
          </div>

          <p className="font-mono text-xs tracking-tight text-slate-300">
            <strong className="font-medium text-amber-400 tabular-nums">
              {displayCount.toLocaleString()}
            </strong>{" "}
            broken hearts listening with you
          </p>
        </aside>
      );
    };