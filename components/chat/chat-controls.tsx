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
  const allChatsEnabled = streams.every(s => s.chatEnabled);
  const chatOpen = typeof isChatOpen === "boolean" ? isChatOpen : allChatsEnabled;
  return (
    <div className={cn("rounded-xl shadow-md bg-card", compact ? "p-2" : "p-4")}> 
      <Button
        variant="default"
        size="default"
        onClick={() => onToggleAllChats(!chatOpen)}
        className="w-full rounded-xl border-none shadow-none focus:outline-none focus:ring-0 bg-accent text-background hover:bg-accent/80"
      >{chatOpen ? (
          <MessageCircleOff className="h-5 w-5 mr-2" />
        ) : (
          <MessageCircle className="h-5 w-5 mr-2" />
        )}
        {chatOpen ? "Disable All Chats" : "Enable All Chats"}
      </Button>
    </div>
  )
}
