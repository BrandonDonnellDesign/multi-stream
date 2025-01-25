"use client";

import { Stream } from "@/types/stream";

export function useStreamVisibility(stream: Stream, isLive: boolean) {
  // If stream is not live, it should not be visible
  return {
    visible: isLive ? stream.visible : false,
    chatEnabled: isLive ? stream.chatEnabled : false
  };
}