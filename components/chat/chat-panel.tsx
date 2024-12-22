"use client";

import { Stream } from "@/types/stream";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  streams: Stream[];
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatPanel({ streams: allStreams, isOpen, onToggle }: ChatPanelProps) {
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const streams = allStreams.filter(s => s.chatEnabled);
  const activeStream = streams[activeStreamIndex];

  const handlePrevious = () => {
    setActiveStreamIndex((prev) => (prev - 1 + streams.length) % streams.length);
  };

  const handleNext = () => {
    setActiveStreamIndex((prev) => (prev + 1) % streams.length);
  };

  if (streams.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "h-full border-l border-border transition-all duration-300 flex flex-col",
      isOpen ? "w-80" : "w-0"
    )}>
      {isOpen && (
        <>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold">{activeStream.channel} Chat</span>
            </div>
            {streams.length > 1 && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1">
            <iframe
              key={activeStream.id}
              src={activeStream.platform === "twitch" 
                ? `https://www.twitch.tv/embed/${activeStream.channel}/chat?parent=${window.location.hostname}&darkpopout`
                : `https://kick.com/${activeStream.channel}/chat`}
              className="w-full h-full"
            />
          </div>
        </>
      )}
    </div>
  );
}