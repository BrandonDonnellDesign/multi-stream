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
    <div
      className={cn(
        "relative w-full h-full shadow-lg rounded-xl",
        stream.platform === "kick" && "aspect-video",
        className
      )}
    >
      <div className={cn("overflow-hidden w-full h-full rounded-xl")}>
        <iframe
          src={getStreamUrl()}
          allowFullScreen
          className={cn(
            "absolute inset-0 w-full h-full",
            stream.platform === "kick" && "object-cover",
            stream.platform === "twitch" && "bg-zinc-900"
          )}
        />
      </div>
    </div>
  );
}