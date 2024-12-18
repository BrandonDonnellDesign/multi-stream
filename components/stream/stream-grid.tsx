import { Stream } from "@/types/stream";
import { StreamPlayer } from "./stream-player";
import { EmptyState } from "../ui/empty-state";

interface StreamGridProps {
  streams: Stream[];
}

export function StreamGrid({ streams }: StreamGridProps) {
  if (streams.length === 0) {
    return <EmptyState message="Add streams from the sidebar to get started" />;
  }

  const gridCols = Math.ceil(Math.sqrt(streams.length));

  return (
    <div
      className="grid h-full"
      style={{
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      }}
    >
      {streams.map((stream) => (
        <StreamPlayer key={stream.id} stream={stream} />
      ))}
    </div>
  );
}