"use client";

import { Stream } from "@/types/stream";
import { cn } from "@/lib/utils";

interface PlatformPlayerProps {
  stream: Stream;
  className?: string;
}

export function PlatformPlayer({ stream, className }: PlatformPlayerProps) {
  const getStreamUrl = () => {
    if (stream.platform === "twitch") {
      return `https://player.twitch.tv/?channel=${stream.channel}&parent=${window.location.hostname}`;
    }
    return `https://player.kick.com/${stream.channel}`;
  };

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px]",
      stream.platform === "kick" && "aspect-video",
      className
    )}>
      <iframe
        src={getStreamUrl()}
        allowFullScreen
        className={cn(
          "absolute inset-0 w-full h-full",
          // Apply specific styles for Kick streams
          stream.platform === "kick" && "aspect-video object-contain"
        )}
      />
    </div>
  );
}