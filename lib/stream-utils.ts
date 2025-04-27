import { getVideoInfo } from "@/lib/youtube-api";
import { Stream } from "@/types/stream";

export function getStreamUrl(stream: Stream): string {
  const hostname = window.location.hostname;
  
  if (stream.platform === "twitch") {
    return `https://player.twitch.tv/?channel=${stream.channel}&parent=${hostname}`;
  }
  
  return `https://player.kick.com/${stream.channel}`;
}

export function encodeStreamsToUrl(streams: Stream[]): string {
  const streamParams = streams
    .filter(s => s.visible)
    .map(s => {
      const platformShort = s.platform === "twitch" ? "t" : s.platform === "kick" ? "k" : s.platform;
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
      if (!platformShort || !channel || !['t', 'k'].includes(platformShort)) {
        throw new Error('Invalid stream format');
      }
      const platform = platformShort === "t" ? "twitch" : platformShort === "k" ? "kick" : platformShort;
      return {
        id: `${platform}-${channel}-${Date.now()}`,
        platform: platform as "twitch" | "kick",
        channel,
        visible: true,
        chatEnabled: false, // Add the required chatEnabled property
        manuallyHidden: false,
        isLive: false
      };
    });
  } catch (error) {
    console.error('Error decoding streams from URL:', error);
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
    } catch (error) {
      console.error("Error fetching YouTube video data:", error);
      return {
        isLive: false,
        title: "Offline",
      };
    }
  }
  return {};
}