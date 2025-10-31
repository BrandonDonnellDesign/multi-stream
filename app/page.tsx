"use client";
import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar/sidebar";
import { StreamGrid } from "@/components/stream/stream-grid";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useStreams } from "@/hooks/use-streams";
import { useState } from "react";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
            setIsChatOpen((prev) => !prev);
          }}
          onToggleAllChats={(enabled) => {
            toggleAllChats(enabled);
            setIsChatOpen(enabled);
          }}
        onRefresh={refreshStream}
        onRemove={removeStream}
        onReorder={reorderStreams}
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
            <StreamGrid streams={visibleStreams} onReorder={reorderStreams} />
          </div>
          <ChatPanel 
            streams={streams}
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(!isChatOpen)}
          />
        </div>
      </main>
    </div>
  );
}