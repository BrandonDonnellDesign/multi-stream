"use client";

import { useState, useEffect } from "react";
import { Stream } from "@/types/stream";
import { checkStreamStatus } from "@/lib/twitch-api";
import { checkKickStreamStatus } from "@/lib/kick-api";

export function useVisibleStreams(streams: Stream[]) {
  const [visibleStreams, setVisibleStreams] = useState<Stream[]>([]);

  useEffect(() => {
    const checkStreamStatuses = async () => {
      const checkedStreams = await Promise.all(
        streams.map(async (stream) => {
          const isLive = stream.platform === 'twitch'
            ? await checkStreamStatus(stream.channel)
            : await checkKickStreamStatus(stream.channel);
          return {
            ...stream,
            isLive
          };
        })
      );
      // Only filter, do not reconstruct streams
      const newVisible = streams.map((stream, idx) => ({
        ...stream,
        isLive: checkedStreams[idx].isLive
      })).filter((stream) => stream.isLive && stream.visible);

      setVisibleStreams(prev => {
        // Simple length check first
        if (prev.length !== newVisible.length) return newVisible;

        // Check if IDs are the same
        const isSame = prev.every((s, i) => s.id === newVisible[i].id && s.isLive === newVisible[i].isLive);
        return isSame ? prev : newVisible;
      });
    };

    checkStreamStatuses();
    const interval = setInterval(checkStreamStatuses, 120000);
    return () => clearInterval(interval);
  }, [streams]);

  return visibleStreams;
}