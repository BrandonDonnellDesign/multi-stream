import { Stream } from "@/types/stream";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MessageSquare, RefreshCw, X } from "lucide-react";
import { LiveIndicator } from "./live-indicator";
import { useStreamStatus } from "@/hooks/use-stream-status";
import { KickIcon, TwitchIcon } from "./stream-icons";

interface StreamCardProps {
  stream: Stream;
  onToggleVisibility: (id: string) => void;
  onToggleChat: (id: string) => void;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
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
    <div className="flex items-center justify-between bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
      <div>
        <div className="flex items-center gap-2">
          {stream.platform === "kick" ? (
            <KickIcon />
          ) : stream.platform === "twitch" ? (
            <TwitchIcon />
          ) : null}
          <p className="font-medium">{stream.channel}</p>
          <LiveIndicator isLive={isLive} />
        </div>
        {/* <p className="text-sm text-muted-foreground capitalize">
          {stream.platform === "kick" ? (
            <KickIcon />
          ) : stream.platform === "twitch" ? (
            <TwitchIcon />
          ) : null}
        </p> */}
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisibility(stream.id)}
          className="h-8 w-8"
        >
          {stream.visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant={stream.chatEnabled ? "default" : "ghost"}
          size="icon"
          onClick={() => onToggleChat(stream.id)}
          className="h-8 w-8"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRefresh(stream.id)}
          className="h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(stream.id)}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}