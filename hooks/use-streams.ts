
import { useCallback, useEffect, useState } from "react";
import { Stream, StreamPlatform } from "@/types/stream";
import { decodeStreamsFromUrl } from "@/lib/stream-utils";

function isStoredStream(value: unknown): value is Stream {
  if (!value || typeof value !== "object") return false;
  const stream = value as Partial<Stream>;
  return typeof stream.id === "string"
    && typeof stream.channel === "string"
    && (stream.platform === "twitch" || stream.platform === "kick" || stream.platform === "youtube")
    && typeof stream.visible === "boolean"
    && typeof stream.chatEnabled === "boolean";
}

export function useStreams() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const urlStreams = decodeStreamsFromUrl();
      const storedStreams = localStorage.getItem("sidebar-streams");
      let initialStreams = urlStreams;

      if (initialStreams.length === 0 && storedStreams) {
        try {
          const parsed: unknown = JSON.parse(storedStreams);
          if (Array.isArray(parsed) && parsed.every(isStoredStream)) {
            initialStreams = parsed;
          } else {
            localStorage.removeItem("sidebar-streams");
          }
        } catch {
          localStorage.removeItem("sidebar-streams");
        }
      }

      // Initial state depends on client-only URL and localStorage values.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreams(initialStreams);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("sidebar-streams", JSON.stringify(streams));
    }
  }, [isInitialized, streams]);

  const addStream = useCallback((platform: StreamPlatform, channel: string) => {
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
      prev.map((stream) => ({
        ...stream,
        chatEnabled: stream.platform === "youtube" ? false : enabled,
      }))
    );
  }, []);

  const refreshStream = useCallback((id: string) => {
    setStreams((prev) =>
      prev.map((stream) =>
        stream.id === id
          ? { ...stream, playerVersion: (stream.playerVersion ?? 0) + 1 }
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
