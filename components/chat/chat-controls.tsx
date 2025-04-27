"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, MessageCircleOff } from "lucide-react";
import { Stream } from "@/types/stream";

interface ChatControlsProps {
  streams: Stream[];
  onToggleAllChats: (enabled: boolean) => void;
}

export function ChatControls({ streams, onToggleAllChats }: ChatControlsProps) {
  const allChatsEnabled = streams.every(s => s.chatEnabled);
  const someChatsEnabled = streams.some(s => s.chatEnabled);

  return (
    <div className="rounded-xl shadow-md">
        <Button
            variant={someChatsEnabled ? "secondary" : "outline"}
            size="default"
            onClick={() => onToggleAllChats(!allChatsEnabled)}
            className="w-full rounded-xl"
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
