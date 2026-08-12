"use client";

import { useState, useEffect } from "react";
import { Stream } from "@/types/stream";

export function useVisibleStreams(streams: Stream[]) {
  const [liveById, setLiveById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkStreamStatuses = async () => {
      const statuses = await Promise.all(
        streams.map(async (stream) => {
          if (stream.platform === "youtube") return [stream.id, true] as const;
          try {
            // Kick's channel response exposes `livestream: null` immediately when
            // a channel is offline. Check it from the browser first (the original
            // auto-hide path), because Kick can block this legacy endpoint when
            // it is requested from a server/datacenter address.
            if (stream.platform === "kick") {
              const kickResponse = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(stream.channel)}`);
              if (kickResponse.ok) {
                const kickData = await kickResponse.json() as { livestream?: unknown };
                return [stream.id, kickData.livestream != null] as const;
              }
            }
            const params = new URLSearchParams({ platform: stream.platform, channel: stream.channel });
            const response = await fetch(`/api/streams/status?${params}`);
            if (!response.ok) return [stream.id, undefined] as const;
            const data = await response.json() as { isLive: boolean };
            return [stream.id, data.isLive] as const;
          } catch {
            return [stream.id, undefined] as const;
          }
        })
      );
      setLiveById((previous) => {
        const next = { ...previous };
        for (const [id, isLive] of statuses) if (isLive !== undefined) next[id] = isLive;
        return next;
      });
    };

    checkStreamStatuses();
    const interval = setInterval(checkStreamStatuses, 120000);
    return () => clearInterval(interval);
  }, [streams]);

  // Treat an unknown status as visible. A temporary API failure should never
  // make a stream disappear; only a confirmed offline response hides it.
  return streams
    .filter((stream) => stream.visible && liveById[stream.id] !== false)
    .map((stream) => ({ ...stream, isLive: liveById[stream.id] }));
}
