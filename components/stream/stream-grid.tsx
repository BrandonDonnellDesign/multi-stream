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
  maxColumns?: number;
}

export function StreamGrid({ streams, onReorder, onToggleChat, maxColumns = 3 }: StreamGridProps) {
  const visibleStreams = useVisibleStreams(streams);
  const handleToggleChat = onToggleChat ?? (() => {});

  if (visibleStreams.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-center text-lg">No streams added yet. Use the sidebar to add new streams.</p>
      </div>
    );
  }

  // Use maxColumns from props
  const gridCols = maxColumns;

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
              display: visibleStreams.length === 1 ? undefined : "grid",
              gridTemplateColumns:
                visibleStreams.length > 1
                  ? `repeat(${gridCols}, minmax(400px, 1fr))`
                  : undefined,
            }}
            className={cn(
              "w-full h-full rounded-xl",
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
                      "relative border-none outline-none",

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