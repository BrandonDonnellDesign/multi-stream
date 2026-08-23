import { useState, useEffect } from "react";

export interface Emote {
    id: string;
    name: string;
    url: string;
    provider: 'kick' | '7tv';
}

async function getKickChannelInfo(channelName: string, signal: AbortSignal) {
    const slug = channelName.trim().toLowerCase();
    const response = await fetch(
        `https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`,
        { signal }
    );
    if (!response.ok) {
        throw new Error(`Kick channel request failed with ${response.status}`);
    }
    return response.json();
}

export function useChannelEmotes(channelName: string) {
    const [kickEmotes, setKickEmotes] = useState<Emote[]>([]);
    const [sevenTVEmotes, setSevenTVEmotes] = useState<Emote[]>([]);
    const [sevenTVMap, setSevenTVMap] = useState<Map<string, string>>(new Map());
    const [chatroomId, setChatroomId] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 5_000);

        async function fetchEmotes() {
            try {
                // 1. Fetch Kick Channel Info & Emotes
                const kickData = await getKickChannelInfo(channelName, controller.signal);

                if (!mounted) return;


                if (kickData?.chatroom?.id) {
                    setChatroomId(kickData.chatroom.id);
                }

                // Process Kick Emotes
                let k_emotes: Emote[] = [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const chatroom = kickData?.chatroom as any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const kickRoot = kickData as any;

                // Check chatroom.emotes OR root emotes
                const rawKickEmotes = chatroom?.emotes || kickRoot?.emotes;

                if (rawKickEmotes && Array.isArray(rawKickEmotes)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    k_emotes = rawKickEmotes.map((e: any) => ({
                        id: e.id,
                        name: e.name,
                        url: `https://files.kick.com/emotes/${e.id}/fullsize`,
                        provider: 'kick'
                    }));
                }

                if (mounted) {
                    setKickEmotes(k_emotes);
                }

                // 2. Fetch 7TV Emotes (Always try, even if ID is missing we get globals)
                try {
                    const { getSevenTVEmotes } = await import("@/lib/seventv-api");
                    // Pass user_id if valid, otherwise undefined
                    const emoteMap = await getSevenTVEmotes(kickData?.user_id || undefined);

                    if (mounted) {
                        setSevenTVMap(emoteMap);

                        const s_emotes: Emote[] = Array.from(emoteMap.entries()).map(([name, url], idx) => ({
                            id: `7tv-${idx}`,
                            name: name,
                            url: url,
                            provider: '7tv'
                        }));
                        setSevenTVEmotes(s_emotes);
                    }
                } catch {
                }

            } catch {
            }
        }

        if (channelName) {
            fetchEmotes();
        }

        return () => {
            mounted = false;
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [channelName]);

    return { kickEmotes, sevenTVEmotes, sevenTVMap, chatroomId };
}
