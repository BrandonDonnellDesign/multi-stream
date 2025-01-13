"use client";

import { useState } from "react";
import { Menu, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import StreamInput from "./StreamInput";
import StreamView from "./StreamView";

export type Stream = {
  id: string;
  platform: "twitch" | "kick";
  channel: string;
  visible: boolean;
};

export default function StreamLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const [streams, setStreams] = useState<Stream[]>([]);

  const addStream = (platform: "twitch" | "kick", channel: string) => {
    setStreams((prev) => [
      ...prev,
      {
        id: `${platform}-${channel}-${Date.now()}`,
        platform,
        channel,
        visible: true,
      },
    ]);
  };

  const removeStream = (id: string) => {
    setStreams((prev) => prev.filter((stream) => stream.id !== id));
  };

  const toggleStreamVisibility = (id: string) => {
    setStreams((prev) =>
      prev.map((stream) =>
        stream.id === id
          ? { ...stream, visible: !stream.visible }
          : stream
      )
    );
  };

  const refreshStream = (id: string) => {
    setStreams((prev) =>
      prev.map((stream) =>
        stream.id === id
          ? { ...stream, id: `${stream.platform}-${stream.channel}-${Date.now()}` }
          : stream
      )
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "h-full bg-card border-r transition-all duration-300",
          isOpen ? "w-80" : "w-0"
        )}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Streams</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-accent rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <StreamInput onAdd={addStream} />

          <div className="mt-6 space-y-4">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="flex items-center justify-between bg-accent/50 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{stream.channel}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {stream.platform}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStreamVisibility(stream.id)}
                    className="p-1 hover:bg-background rounded"
                  >
                    {stream.visible ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => refreshStream(stream.id)}
                    className="p-1 hover:bg-background rounded"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeStream(stream.id)}
                    className="p-1 hover:bg-background rounded text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed top-4 left-4 p-2 bg-card rounded-full shadow-lg hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="h-full p-4 flex justify-center items-center">
          <StreamView streams={streams.filter((s) => s.visible)} />
        </div>
      </div>
    </div>
  );
}