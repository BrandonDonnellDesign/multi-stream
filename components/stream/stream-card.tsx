import { Stream } from "@/types/stream";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GripVertical, MessageSquare, Play, RefreshCw, X } from "lucide-react";
import { LiveIndicator } from "./live-indicator"; // Corrected import path
import { KickIcon, TwitchIcon } from "../ui/stream-icons";

interface StreamCardProps {
  stream: Stream;
  onToggleVisibility: (id: string) => void;
  onToggleChat: (id: string) => void;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
  isChatOpen?: boolean;
  activeStreamId?: string;
}

export function StreamCard({
  stream,
  onToggleVisibility,
  onToggleChat,
  onRefresh,
  onRemove,
  activeStreamId,
}: StreamCardProps) {
  const isLive = stream.isLive ?? false;

  return (
    <div className={`group flex items-center justify-between rounded-2xl border px-2 py-2 transition-all ${activeStreamId === stream.id ? "border-primary/40 bg-primary/10" : "border-transparent bg-white/[.025] hover:border-white/10 hover:bg-white/[.045]"}`}>
      <GripVertical className="mr-1 h-4 w-4 shrink-0 text-muted-foreground/40" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {stream.platform === "kick" ? (
            <KickIcon className="h-4 w-4" />
          ) : stream.platform === "twitch" ? (
            <TwitchIcon className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 fill-red-500 text-red-500" />
          )}
          <p className="truncate text-sm font-semibold capitalize">{stream.channel}</p>
          <LiveIndicator isLive={isLive} />
        </div>
      </div>
      <div className="flex items-center opacity-70 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisibility(stream.id)}
          className="h-7 w-7 rounded-md flex items-center justify-center p-1"
          aria-label={`${stream.visible ? "Hide" : "Show"} ${stream.channel}`}
        >
          {stream.visible ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant={stream.chatEnabled ? "default" : "ghost"}
          size="icon"
          onClick={() => onToggleChat(stream.id)}
          className="h-7 w-7 rounded-md flex items-center justify-center p-1"
          disabled={stream.platform === "youtube"}
          aria-label={`${stream.chatEnabled ? "Disable" : "Enable"} chat for ${stream.channel}`}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRefresh(stream.id)}
          className="h-7 w-7 rounded-md flex items-center justify-center p-1"
          aria-label={`Refresh ${stream.channel}`}
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(stream.id)}
          className="h-7 w-7 rounded-md flex items-center justify-center p-1 text-destructive hover:text-destructive"
          aria-label={`Remove ${stream.channel}`}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
