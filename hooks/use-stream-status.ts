"use client";

import { useState, useEffect } from 'react';
import { Stream } from '@/types/stream';

interface StatusResponse {
  isLive: boolean;
}

export function useStreamStatus(stream: Stream) {
  const [isLive, setIsLive] = useState(stream.isLive ?? false);

  useEffect(() => {
    const checkStatus = async () => {
      if (stream.platform === "youtube") return;
      try {
        const params = new URLSearchParams({
          platform: stream.platform,
          channel: stream.channel,
        });
        const response = await fetch(`/api/streams/status?${params}`);
        if (!response.ok) return;
        const { isLive } = await response.json() as StatusResponse;
        setIsLive(isLive);
      } catch {
        // Keep the last known status when the status service is unavailable.
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 120000);
    return () => clearInterval(interval);
  }, [stream.channel, stream.platform]);

  return isLive;
}
