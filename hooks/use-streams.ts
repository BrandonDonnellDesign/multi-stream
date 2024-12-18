"use client";

import { useCallback, useEffect, useState } from "react";
import { Stream } from "@/types/stream";
import { decodeStreamsFromUrl } from "@/lib/stream-utils";

export function useStreams() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const urlStreams = decodeStreamsFromUrl();
      if (urlStreams.length > 0) {
        setStreams(urlStreams);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const addStream = useCallback((platform: "twitch" | "kick", channel: string) => {
    setStreams((prev) => [
      ...prev,
      {
        id: `${platform}-${channel}-${Date.now()}`,
        platform,
        channel,
        visible: true,
      },
    ]);
  }, []);

  const removeStream = useCallback((id: string) => {
    setStreams((prev) => prev.filter((stream) => stream.id !== id));
  }, []);

  const toggleStreamVisibility = useCallback((id: string) => {
    setStreams((prev) =>
      prev.map((stream) =>
        stream.id === id ? { ...stream, visible: !stream.visible } : stream
      )
    );
  }, []);

  const refreshStream = useCallback((id: string) => {
    setStreams((prev) =>
      prev.map((stream) =>
        stream.id === id
          ? { ...stream, id: `${stream.platform}-${stream.channel}-${Date.now()}` }
          : stream
      )
    );
  }, []);

  return {
    streams,
    addStream,
    removeStream,
    toggleStreamVisibility,
    refreshStream,
  };
}