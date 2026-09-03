"use client";
import { Menu, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar/sidebar";
import { StreamGrid } from "@/components/stream/stream-grid";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useStreams } from "@/hooks/use-streams";
import { useMemo, useState } from "react";
import { ShareDialog } from "@/components/share/share-dialog";
import { useStreamStatuses } from "@/hooks/use-stream-statuses";

export default function MultiStreamViewer() {
  const [maxColumns, setMaxColumns] = useState<number>(3);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChatStreamId, setActiveChatStreamId] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
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
  // This is one batched request every two minutes for streams the visitor can
  // actually see. It keeps offline streams off the stage without relaying any
  // media through Netlify.
  const visibleStreams = useMemo(() => streams.filter((stream) => stream.visible), [streams]);
  const liveStatuses = useStreamStatuses(visibleStreams);
  const streamsWithStatus = useMemo(
    () => streams.map((stream) => ({
      ...stream,
      isLive: liveStatuses[stream.id] ?? stream.isLive,
    })),
    [liveStatuses, streams],
  );

  const handleToggleChat = (id: string) => {
    const stream = streams.find((s) => s.id === id);
    if (!stream) return;
    if (stream.chatEnabled && activeChatStreamId === null) {
      setActiveChatStreamId(id);
      return;
    }
    toggleStreamChat(id);
    if (!stream.chatEnabled) {
      setActiveChatStreamId(id);
    } else if (activeChatStreamId === id) {
      const next = streams.find((s) => s.chatEnabled && s.id !== id);
      setActiveChatStreamId(next?.id ?? null);
    }
  };

  const handleToggleAllChats = (enabled: boolean) => {
    toggleAllChats(enabled);
    setActiveChatStreamId(enabled
      ? streams.find((stream) => stream.platform !== "youtube")?.id ?? null
      : null);
  };

  const handleRemoveStream = (id: string) => {
    removeStream(id);
    if (activeChatStreamId === id) {
      setActiveChatStreamId(
        streams.find((stream) => stream.id !== id && stream.chatEnabled)?.id ?? null
      );
    }
  };

  return (
    <div className="app-shell flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar
        isOpen={isSidebarOpen}
        streams={streamsWithStatus}
        onClose={() => setIsSidebarOpen(!isSidebarOpen)}
        onAddStream={addStream}
        onToggleVisibility={toggleStreamVisibility}
        onToggleChat={handleToggleChat}
        onToggleAllChats={handleToggleAllChats}
        onRefresh={refreshStream}
        onRemove={handleRemoveStream}
        onReorder={reorderStreams}
        maxColumns={maxColumns}
        setMaxColumns={setMaxColumns}
        isChatOpen={!!activeChatStreamId}
        activeStreamId={activeChatStreamId ?? undefined}
      />

      <main className="flex min-w-0 flex-1 flex-col p-2 sm:p-3">
        <header className="mb-2 flex h-14 shrink-0 items-center justify-between rounded-2xl border border-white/8 bg-card/70 px-3 shadow-[0_16px_50px_rgba(0,0,0,.18)] backdrop-blur-xl sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            {!isSidebarOpen && <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} aria-label="Open stream manager" className="h-9 w-9 rounded-xl"><Menu className="h-4 w-4" /></Button>}
            <div className="min-w-0"><p className="truncate text-sm font-semibold">Live workspace</p><p className="text-[11px] text-muted-foreground">{streams.filter((stream) => stream.visible).length} on stage · {streams.length} total</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[.03] px-3 py-1.5 text-xs text-muted-foreground md:flex"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>Session ready</div>
            <Button variant="ghost" size="sm" className="h-9 rounded-xl px-3" onClick={() => setIsShareOpen(true)}><Share2 className="mr-2 h-4 w-4" />Share</Button>
            <Button variant={activeChatStreamId ? "default" : "ghost"} size="sm" className="h-9 rounded-xl px-3" onClick={() => activeChatStreamId ? setActiveChatStreamId(null) : handleToggleAllChats(true)} disabled={!streams.some((stream) => stream.platform !== "youtube")}><MessageSquare className="mr-2 h-4 w-4" />Chat</Button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 gap-2">
          <div className="flex-1 min-h-0">
            <StreamGrid streams={streamsWithStatus} onReorder={reorderStreams} maxColumns={maxColumns} />
          </div>
          <ChatPanel
            streams={streams}
            isOpen={!!activeChatStreamId}
            activeStreamId={activeChatStreamId}
            onSelectStream={setActiveChatStreamId}
            onClose={() => setActiveChatStreamId(null)}
          />
        </div>
        <ShareDialog streams={streams} open={isShareOpen} onOpenChange={setIsShareOpen} />
      </main>
    </div>
  );
}
