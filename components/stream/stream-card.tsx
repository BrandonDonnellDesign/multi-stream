import { Stream } from "@/types/stream";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MessageSquare, RefreshCw, X } from "lucide-react";
import { LiveIndicator } from "./live-indicator"; // Corrected import path
import { useStreamStatus } from "@/hooks/use-stream-status";
import { KickIcon, TwitchIcon } from "../ui/stream-icons";

interface StreamCardProps {
  stream: Stream;
  onToggleVisibility: (id: string) => void;
  onToggleChat: (id: string) => void;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
}

interface IconProps {
  className?: string;
}

export function StreamCard({
  stream,
  onToggleVisibility,
  onToggleChat,
  onRefresh,
  onRemove,
}: StreamCardProps) {
  const isLive = useStreamStatus(stream);

  return (
    <div className="flex items-center justify-between px-2 py-1 rounded-xl shadow-md hover:shadow-lg transition-all" style={{ backgroundColor: '#1e1e1e' }}>
      <div>
        <div className="flex items-center gap-4">
          {stream.platform === "kick" ? (
            <KickIcon className="h-6 w-6" />
          ) : stream.platform === "twitch" ? (
            <TwitchIcon className="h-6 w-6" />
          ) : null}
          <p className="font-medium capitalize text-lg">{stream.channel}</p>
          <LiveIndicator isLive={isLive} />
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => onToggleVisibility(stream.id)}
          className="p-2"
        >
          {stream.visible ? (
            <Eye className="h-6 w-6" />
          ) : (
            <EyeOff className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant={stream.chatEnabled ? "default" : "ghost"}
          size="lg"
          onClick={() => onToggleChat(stream.id)}
          className="p-2"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => onRefresh(stream.id)}
          className="p-2"
        >
          <RefreshCw className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => onRemove(stream.id)}
          className="p-2 text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}