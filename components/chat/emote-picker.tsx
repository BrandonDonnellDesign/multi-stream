"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface Emote {
    id: string;
    name: string;
    url: string;
    provider: 'kick' | '7tv';
}

interface EmotePickerProps {
    kickEmotes: Emote[];
    sevenTVEmotes: Emote[];
    onSelect: (emote: Emote) => void;
}

export function EmotePicker({ kickEmotes, sevenTVEmotes, onSelect }: EmotePickerProps) {
    const [activeTab, setActiveTab] = useState<'kick' | '7tv'>('kick');
    const [isOpen, setIsOpen] = useState(false);

    const currentEmotes = activeTab === 'kick' ? kickEmotes : sevenTVEmotes;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                    <Smile className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-zinc-800 bg-[#191B1F]" side="top" align="end">

                {/* Header Tabs */}
                <div className="flex items-center border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('kick')}
                        className={cn(
                            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                            activeTab === 'kick'
                                ? "text-[#53FC18] border-b-2 border-[#53FC18]"
                                : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        Kick
                    </button>
                    <button
                        onClick={() => setActiveTab('7tv')}
                        className={cn(
                            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                            activeTab === '7tv'
                                ? "text-[#53FC18] border-b-2 border-[#53FC18]"
                                : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        7TV
                    </button>
                </div>

                {/* Emote Grid */}
                <ScrollArea className="h-64 p-2">
                    {currentEmotes.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                            No emotes found
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-2">
                            {currentEmotes.map((emote) => (
                                <button
                                    key={emote.id}
                                    onClick={() => {
                                        onSelect(emote);
                                        setIsOpen(false);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded flex items-center justify-center group"
                                    title={emote.name}
                                >
                                    <img
                                        src={emote.url}
                                        alt={emote.name}
                                        className="w-auto h-8 object-contain transition-transform group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
