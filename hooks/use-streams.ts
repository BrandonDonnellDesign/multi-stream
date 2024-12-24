"use client";

import { useCallback, useEffect, useState } from "react";
import { Stream } from "@/types/stream";
import { decodeStreamsFromUrl } from "@/lib/stream-utils";
import { checkStreamStatus } from "@/lib/twitch-api";
import { checkKickStreamStatus } from "@/lib/kick-api";

export function useStreams() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check stream status and update visibility
  useEffect(() => {
    const checkAllStreamsStatus = async () => {
      const updatedStreams = await Promise.all(
        streams.map(async (stream) => {
          const isLive = stream.platform === 'twitch'
            ? await checkStreamStatus(stream.channel)
            : await checkKickStreamStatus(stream.channel);
          
          return {
            ...stream,
            isLive,
            // Only auto-hide if not manually controlled
            visible: stream.manuallyHidden !== undefined 
              ? stream.visible 
              : isLive
          };
        })
      );
      
      setStreams(updatedStreams);
    };

    if (streams.length > 0) {
      checkAllStreamsStatus();
      const interval = setInterval(checkAllStreamsStatus, 120000);
      return () => clearInterval(interval);
    }
  }, [streams]);

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
        chatEnabled: false,
      },
    ]);
  }, []);

  const toggleStreamVisibility = useCallback((id: string) => {
    setStreams((prev) =>
      prev.map((stream) =>
        stream.id === id
          ? {
              ...stream,
              visible: !stream.visible,
              manuallyHidden: true, // Mark as manually controlled
            }
          : stream
      )
    );
  }, []);

  // Other methods remain the same
  const removeStream = useCallback((id: string) => {
    setStreams((prev) => prev.filter((stream) => stream.id !== id));
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
          ? { 
              ...stream, 
              id: `${stream.platform}-${stream.channel}-${Date.now()}`,
              manuallyHidden: undefined // Reset manual control on refresh
            }
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