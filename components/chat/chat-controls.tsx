"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, MessageCircleOff } from "lucide-react";
import { Stream } from "@/types/stream";
import { cn } from "@/lib/utils";

interface ChatControlsProps {
  streams: Stream[];
  onToggleAllChats: (enabled: boolean) => void;
  compact?: boolean;
  isChatOpen?: boolean;
}

export function ChatControls({ streams, onToggleAllChats, compact, isChatOpen }: ChatControlsProps) {
  const chatCapableStreams = streams.filter((stream) => stream.platform !== "youtube");
  const hasEnabledChats = chatCapableStreams.some((stream) => stream.chatEnabled);
  const chatOpen = typeof isChatOpen === "boolean" ? isChatOpen : hasEnabledChats;
  return (
    <div className={cn("rounded-2xl", compact ? "" : "p-2")}> 
      <Button
        variant="default"
        size="default"
        onClick={() => onToggleAllChats(!hasEnabledChats)}
        disabled={chatCapableStreams.length === 0}
        className="w-full rounded-xl border border-white/8 bg-white/[.04] text-foreground shadow-none hover:bg-white/[.08]"
      >{chatOpen ? (
          <MessageCircleOff className="h-5 w-5 mr-2" />
        ) : (
          <MessageCircle className="h-5 w-5 mr-2" />
        )}
        {hasEnabledChats ? "Disable All Chats" : "Enable All Chats"}
      </Button>
    </div>
  )
}
