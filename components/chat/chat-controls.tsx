"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, MessageCircleOff } from "lucide-react";
import { Stream } from "@/types/stream";
import { cn } from "@/lib/utils";

interface ChatControlsProps {
  streams: Stream[];
  onToggleAllChats: (enabled: boolean) => void;
  compact?: boolean;
}

export function ChatControls({ streams, onToggleAllChats, compact }: ChatControlsProps) {
  const allChatsEnabled = streams.every(s => s.chatEnabled);
  const someChatsEnabled = streams.some(s => s.chatEnabled);
  return (
  <div className={cn("rounded-xl shadow-md bg-card", compact ? "p-2" : "p-4")}> 
    <Button
      variant="default"
      size="default"
      onClick={() => onToggleAllChats(!allChatsEnabled)}
      className="w-full rounded-xl border-none shadow-none focus:outline-none focus:ring-0 bg-accent text-background hover:bg-accent/80"
    >{allChatsEnabled ? (
        <MessageCircleOff className="h-5 w-5 mr-2" />
      ) : (
        <MessageCircle className="h-5 w-5 mr-2" />
      )}
      {allChatsEnabled ? "Disable All Chats" : "Enable All Chats"}
        </Button>
    </div>
  )
}
