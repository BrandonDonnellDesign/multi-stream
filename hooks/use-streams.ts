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
    setStreams((prev) => {
      // Check if stream already exists (case insensitive)
      const streamExists = prev.some(
        (s) => 
          s.platform === platform && 
          s.channel.toLowerCase() === channel.toLowerCase()
      );

      // If stream already exists, return unchanged array
      if (streamExists) {
        return prev;
      }

      // Add new stream if it doesn't exist
      return [
        ...prev,
        {
          id: `${platform}-${channel}-${Date.now()}`,
          platform,
          channel,
          visible: true,
          chatEnabled: false,
        },
      ];
    });
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

  const toggleStreamChat = useCallback((id: string) => {
    setStreams((prev) =>
      prev.map((stream) =>
        stream.id === id ? { ...stream, chatEnabled: !stream.chatEnabled } : stream
      )
    );
  }, []);

  const toggleAllChats = useCallback((enabled: boolean) => {
    setStreams((prev) =>
      prev.map((stream) => ({ ...stream, chatEnabled: enabled }))
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

  const reorderStreams = useCallback((reorderedStreams: Stream[]) => {
    setStreams(reorderedStreams);
  }, []);

  return {
    streams,
    addStream,
    removeStream,
    toggleStreamVisibility,
    toggleStreamChat,
    toggleAllChats,
    refreshStream,
    reorderStreams,
  };
}