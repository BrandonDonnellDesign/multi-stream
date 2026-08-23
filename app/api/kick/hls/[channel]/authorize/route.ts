import { NextRequest, NextResponse } from "next/server";
import { createKickProxyUrl, isAllowedKickPlaybackUrl } from "@/lib/server/kick-hls";

const CHANNEL_PATTERN = /^[a-zA-Z0-9_-]{1,50}$/;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ channel: string }> },
) {
  const { channel } = await context.params;
  if (!CHANNEL_PATTERN.test(channel)) {
    return NextResponse.json({ error: "Invalid Kick channel" }, { status: 400 });
  }

  try {
    const body = await request.json() as { playbackUrl?: unknown };
    if (typeof body.playbackUrl !== "string") {
      return NextResponse.json({ error: "Missing playback URL" }, { status: 400 });
    }
    const upstream = new URL(body.playbackUrl);
    if (!isAllowedKickPlaybackUrl(upstream)) {
      return NextResponse.json({ error: "Unsupported playback host" }, { status: 403 });
    }

    const expires = Math.floor(Date.now() / 1000) + 10 * 60;
    return NextResponse.json({
      source: createKickProxyUrl(request.url, channel, upstream, expires),
      expires,
    });
  } catch {
    return NextResponse.json({ error: "Invalid playback URL" }, { status: 400 });
  }
}
