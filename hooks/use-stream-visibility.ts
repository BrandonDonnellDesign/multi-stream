"use client";

import { Stream } from "@/types/stream";

export function useStreamVisibility(stream: Stream, isLive: boolean) {
  // If stream is not live, it should not be visible
  return isLive ? stream.visible : false;
}