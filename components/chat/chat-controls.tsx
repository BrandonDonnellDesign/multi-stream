"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, MessageSquareOff } from "lucide-react";
import { Stream } from "@/types/stream";

interface ChatControlsProps {
  streams: Stream[];
  onToggleAllChats: (enabled: boolean) => void;
}

export function ChatControls({ streams, onToggleAllChats }: ChatControlsProps) {
  const allChatsEnabled = streams.every(s => s.chatEnabled);
  const someChatsEnabled = streams.some(s => s.chatEnabled);

  return (
    <Button
      variant={someChatsEnabled ? "default" : "outline"}
      size="sm"
      onClick={() => onToggleAllChats(!allChatsEnabled)}
      className="ml-auto"
    >
      {allChatsEnabled ? (
        <MessageSquareOff className="h-4 w-4 mr-2" />
      ) : (
        <MessageSquare className="h-4 w-4 mr-2" />
      )}
      {allChatsEnabled ? "Disable All Chats" : "Enable All Chats"}
    </Button>
  );
}