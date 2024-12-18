import { Stream } from "@/types/stream";

export function getStreamUrl(stream: Stream): string {
  const hostname = window.location.hostname;
  
  if (stream.platform === "twitch") {
    return `https://player.twitch.tv/?channel=${stream.channel}&parent=${hostname}`;
  }
  
  return `https://player.kick.com/${stream.channel}`;
}