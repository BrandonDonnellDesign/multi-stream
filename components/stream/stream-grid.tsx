"use client";

import { Stream } from "@/types/stream";
import { cn } from "@/lib/utils";
import { StreamPlayer } from "./stream-player";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { EyeOff, Video } from "lucide-react";
import { useVisibleStreams } from "@/hooks/use-visible-streams";

interface StreamGridProps {
  streams: Stream[];
  onReorder: (streams: Stream[]) => void;
  maxColumns?: number;
}

export function StreamGrid({ streams, onReorder, maxColumns = 3 }: StreamGridProps) {
  const visibleStreams = useVisibleStreams(streams);

  if (visibleStreams.length === 0) {
    const hasStreams = streams.length > 0;
    return (
      <div className="stage-surface flex h-full items-center justify-center rounded-2xl border border-white/8 p-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4 text-muted-foreground">
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/8 bg-white/[.03]">{hasStreams ? <EyeOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}</div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {hasStreams ? "All streams are hidden" : "No streams yet"}
            </p>
            <p className="mt-1 text-sm">
              {hasStreams
                ? "Use the eye controls in the stream manager to show one."
                : "Open the stream manager and add a Twitch, Kick, or YouTube stream."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(visibleStreams);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Reorder only the displayed streams without dropping hidden/offline entries.
    const reorderedIds = new Set(items.map((stream) => stream.id));
    let visibleIndex = 0;
    const reorderedStreams = streams.map((stream) =>
      reorderedIds.has(stream.id) ? items[visibleIndex++] : stream
    );

    onReorder(reorderedStreams);
  };

  const isSingle = visibleStreams.length === 1;
  const gridCols = Math.min(visibleStreams.length, maxColumns);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="streams" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={
              !isSingle
                ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }
                : undefined
            }
            className={cn(
              "stage-surface w-full h-full rounded-2xl border border-white/8 overflow-auto",
              isSingle ? "flex items-center justify-center p-2" : "grid auto-rows-fr gap-2 p-2"
            )}
          >
            {visibleStreams.map((stream, index) => (
              <Draggable
                key={stream.id}
                draggableId={stream.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "relative min-h-0 overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_12px_40px_rgba(0,0,0,.35)] outline-none transition-all hover:border-white/20 focus-visible:ring-2 focus-visible:ring-primary",
                      isSingle && "aspect-video w-full max-w-[calc((100dvh-5.5rem)*16/9)] mx-auto"
                    )}
                    data-stream-id={stream.id}
                    style={{
                      ...provided.draggableProps.style,
                    }}
                  >
                    <StreamPlayer stream={stream} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
