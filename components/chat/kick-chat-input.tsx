"use client";

import { useState } from "react";
import { Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChannelEmotes, Emote } from "@/hooks/use-channel-emotes";
import { EmotePicker } from "./emote-picker";

interface KickChatInputProps {
    channelName: string;
}

export function KickChatInput({ channelName }: KickChatInputProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { kickEmotes, sevenTVEmotes } = useChannelEmotes(channelName);

    const handleSend = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        setError(null);

        try {
            const response = await fetch('/api/kick/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel: channelName, content: message }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Failed to send message');
            setMessage("");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmoteSelect = (emote: Emote) => {
        const insertion = emote.provider === 'kick'
            ? `[emote:${emote.id}:${emote.name}] `
            : `${emote.name} `;

        setMessage((prev) => prev + insertion);
    };

    return (
        <div className="border-t border-white/8 bg-card p-3">
            {error && (
                <div className="flex items-center gap-2 text-destructive text-sm mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
            <div className="flex gap-2">
                <EmotePicker
                    kickEmotes={kickEmotes}
                    sevenTVEmotes={sevenTVEmotes}
                    onSelect={handleEmoteSelect}
                />
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Send to ${channelName}...`}
                    disabled={isSending}
                    className="flex-1 rounded-xl border-white/8 bg-white/[.04]"
                    maxLength={500}
                />
                <Button
                    onClick={handleSend}
                    disabled={isSending || !message.trim()}
                    size="icon"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
