"use client";

import { Stream } from "@/types/stream";
import { StreamPlayer } from "./stream-player";
import { EmptyState } from "../ui/empty-state";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useVisibleStreams } from "@/hooks/use-visible-streams";

interface StreamGridProps {
  streams: Stream[];
  onReorder: (streams: Stream[]) => void;
}

export function StreamGrid({ streams, onReorder }: StreamGridProps) {
  const visibleStreams = useVisibleStreams(streams);

  if (visibleStreams.length === 0) {
    return <EmptyState message="No live streams available. Add streams from the sidebar to get started" />;
  }

  const gridCols = Math.min(3, Math.ceil(visibleStreams.length));

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
            className="grid h-full"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,

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
                    className="relative aspect-w-16 aspect-h-9 flex justify-center items-center"
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