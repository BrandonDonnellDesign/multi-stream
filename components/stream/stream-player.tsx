import { Stream } from "@/types/stream";
import { getStreamUrl } from "@/lib/stream-utils";

interface StreamPlayerProps {
  stream: Stream;
}

export function StreamPlayer({ stream }: StreamPlayerProps) {
  const streamUrl = getStreamUrl(stream);

  return (
    <div className="relative w-full h-full aspect-w-16 aspect-h-9">
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