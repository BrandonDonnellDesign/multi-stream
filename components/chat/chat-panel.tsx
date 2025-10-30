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
              isOpen ? "w-[10%] bg-background" : "w-0",
          )}
          
    >
      {isOpen && (
        <>
          <div className="flex items-center justify-between p-4 border-b border-muted">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
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
          <div className="flex-1 overflow-hidden">
            <iframe
              key={activeStream.id}
              src={
                activeStream.platform === "twitch"
                ? `https://player.twitch.tv/?channel=${activeStream.channel}&parent=${window.location.hostname}`
                : activeStream.platform === "youtube"
                ? `https://www.youtube.com/embed/live_stream?channel=${activeStream.channel}`
                : undefined
              }
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </>
      )}
      <div className="p-4 flex flex-col gap-2">
        <Button onClick={onToggle} className="w-full">
          {isOpen ? "Close Chat" : "Open Chat"}
        </Button>
        <Button
          onClick={() => {
            if (activeStream) {
              removeStream(activeStream.id);
            }
          }}
          variant="destructive"
          className="w-full"
        >
          Remove This Stream
        </Button>
      </div>
    </div>
  );
}