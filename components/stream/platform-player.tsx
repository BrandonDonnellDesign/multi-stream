"use client";

import { Stream } from "@/types/stream";
import { cn } from "@/lib/utils";

interface PlatformPlayerProps { stream: Stream; className?: string }
function getStreamUrl(stream: Stream): string {
  if (stream.platform === "twitch") return `https://player.twitch.tv/?channel=${encodeURIComponent(stream.channel)}&parent=${window.location.hostname}`;
  if (stream.platform === "youtube") return `https://www.youtube.com/embed/${stream.channel}?autoplay=1`;
  return "";
}

export function PlatformPlayer({ stream, className }: PlatformPlayerProps) {
  return <div className={cn("relative h-full w-full shadow-lg", className)}>
    <div className="h-full w-full overflow-hidden">
      <iframe
        key={stream.playerVersion ?? 0}
        src={stream.platform === "kick"
          ? `https://player.kick.com/${encodeURIComponent(stream.channel)}?autoplay=true&muted=true`
          : getStreamUrl(stream)}
        allowFullScreen title={`${stream.channel} ${stream.platform} stream`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; storage-access; web-share"
        frameBorder="0" className="absolute inset-0 h-full w-full" loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  </div>;
}
