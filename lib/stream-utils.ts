import { getVideoInfo } from "@/lib/youtube-api";
import { Stream } from "@/types/stream";

export function encodeStreamsToUrl(streams: Stream[]): string {
  const streamParams = streams
    .filter(s => s.visible)
    .map(s => {
      const platformShort = s.platform === "twitch" ? "t" : s.platform === "kick" ? "k" : "y";
      return `${platformShort}:${s.channel}`;
    })
    .join(',');
  
  const baseUrl = window.location.origin + window.location.pathname;
  return streamParams ? `${baseUrl}?s=${encodeURIComponent(streamParams)}` : baseUrl;
}

export function decodeStreamsFromUrl(): Stream[] {
  try {
    const params = new URLSearchParams(window.location.search);
    const streamParam = params.get('s');
    
    if (!streamParam) return [];
    
    return streamParam.split(',').map(streamStr => {
      const [platformShort, channel] = streamStr.split(':');
      if (!platformShort || !channel || !['t', 'k', 'y'].includes(platformShort)) {
        throw new Error('Invalid stream format');
      }
      const platform = platformShort === "t" ? "twitch" : platformShort === "k" ? "kick" : "youtube";
      return {
        id: `${platform}-${channel}-${Date.now()}`,
        platform,
        channel,
        visible: true,
        chatEnabled: false, // Add the required chatEnabled property
        manuallyHidden: false,
        isLive: false
      };
    });
  } catch {
    return [];
  }
}

export async function getStreamData(stream: Stream): Promise<Partial<Stream>> {
  if (stream.platform === "youtube") {
    try {
      const videoData = await getVideoInfo(stream.channel);
      return {
        isLive: videoData.live,
        title: videoData.title,
      };
    } catch {
      return {
        isLive: false,
        title: "Offline",
      };
    }
  }
  return {};
}
