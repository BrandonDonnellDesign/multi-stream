export type StreamPlatform = "youtube" | "twitch" | "kick";

export type Stream = {
  id: string;
  platform: StreamPlatform;
  channel: string;
  visible: boolean;
  chatEnabled: boolean;
  manuallyHidden?: boolean; 
  isLive?: boolean; // Track live status
  title?: string;
};