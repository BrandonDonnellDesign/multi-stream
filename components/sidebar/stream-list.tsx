import { Stream } from "@/types/stream";
import { StreamCard } from "@/components/stream/stream-card";

interface StreamListProps {
  streams: Stream[];
  onToggleVisibility: (id: string) => void;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
}

export function StreamList({
  streams,
  onToggleVisibility,
  onRefresh,
  onRemove,
}: StreamListProps) {
  return (
    <div className="space-y-2">
      {streams.map((stream) => (
        <StreamCard
          key={stream.id}
          stream={stream}
          onToggleVisibility={onToggleVisibility}
          onRefresh={onRefresh}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}