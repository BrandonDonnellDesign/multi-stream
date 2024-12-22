"use client";

import { Stream } from "@/types/stream";
import { StreamCard } from "@/components/stream/stream-card";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

interface StreamListProps {
  streams: Stream[];
  onToggleVisibility: (id: string) => void;
  onToggleChat: (id: string) => void;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (streams: Stream[]) => void;
}

export function StreamList({
  streams,
  onToggleVisibility,
  onToggleChat,
  onRefresh,
  onRemove,
  onReorder,
}: StreamListProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(streams);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sidebar-streams">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
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
                  >
                    <StreamCard
                      stream={stream}
                      onToggleVisibility={onToggleVisibility}
                      onToggleChat={onToggleChat}
                      onRefresh={onRefresh}
                      onRemove={onRemove}
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