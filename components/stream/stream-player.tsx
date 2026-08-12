import { Stream } from "@/types/stream";
import { getStreamUrl } from "@/lib/stream-utils";
import { cn } from "@/lib/utils";

interface StreamPlayerProps {
  stream: Stream;
}

export function StreamPlayer({ stream }: StreamPlayerProps) {
  const streamUrl = getStreamUrl(stream);
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-black shadow-md">
      <iframe
        key={stream.playerVersion ?? 0}
        src={streamUrl}
        title={`${stream.channel} ${stream.platform} stream`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        frameBorder="0"
        allowFullScreen
        scrolling="no"
        className={cn(
          "absolute inset-0 w-full h-full"
        )}
      />
    </div>
  );
}
