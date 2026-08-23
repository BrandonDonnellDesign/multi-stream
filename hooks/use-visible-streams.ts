"use client";

import { Stream } from "@/types/stream";

export function useVisibleStreams(streams: Stream[]) {
  // Treat an unknown status as visible. A temporary API failure should never
  // make a stream disappear; only a confirmed offline response hides it.
  return streams.filter((stream) => stream.visible && stream.isLive !== false);
}
