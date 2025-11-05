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
          toggleStreamChat(id); // Only toggle chat for this stream
          const idx = streams.findIndex(s => s.id === id);
          if (idx !== -1 && streams[idx].chatEnabled === false) {
            // If chat is being enabled, set as active in chat panel
            setActiveStreamIndex(idx);
            setActiveChatStreamId(id);
          } else if (idx !== -1 && streams[idx].chatEnabled === true && activeChatStreamId === id) {
            // If chat is being disabled and it's the active chat, find another enabled chat
            const enabledIdx = streams.findIndex((s, i) => s.chatEnabled && s.id !== id);
            if (enabledIdx !== -1) {
              setActiveStreamIndex(enabledIdx);
              setActiveChatStreamId(streams[enabledIdx].id);
            } else {
              setActiveChatStreamId(null);
            }
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
        setActiveStreamIndex={setActiveStreamIndex}
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
              // Find enabled chats
              const enabledChats = streams.filter(s => s.chatEnabled);
              setActiveChatStreamId(enabledChats[idx]?.id ?? null);
            }}
            onToggle={() => {
              // Disable chat for the active stream only
              const enabledChats = streams.filter(s => s.chatEnabled);
              const closingId = enabledChats[activeStreamIndex]?.id;
              if (closingId) {
                toggleStreamChat(closingId);
                // After closing, get new enabled chats
                const newEnabledChats = streams.filter(s => s.chatEnabled && s.id !== closingId);
                if (newEnabledChats.length > 0) {
                  // If there are still enabled chats, set to first one
                  setActiveStreamIndex(0);
                  setActiveChatStreamId(newEnabledChats[0].id);
                } else {
                  // No enabled chats left, close panel
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
