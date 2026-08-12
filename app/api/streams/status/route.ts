import { NextRequest, NextResponse } from "next/server";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TWITCH_STREAMS_URL = "https://api.twitch.tv/helix/streams";
const CHANNEL_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

let twitchToken: { value: string; expiresAt: number } | null = null;

async function getTwitchToken() {
  if (twitchToken && twitchToken.expiresAt > Date.now()) return twitchToken.value;

  const clientId = process.env.TWITCH_CLIENT_ID ?? process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET ?? process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const response = await fetch(`${TWITCH_TOKEN_URL}?${params}`, { method: "POST" });
  if (!response.ok) return null;

  const data = await response.json() as { access_token: string; expires_in: number };
  twitchToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(0, data.expires_in - 60) * 1000,
  };
  return twitchToken.value;
}

async function isTwitchLive(channel: string) {
  const clientId = process.env.TWITCH_CLIENT_ID ?? process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  const token = await getTwitchToken();
  if (!clientId || !token) return null;

  const params = new URLSearchParams({ user_login: channel });
  const response = await fetch(`${TWITCH_STREAMS_URL}?${params}`, {
    headers: { "Client-ID": clientId, Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  const data = await response.json() as { data: unknown[] };
  return data.data.length > 0;
}

async function isKickLive(channel: string) {
  const response = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  const data = await response.json() as { livestream?: unknown };
  return data.livestream != null;
}

async function isYouTubeLive(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY ?? process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!apiKey) return null;
  const params = new URLSearchParams({ part: "snippet", id: videoId, key: apiKey });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  const data = await response.json() as { items?: Array<{ snippet?: { liveBroadcastContent?: string } }> };
  return data.items?.[0]?.snippet?.liveBroadcastContent === "live";
}

export async function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get("platform");
  const channel = request.nextUrl.searchParams.get("channel")?.trim();

  if ((platform !== "twitch" && platform !== "kick" && platform !== "youtube") || !channel || !CHANNEL_PATTERN.test(channel)) {
    return NextResponse.json({ error: "Invalid platform or channel" }, { status: 400 });
  }

  try {
    const isLive = platform === "twitch"
      ? await isTwitchLive(channel)
      : platform === "kick"
        ? await isKickLive(channel)
        : await isYouTubeLive(channel);
    if (isLive === null) {
      return NextResponse.json({ error: "Status unavailable" }, { status: 503 });
    }
    return NextResponse.json({ isLive });
  } catch {
    return NextResponse.json({ error: "Status unavailable" }, { status: 503 });
  }
}
