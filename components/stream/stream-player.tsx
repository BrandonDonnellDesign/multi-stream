"use client";

import { Stream } from "@/types/stream";
import { getStreamUrl } from "@/lib/stream-utils";
import { useEffect, useRef } from "react";

interface StreamPlayerProps {
  stream: Stream;
  onFullscreen?: (streamId: string) => void;
}

export function StreamPlayer({ stream, onFullscreen }: StreamPlayerProps) {
  const streamUrl = getStreamUrl(stream);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFullscreenChange = () => {
      if (document.fullscreenElement === container) {
        onFullscreen?.(stream.id);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [stream.id, onFullscreen]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[300px]"
      data-stream-id={stream.id}
    >
      <iframe
        src={streamUrl}
        frameBorder="0"
        allowFullScreen
        scrolling="no"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}