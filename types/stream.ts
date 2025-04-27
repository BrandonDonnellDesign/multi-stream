export type Stream = {
  id: string;
  platform: "youtube" | "twitch" | "kick";
  channel: string;
  visible: boolean;
  chatEnabled: boolean;
  manuallyHidden?: boolean; // Track if user manually hid the stream
  isLive?: boolean; // Track live status
};