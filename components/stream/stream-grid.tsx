"use client";

import { Stream } from "@/types/stream";
import { StreamPlayer } from "./stream-player";
import { EmptyState } from "../ui/empty-state";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useVisibleStreams } from "@/hooks/use-visible-streams";
import { cn } from "@/lib/utils";

interface StreamGridProps {
  streams: Stream[];
  onReorder: (streams: Stream[]) => void;
}

export function StreamGrid({ streams, onReorder }: StreamGridProps) {
  const visibleStreams = useVisibleStreams(streams);

  if (visibleStreams.length === 0) {
    return <EmptyState message="No live streams available. Add streams from the sidebar to get started" />;
  }

  // Calculate grid columns based on number of streams
  const getGridCols = (count: number) => {
    if (count <= 1) return 1;
    if (count <= 2) return 2;
    if (count <= 3) return 3;
  };

  const gridCols = getGridCols(visibleStreams.length);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(visibleStreams);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="streams" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "w-full h-full",
              visibleStreams.length === 1 
                ? "flex items-center justify-center" 
                : "grid"
            )}
            style={{
              gridTemplateColumns: visibleStreams.length > 1 ? `repeat(${gridCols}, 1fr)` : undefined,
              gridTemplateRows: visibleStreams.length === 2 ? "repeat(1, 1fr)" : "auto",
            }}
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
                      "relative",
                      visibleStreams.length === 1 
                        ? "w-[90%] max-w-[2250px] aspect-video" 
                        : "w-full h-full"
                    )}
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