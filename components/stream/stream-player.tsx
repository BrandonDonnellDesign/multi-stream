import { Stream } from "@/types/stream";
import { getStreamUrl } from "@/lib/stream-utils";
import { cn } from "@/lib/utils";

interface StreamPlayerProps {
  stream: Stream;
}

export function StreamPlayer({ stream }: StreamPlayerProps) {
  const streamUrl = getStreamUrl(stream);

  return (
    <div className="relative w-full h-full shadow-md">
      <iframe
        src={streamUrl}
        frameBorder="0"
        allowFullScreen
        scrolling="no"
        className={cn(
          "absolute inset-0 w-full h-full",
          stream.platform === "kick" && "object-fill",
          stream.platform === "twitch" &&
            "bg-secondary"
        )}
      />
    </div>
  );
}