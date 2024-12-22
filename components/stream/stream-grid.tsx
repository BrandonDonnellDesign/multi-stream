"use client";

import { Stream } from "@/types/stream";
import { StreamPlayer } from "./stream-player";
import { EmptyState } from "../ui/empty-state";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useAudioControl } from "@/hooks/use-audio-control";

interface StreamGridProps {
  streams: Stream[];
  onReorder: (streams: Stream[]) => void;
}

export function StreamGrid({ streams, onReorder }: StreamGridProps) {
  const { handleFullscreenAudio } = useAudioControl();

  if (streams.length === 0) {
    return <EmptyState message="Add streams from the sidebar to get started" />;
  }

  const gridCols = Math.ceil(Math.sqrt(streams.length));

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(streams);
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
            {streams.map((stream, index) => (
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
                    className="relative"
                  >
                    <StreamPlayer 
                      stream={stream} 
                      onFullscreen={(streamId) => handleFullscreenAudio(streamId, streams)}
                    />
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