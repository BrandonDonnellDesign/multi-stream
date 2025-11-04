"use client";
import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar/sidebar";
import { StreamGrid } from "@/components/stream/stream-grid";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useStreams } from "@/hooks/use-streams";
import { useState } from "react";

export default function MultiStreamPage() {
  const [maxColumns, setMaxColumns] = useState<number>(3);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChatStreamId, setActiveChatStreamId] = useState<string|null>(null);
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const {
    streams,
    addStream,
    removeStream,
    toggleStreamVisibility,
    toggleStreamChat,
    toggleAllChats,
    refreshStream,
    reorderStreams,
  } = useStreams();

  const visibleStreams = streams.filter((s) => s.visible);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        streams={streams}
        onClose={() => setIsSidebarOpen(!isSidebarOpen)}
        onAddStream={addStream}
        onToggleVisibility={toggleStreamVisibility}
        onToggleChat={(id) => {
          toggleStreamChat(id);
          const idx = streams.findIndex(s => s.id === id);
          if (idx !== -1) {
            setActiveStreamIndex(idx);
            setActiveChatStreamId(id);
          }
        }}
        onToggleAllChats={() => setActiveChatStreamId(null)}
        onRefresh={refreshStream}
        onRemove={removeStream}
        onReorder={reorderStreams}
        maxColumns={maxColumns}
        setMaxColumns={setMaxColumns}
        isChatOpen={!!activeChatStreamId}
        activeStreamId={activeChatStreamId ?? undefined}
      />

      <main className="flex-1 min-h-0 relative">
        {!isSidebarOpen && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        <div className="flex h-full">
          <div className="flex-1 min-h-0">
            <StreamGrid streams={visibleStreams} onReorder={reorderStreams} maxColumns={maxColumns} />
          </div>
          <ChatPanel 
            streams={streams}
            isOpen={!!activeChatStreamId}
            activeStreamIndex={activeStreamIndex}
            setActiveStreamIndex={(idx) => {
              setActiveStreamIndex(idx);
              setActiveChatStreamId(streams[idx]?.id ?? null);
            }}
            onToggle={() => {
              // Disable chat for the active stream only
              if (streams[activeStreamIndex]) {
                toggleStreamChat(streams[activeStreamIndex].id);
                // Find next enabled chat, or close panel if none
                const nextEnabledIdx = streams.findIndex((s, i) => s.chatEnabled && i !== activeStreamIndex);
                if (nextEnabledIdx !== -1) {
                  setActiveStreamIndex(nextEnabledIdx);
                  setActiveChatStreamId(streams[nextEnabledIdx].id);
                } else {
                  setActiveChatStreamId(null);
                }
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
