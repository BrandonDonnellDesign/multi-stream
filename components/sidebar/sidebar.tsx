import { StreamForm } from "./stream-form";
import { StreamList } from "./stream-list";
import { Stream } from "@/types/stream";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share/share-button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  streams: Stream[];
  onClose: () => void;
  onAddStream: (platform: "twitch" | "kick", channel: string) => void;
  onToggleVisibility: (id: string) => void;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
}

export function Sidebar({
  isOpen,
  streams,
  onClose,
  onAddStream,
  onToggleVisibility,
  onRefresh,
  onRemove,
}: SidebarProps) {
  return (
    <div
      className={cn(
        "h-full bg-background border-r border-border transition-all duration-300 flex flex-col",
        isOpen ? "w-80" : "w-16"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className={cn("font-semibold", !isOpen && "hidden")}>
          Stream Manager
        </h2>
        <div className="flex items-center gap-2">
          {isOpen && <ShareButton streams={streams} />}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="flex-1 overflow-auto p-4">
          <StreamForm onAdd={onAddStream} />
          <StreamList
            streams={streams}
            onToggleVisibility={onToggleVisibility}
            onRefresh={onRefresh}
            onRemove={onRemove}
          />
        </div>
      )}
    </div>
  );
}