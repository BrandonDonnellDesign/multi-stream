"use client";

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

interface StreamFormProps {
  onAdd: (platform: "twitch" | "kick", channel: string) => void;
}

export function StreamForm({ onAdd }: StreamFormProps) {
  const [platform, setPlatform] = useState<"twitch" | "kick">("twitch");
  const [channel, setChannel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channel.trim()) {
      onAdd(platform, channel.trim());
      setChannel("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <Select
        value={platform}
        onValueChange={(value: "twitch" | "kick") => setPlatform(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="twitch">Twitch</SelectItem>
          <SelectItem value="kick">Kick</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Input
          placeholder="Enter channel name"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        />
        <Button type="submit">Add</Button>
      </div>
    </form>
  );
}