export interface SevenTVEmote {
    id: string;
    name: string;
    data: {
        host: {
            url: string;
            files: Array<{
                name: string;
                format: string;
                width: number;
                height: number;
            }>;
        };
    };
}

export async function getSevenTVEmotes(kickUserId?: string | number): Promise<Map<string, string>> {
    const emoteMap = new Map<string, string>();

    try {
        // 1. Fetch Global Emotes (Parallel)
        const globalPromise = fetch('https://7tv.io/v3/emote-sets/global') // Use 'global' alias
            .then(res => res.ok ? res.json() : null)
            .catch(() => null);

        // 2. Fetch User Emotes (Parallel)
        const userPromise = fetch(`https://7tv.io/v3/users/kick/${kickUserId}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null);

        const [globalData, userData] = await Promise.all([globalPromise, userPromise]);

        // Process Global
        if (globalData?.emotes) {
            processEmotes(globalData.emotes, emoteMap);
        }

        // Process User (Overwrites global if same name)
        if (userData?.emote_set?.emotes) {
            processEmotes(userData.emote_set.emotes, emoteMap);
        }

    } catch (error) {
        console.warn('Failed to fetch 7TV emotes:', error);
    }

    return emoteMap;
}

function processEmotes(emotes: SevenTVEmote[], map: Map<string, string>) {
    emotes.forEach(emote => {
        // 7TV CDN: host.url + / + file.name (usually we want 1x or 2x)
        // file.name standard is like '1x.webp', '2x.webp'
        const host = emote.data.host.url;
        // Prefer 2x for high DPI, or 1x for standard
        const url = `https:${host}/2x.webp`;
        map.set(emote.name, url);
    });
}
