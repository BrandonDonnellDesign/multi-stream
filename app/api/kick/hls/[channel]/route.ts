import { NextRequest, NextResponse } from "next/server";
import {
  rewriteKickManifest,
  readKickPlaybackToken,
} from "@/lib/server/kick-hls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHANNEL_PATTERN = /^[a-zA-Z0-9_-]{1,50}$/;
const PROXY_RESOURCE_PATTERN = /^([a-zA-Z0-9_-]{1,50})(?:\.[a-zA-Z0-9]{1,5})?$/;
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ channel: string }> },
) {
  const { channel: resource } = await context.params;
  const match = resource.match(PROXY_RESOURCE_PATTERN);
  const channel = match?.[1] ?? "";
  if (!CHANNEL_PATTERN.test(channel)) {
    return NextResponse.json({ error: "Invalid Kick channel" }, { status: 400 });
  }

  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing playback authorization" }, { status: 401 });
    }
    const authorization = readKickPlaybackToken(channel, token);
    if (!authorization) {
      return NextResponse.json({ error: "Invalid or expired playback authorization" }, { status: 401 });
    }
    const { upstream, expires } = authorization;

    const range = request.headers.get("range");
    const upstreamResponse = await fetch(upstream, {
      cache: "no-store",
      headers: {
        Accept: "*/*",
        ...(range ? { Range: range } : {}),
      },
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return NextResponse.json(
        { error: `Kick playback returned ${upstreamResponse.status}` },
        { status: upstreamResponse.status },
      );
    }

    const contentType = upstreamResponse.headers.get("content-type") ?? "application/octet-stream";
    const isManifest = contentType.includes("mpegurl") || upstream.pathname.endsWith(".m3u8");

    if (isManifest) {
      const rewritten = rewriteKickManifest(
        await upstreamResponse.text(),
        upstream,
        request.url,
        channel,
        expires,
      );
      return new NextResponse(rewritten, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-store",
        },
      });
    }

    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = upstreamResponse.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load Kick stream" }, { status: 502 });
  }
}
