"use client";

import { useState } from "react";
import { Stream } from "@/types/stream";

export function useStreams() {
  const [streams, setStreams] = useState<Stream[]>([]);

  const addStream = (platform: "twitch" | "kick", channel: string) => {
    setStreams((prev) => [
      ...prev,
      {
        id: `${platform}-${channel}-${Date.now()}`,
        platform,
        channel,
        visible: true,
      },
    ]);
  };

  const removeStream = (id: string) => {
    setStreams((prev) => prev.filter((stream) => stream.id !== id));
  };

  const toggleStreamVisibility = (id: string) => {
    setStreams((prev) =>
      prev.map((stream) =>
        stream.id === id ? { ...stream, visible: !stream.visible } : stream
      )
    );
  };

  const refreshStream = (id: string) => {
    setStreams((prev) =>
      prev.map((stream) =>
        stream.id === id
          ? { ...stream, id: `${stream.platform}-${stream.channel}-${Date.now()}` }
          : stream
      )
    );
  };

  return {
    streams,
    addStream,
    removeStream,
    toggleStreamVisibility,
    refreshStream,
  };
}