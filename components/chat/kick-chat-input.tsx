"use client";

import { useState } from "react";
import { Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendKickMessage, getKickChannelInfo } from "@/lib/kick-api";
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

        const token = localStorage.getItem("kick_oauth_token");
        if (!token) {
            setError("No API Token found. Please set it in Settings.");
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            // We first need the user ID. Ideally we'd cache this or pass it in, 
            // but fetching it here ensures we have the correct ID for the channel.
            // Optimization: In a real app, cache this ID.
            const channelInfo = await getKickChannelInfo(channelName);
            if (!channelInfo || !channelInfo.user_id) {
                throw new Error("Could not resolve channel ID");
            }

            await sendKickMessage(channelInfo.user_id, message, token);
            setMessage("");
        } catch (err: any) {
            setError(err.message || "Failed to send message");
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
        <div className="p-4 border-t border-muted bg-card">
            {error && (
                <div className="flex items-center gap-2 text-destructive text-sm mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
            <div className="flex gap-2">
                {/* 
                <EmotePicker
                    kickEmotes={kickEmotes}
                    sevenTVEmotes={sevenTVEmotes}
                    onSelect={handleEmoteSelect}
                /> 
                */}
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Send to ${channelName}...`}
                    disabled={isSending}
                    className="flex-1"
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
