"use client";

import { Stream } from "@/types/stream";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatTabsProps {
    streams: Stream[];
    activeStreamId: string | null;
    onSelect: (id: string) => void;
}

export function ChatTabs({ streams, activeStreamId, onSelect }: ChatTabsProps) {
    const enabledStreams = streams.filter(s => s.chatEnabled);

    return (
        <div className="flex items-center gap-1 p-2 bg-muted/30 overflow-x-auto no-scrollbar border-b border-muted">
            {enabledStreams.map((stream) => {
                const isActive = stream.id === activeStreamId;
                return (
                    <Button
                        key={stream.id}
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onSelect(stream.id)}
                        className={cn(
                            "h-8 px-3 text-xs rounded-full transition-all",
                            isActive && "bg-white text-black font-semibold shadow-sm hover:bg-white/90"
                        )}
                    >
                        <span className={cn(
                            "w-2 h-2 rounded-full mr-2",
                            stream.platform === 'kick' ? 'bg-[#53FC18]' :
                                stream.platform === 'twitch' ? 'bg-[#9146FF]' : 'bg-red-500'
                        )} />
                        {stream.channel}
                    </Button>
                );
            })}
        </div>
    );
}
