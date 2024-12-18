"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar/sidebar";
import { StreamGrid } from "@/components/stream/stream-grid";
import { useStreams } from "@/hooks/use-streams";
import { useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);
  const {
    streams,
    addStream,
    removeStream,
    toggleStreamVisibility,
    refreshStream,
  } = useStreams();

  const visibleStreams = streams.filter((s) => s.visible);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={isOpen}
        streams={streams}
        onClose={() => setIsOpen(!isOpen)}
        onAddStream={addStream}
        onToggleVisibility={toggleStreamVisibility}
        onRefresh={refreshStream}
        onRemove={removeStream}
      />

      <main className="flex-1 relative">
        {!isOpen && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        <div className="h-full">
          <StreamGrid streams={visibleStreams} />
        </div>
      </main>
    </div>
  );
}