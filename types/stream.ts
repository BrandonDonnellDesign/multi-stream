export type Stream = {
  id: string;
  platform: "twitch" | "kick";
  channel: string;
  visible: boolean;
  chatEnabled: boolean;
};