"use client";

import { Stream } from "@/types/stream";
import { cn } from "@/lib/utils";
import { StreamPlayer } from "./stream-player";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useVisibleStreams } from "@/hooks/use-visible-streams";
import { MessageSquare } from "lucide-react";

interface StreamGridProps {
  streams: Stream[];
  onReorder: (streams: Stream[]) => void;
  onToggleChat?: (id: string) => void;
}

export function StreamGrid({ streams, onReorder, onToggleChat }: StreamGridProps) {
  const visibleStreams = useVisibleStreams(streams);
  const handleToggleChat = onToggleChat ?? (() => {});

  if (visibleStreams.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-center text-lg">No streams added yet. Use the sidebar to add new streams.</p>
      </div>
    );
  }

  // Calculate grid columns based on number of streams
  const getGridCols = (count: number) => {
    if (count <= 1) return 1;
    return Math.min(count, 3);
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
            style={{
              gridTemplateColumns: visibleStreams.length > 1 ? `repeat(${gridCols}, 1fr)` : undefined,
              gridTemplateRows: visibleStreams.length === 2 || visibleStreams.length === 3 ? "repeat(1, 1fr)" : "auto",
            }}            className={cn(           
              "w-full h-full rounded-xl",
              visibleStreams.length === 4 ? "grid" : "",
              visibleStreams.length === 1
                ? "flex items-center justify-center"
                : "grid"
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
                      "relative",

                      visibleStreams.length === 1 
                        ? "w-full h-full max-w-[100vw] max-h-[100vh] aspect-video mx-auto" // Responsive single stream size
                        : visibleStreams.length === 3 ? "max-w-[1300px]"
                        : ""
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