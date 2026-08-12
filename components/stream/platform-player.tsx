
import { Stream } from "@/types/stream";
import { cn } from "@/lib/utils";

interface PlatformPlayerProps {
  stream: Stream;
  className?: string;
}

function getStreamUrl(stream: Stream): string {
  if (stream.platform === "twitch") {
    return `https://player.twitch.tv/?channel=${encodeURIComponent(stream.channel)}&parent=${window.location.hostname}`;
  }
  if (stream.platform === "youtube") {
    return `https://www.youtube.com/embed/${stream.channel}?autoplay=1`;
  }
  return `https://player.kick.com/${encodeURIComponent(stream.channel)}`;
}

export function PlatformPlayer({ stream, className }: PlatformPlayerProps) {
  return (
    <div className={cn("relative w-full h-full shadow-lg", className)}>
      <div className="overflow-hidden w-full h-full">
        <iframe
          key={stream.playerVersion ?? 0}
          src={getStreamUrl(stream)}
          allowFullScreen
          title="Stream Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          frameBorder="0"
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}
