"use client";

import { Stream } from "@/types/stream";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ChatPanelProps {
  streams: Stream[];
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatPanel({ streams: allStreams, isOpen, onToggle }: ChatPanelProps) {
  const streams = allStreams;

  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const activeStream = streams[activeStreamIndex];

  const handlePrevious = () => {
    setActiveStreamIndex((prev) => (prev - 1 + streams.length) % streams.length);
  };

  const handleNext = () => {
    setActiveStreamIndex((prev) => (prev + 1) % streams.length);
  };
  // Reset index if out of bounds
  useEffect(() => {
    if (activeStreamIndex >= streams.length && streams.length > 0) {
      setActiveStreamIndex(0);
    }
  }, [activeStreamIndex, streams]);

  // Remove a stream
  const removeStream = (streamId: string) => {
    // Logic to remove the stream from the props or state if needed
  };

  if (streams.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 flex flex-col shadow-lg rounded-md",
        isOpen ? "w-[10%] bg-background" : "w-0"
      )}
    >
      {isOpen && (
        <>
          <div className="flex items-center justify-between p-4 border-b border-muted">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="font-semibold">{activeStream.channel} Chat</span>
            </div>
            <div className="flex items-center gap-1">
              {streams.length > 1 && (
                <>
                  <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              {/* Close button */}
              <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              key={activeStream.id}
              src={
                activeStream.platform === "twitch"
                  ? `https://www.twitch.tv/embed/${activeStream.channel}/chat?parent=${window.location.hostname}&darkpopout`
                  : activeStream.platform === "kick"
                  ? `https://kick.com/popout/${activeStream.channel}/chat`
                  : undefined
              }
              className="w-full h-full border-none"
            />
          </div>
        </>
      )}
    </div>
  );
}