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
    if (stream.platform === "youtube") {
        return `https://www.youtube.com/embed/${stream.channel}?autoplay=1`
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
      <div className={cn("overflow-hidden w-full h-full ")}>
        <iframe
          src={getStreamUrl()}
          allowFullScreen
          title="Stream Player"
          frameBorder="0"
          className={cn(
            "absolute inset-0 w-full h-full "
          )}
        />
      </div>
    </div>
  );
}