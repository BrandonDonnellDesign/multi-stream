
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,

} from "@/components/ui/select";
import { StreamPlatform } from "@/types/stream";
import { Plus } from "lucide-react";

interface StreamFormProps {
  onAdd: (platform: StreamPlatform, channel: string) => void;
}

function getChannelFromInput(platform: StreamPlatform, input: string) {
  const value = input.trim();
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    const segments = url.pathname.split("/").filter(Boolean);

    if (platform === "youtube") {
      return url.searchParams.get("v")
        ?? (url.hostname === "youtu.be" ? segments[0] : undefined)
        ?? (["embed", "live", "shorts"].includes(segments[0]) ? segments[1] : undefined)
        ?? value;
    }
    return segments[0] ?? value;
  } catch {
    return value;
  }
}

export function StreamForm({ onAdd }: StreamFormProps) {
  const [platform, setPlatform] = useState<StreamPlatform>("twitch");
  const [channel, setChannel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedChannel = getChannelFromInput(platform, channel);
    if (normalizedChannel) {
      onAdd(platform, normalizedChannel);
      setChannel("");
    }
  };

  return (
  <div className="mb-3 rounded-2xl border border-white/8 bg-white/[.025] p-2">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Select
          value={platform}
          onValueChange={(value) => setPlatform(value as StreamPlatform)}
        >
          <SelectTrigger className="h-10 rounded-xl border-white/8 bg-black/10">
            <SelectValue placeholder="Select Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="twitch">Twitch</SelectItem>
            <SelectItem value="kick">Kick</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            placeholder={platform === "youtube" ? "Video ID or YouTube URL" : "Channel name or URL"}
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="h-10 rounded-xl border-white/8 bg-black/10"
            aria-label="Stream channel or URL"
          />
          <Button type="submit" className="h-10 rounded-xl px-3" disabled={!channel.trim()}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </form>
    </div>
  );
}
