"use client";

import React, { useEffect, useState, useRef } from "react";
import { getKickChannelInfo } from "@/lib/kick-api";
import { subscribeToKickChat, unsubscribeFromKickChat } from "@/lib/kick-pusher";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Sword, BadgeCheck, Diamond } from "lucide-react";

interface NativeChatProps {
    channelName: string;
}

interface ChatMessage {
    id: string;
    content: string;
    sender: {
        username: string;
        slug: string;
        identity: {
            color: string;
            badges: Array<{ type: string; count?: number }>;
        };
    };
    created_at: string;
}

const BadgeRenderer = ({ badges }: { badges: Array<{ type: string; count?: number }> }) => {
    if (!badges || badges.length === 0) return null;

    return (
        <span className="inline-flex items-center gap-1 mr-1.5 align-middle select-none">
            {badges.map((badge, i) => {
                // Broadcaster
                if (badge.type === 'broadcaster') {
                    return <div key={i} className="bg-[#53FC18] text-black text-[10px] uppercase font-bold px-1 rounded-sm">Host</div>;
                }
                // Moderator
                if (badge.type === 'moderator') {
                    return <div key={i} className="bg-[#53FC18] rounded-sm p-[1px]"><Sword className="w-3 h-3 text-black fill-current" /></div>;
                }
                // Verified
                if (badge.type === 'verified') {
                    return <BadgeCheck key={i} className="w-4 h-4 text-[#53FC18] fill-current" />;
                }
                // Subscriber
                if (badge.type === 'subscriber' || badge.type === 'og') {
                    return <div key={i} className="bg-[#F4D03F] rounded-sm p-[1px]"><Crown className="w-3 h-3 text-black fill-current" /></div>;
                }
                // VIP
                if (badge.type === 'vip') {
                    return <Diamond key={i} className="w-4 h-4 text-pink-500 fill-current" />;
                }
                // Generic fallback
                return null;
            })}
        </span>
    );
};

import { useChannelEmotes } from "@/hooks/use-channel-emotes";

export function NativeChat({ channelName }: NativeChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Use shared hook for Emotes and Chatroom ID
    const { chatroomId, sevenTVMap: sevenTVEmotes } = useChannelEmotes(channelName);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Subscribe to Pusher
    useEffect(() => {
        if (!chatroomId) return;

        // Reset messages on channel change
        setMessages([]);

        const channel = subscribeToKickChat(chatroomId, (data) => {
            setMessages((prev) => {
                // Limit message history to 200
                const newMessages = [...prev, data];
                if (newMessages.length > 200) newMessages.shift();
                return newMessages;
            });
        });

        return () => {
            unsubscribeFromKickChat(chatroomId);
        };
    }, [chatroomId]);



    // ... (keep Pusher subscription)

    // Parse message content for Kick emotes AND 7TV emotes
    // Parse message content for Kick emotes AND 7TV emotes
    const renderContent = (content: string) => {
        const kickEmoteRegex = /\[emote:(\d+):([\w\s]+)\]/g;
        const parts: (string | React.ReactNode)[] = [];
        let lastIndex = 0;
        let match;

        // Helper to process text for 7TV emotes
        const processText = (text: string) => {
            if (!text) return [];
            // Split by space to find emote codes
            const words = text.split(/(\s+)/);
            return words.map((word, idx) => {
                const url = sevenTVEmotes.get(word);
                if (url) {
                    return (
                        <img
                            key={`7tv-${idx}`}
                            src={url}
                            alt={word}
                            className="inline-block h-7 w-auto mx-0.5 align-middle -mt-1"
                            title={word}
                        />
                    );
                }
                return word;
            });
        };

        while ((match = kickEmoteRegex.exec(content)) !== null) {
            // Process text before Kick emote
            if (match.index > lastIndex) {
                const textBefore = content.slice(lastIndex, match.index);
                parts.push(...processText(textBefore));
            }

            const [fullMatch, emoteId, emoteName] = match;
            parts.push(
                <img
                    key={match.index}
                    src={`https://files.kick.com/emotes/${emoteId}/fullsize`}
                    alt={emoteName}
                    className="inline-block h-6 w-auto mx-1 align-middle"
                    title={emoteName}
                />
            );

            lastIndex = match.index + fullMatch.length;
        }

        // Process remaining text
        if (lastIndex < content.length) {
            const textAfter = content.slice(lastIndex);
            parts.push(...processText(textAfter));
        }

        return parts.length > 0 ? parts : processText(content);
    };

    if (!chatroomId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-xs">Connecting to {channelName}...</span>
            </div>
        );
    }

    return (
        <ScrollArea className="flex-1 h-full bg-[#191B1F]" ref={scrollRef}>
            <div className="flex flex-col gap-[2px] px-4 py-4 min-h-full">
                {messages.map((msg, i) => (
                    <div key={msg.id || i} className="leading-5 text-[13px] group hover:bg-white/5 py-0.5 -mx-2 px-2 rounded transition-colors">
                        <div className="inline align-baseline break-words">
                            <BadgeRenderer badges={msg.sender.identity.badges} />
                            <span
                                className="font-bold mr-1 hover:underline cursor-pointer align-baseline"
                                style={{ color: msg.sender.identity.color || '#53FC18' }}
                            >
                                {msg.sender.username}
                            </span>
                            <span className="text-white/60 mr-1">:</span>
                            <span className="text-[#EFEFF1] align-baseline">
                                {renderContent(msg.content)}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} className="h-0" />
            </div>
        </ScrollArea>
    );
}
