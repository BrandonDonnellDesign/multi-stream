import { Stream } from "@/types/stream";
import { PlatformPlayer } from "./platform-player";

interface StreamPlayerProps {
  stream: Stream;
}

export function StreamPlayer({ stream }: StreamPlayerProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-black shadow-md">
      <PlatformPlayer stream={stream} />
    </div>
  );
}
