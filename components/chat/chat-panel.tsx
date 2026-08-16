
import { Stream } from "@/types/stream";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { KickChatInput } from "./kick-chat-input";
import { NativeChat } from "./native-chat";
import { ChatTabs } from "./chat-tabs";

interface ChatPanelProps {
  streams: Stream[];
  isOpen: boolean;
  activeStreamId: string | null;
  onSelectStream: (id: string) => void;
  onClose: () => void;
}

export function ChatPanel({ streams: allStreams, isOpen, activeStreamId, onSelectStream, onClose }: ChatPanelProps) {
  const enabledStreams = useMemo(() => allStreams.filter(s => s.chatEnabled), [allStreams]);
  const activeStreamIndex = enabledStreams.findIndex((stream) => stream.id === activeStreamId);
  const activeStream = enabledStreams[activeStreamIndex];

  useEffect(() => {
    if (isOpen && !activeStream && enabledStreams.length > 0) {
      onSelectStream(enabledStreams[0].id);
    }
  }, [activeStream, enabledStreams, isOpen, onSelectStream]);

  if (!isOpen) return <div className="w-0" />;

  return (
    <div
      className={cn(
        "h-full flex flex-col overflow-hidden rounded-2xl transition-all duration-300 z-30",
        "w-[360px] min-w-[280px] max-w-[420px] max-sm:absolute max-sm:inset-y-0 max-sm:right-0 max-sm:w-[min(360px,100vw)] backdrop-blur-xl bg-card/90 border border-white/8 shadow-2xl"
      )}
    >
      {/* Header with Tabs and Arrows */}
      <div className="flex items-center justify-between border-b border-white/8 bg-white/[.02] pr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSelectStream(enabledStreams[activeStreamIndex - 1].id)}
          disabled={activeStreamIndex === 0}
          className="h-9 w-9 my-1"
          aria-label="Previous chat"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 overflow-hidden">
          <ChatTabs
            streams={allStreams}
            activeStreamId={activeStreamId}
            onSelect={onSelectStream}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSelectStream(enabledStreams[activeStreamIndex + 1].id)}
          disabled={activeStreamIndex >= enabledStreams.length - 1}
          className="h-9 w-9 my-1"
          aria-label="Next chat"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat panel" className="h-8 w-8 ml-1 text-muted-foreground hover:text-destructive">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {activeStream ? (
        <div className="flex-1 overflow-hidden flex flex-col relative bg-zinc-950/30">
          <div key={activeStream.id} className="flex-1 flex flex-col min-h-0">
            {activeStream.platform === 'kick' ? (
              <NativeChat channelName={activeStream.channel} />
            ) : activeStream.platform === 'twitch' ? (
              <iframe
                src={`https://www.twitch.tv/embed/${encodeURIComponent(activeStream.channel)}/chat?parent=${window.location.hostname}&darkpopout`}
                title={`${activeStream.channel} Twitch chat`}
                className="w-full flex-1 border-none min-h-0"
              />
            ) : null}
          </div>

          {/* Send Input */}
          {activeStream.platform === "kick" && (
            <KickChatInput channelName={activeStream.channel} />
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 text-center">
          <p>No chats enabled. Enable a chat from the stream controls.</p>
        </div>
      )}
    </div>
  );
}
