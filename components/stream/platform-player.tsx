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
        "relative w-full h-full shadow-lg ",
        className
      )}
    >
      <div className={cn("overflow-hidden w-full h-full ",
          stream.platform === "kick" && "aspect-video"
          )}>
        <iframe
          src={getStreamUrl()}
          allowFullScreen
          className={cn(
            "absolute inset-0 w-full h-full ",
            stream.platform === "kick" ? "object-contain" : "object-cover",
             stream.platform === "kick" && "p-4",
            stream.platform === "twitch" && "bg-zinc-900"
          )}
        />
      </div>
    </div>
  );
}