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
    .map(s => `${s.platform}:${s.channel}`)
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
      const [platform, channel] = streamStr.split(':');
      if (!platform || !channel || !['twitch', 'kick'].includes(platform)) {
        throw new Error('Invalid stream format');
      }
      return {
        id: `${platform}-${channel}-${Date.now()}`,
        platform: platform as "twitch" | "kick",
        channel,
        visible: true,
        chatEnabled: true, // or false, depending on your default value
      };
    });
  } catch (error) {
    console.error('Error decoding streams from URL:', error);
    return [];
  }
}