
import { Stream } from "@/types/stream";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { KickChatInput } from "./kick-chat-input";
import { NativeChat } from "./native-chat";
import { ChatTabs } from "./chat-tabs";

interface ChatPanelProps {
  streams: Stream[];
  isOpen: boolean;
  activeStreamIndex: number;
  setActiveStreamIndex: (idx: number) => void;
  onToggle: () => void;
}

export function ChatPanel({ streams: allStreams, isOpen, activeStreamIndex, setActiveStreamIndex, onToggle }: ChatPanelProps) {
  // Only show streams with chatEnabled
  const enabledStreams = useMemo(() => allStreams.filter(s => s.chatEnabled), [allStreams]);
  const activeStream = enabledStreams[activeStreamIndex];

  // Reset index if out of bounds
  useEffect(() => {
    if (activeStreamIndex >= enabledStreams.length && enabledStreams.length > 0) {
      setActiveStreamIndex(0);
    }
  }, [activeStreamIndex, enabledStreams, setActiveStreamIndex]);

  if (!isOpen) return <div className="w-0" />;

  return (
    <div
      className={cn(
        "h-full flex flex-col rounded-xl transition-all duration-300",
        "w-[350px] min-w-[250px] max-w-[400px] backdrop-blur-lg bg-card border border-accent shadow-2xl"
      )}
    >
      {/* Header with Tabs and Arrows */}
      <div className="flex items-center justify-between border-b border-muted pr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveStreamIndex(Math.max(0, activeStreamIndex - 1))}
          disabled={activeStreamIndex === 0}
          className="h-9 w-9 my-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 overflow-hidden">
          <ChatTabs
            streams={allStreams}
            activeStreamIndex={activeStreamIndex}
            onSelect={setActiveStreamIndex}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveStreamIndex(Math.min(enabledStreams.length - 1, activeStreamIndex + 1))}
          disabled={activeStreamIndex >= enabledStreams.length - 1}
          className="h-9 w-9 my-1"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 ml-1 text-muted-foreground hover:text-destructive">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {activeStream ? (
        <div className="flex-1 overflow-hidden flex flex-col relative bg-zinc-950/30">
          {/* Native Chat or Iframe - Render ALL but hide inactive */}
          {enabledStreams.map((stream, idx) => {
            const isActive = idx === activeStreamIndex;
            return (
              <div
                key={stream.id}
                className={cn(
                  "flex-1 flex flex-col min-h-0",
                  !isActive && "hidden"
                )}
              >
                {stream.platform === 'kick' ? (
                  <NativeChat channelName={stream.channel} />
                ) : (
                  <iframe
                    src={
                      stream.platform === "twitch"
                        ? `https://www.twitch.tv/embed/${stream.channel}/chat?parent=${window.location.hostname}&darkpopout`
                        : undefined
                    }
                    className="w-full flex-1 border-none min-h-0"
                  />
                )}
              </div>
            );
          })}

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