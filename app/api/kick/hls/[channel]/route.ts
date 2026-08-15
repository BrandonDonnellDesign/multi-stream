import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHANNEL_PATTERN = /^[a-zA-Z0-9_-]{1,50}$/;
const ALLOWED_PLAYBACK_HOSTS = ["playback.live-video.net", "cloudfront.net"];

function isAllowedPlaybackUrl(url: URL) {
  return url.protocol === "https:" && ALLOWED_PLAYBACK_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
  );
}

function proxyUrl(request: NextRequest, channel: string, upstream: URL) {
  const url = new URL(`/api/kick/hls/${encodeURIComponent(channel)}`, request.url);
  url.searchParams.set("url", upstream.toString());
  return url.toString();
}

function rewriteManifest(manifest: string, baseUrl: URL, request: NextRequest, channel: string) {
  return manifest
    .split(/\r?\n/)
    .map((line) => {
      if (!line) return line;

      if (!line.startsWith("#")) {
        return proxyUrl(request, channel, new URL(line, baseUrl));
      }

      return line.replace(/URI="([^"]+)"/g, (_match, uri: string) =>
        `URI="${proxyUrl(request, channel, new URL(uri, baseUrl))}"`,
      );
    })
    .join("\n");
}

async function resolvePlaybackUrl(channel: string) {
  const response = await fetch(
    `https://kick.com/api/v2/channels/${encodeURIComponent(channel)}/livestream`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MultiStream/1.0)",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Kick returned ${response.status}`);
  }

  const data = (await response.json()) as { playback_url?: string | null };
  if (!data.playback_url) return null;

  const url = new URL(data.playback_url);
  if (!isAllowedPlaybackUrl(url)) throw new Error("Kick returned an unsupported playback host");
  return url;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ channel: string }> },
) {
  const { channel } = await context.params;
  if (!CHANNEL_PATTERN.test(channel)) {
    return NextResponse.json({ error: "Invalid Kick channel" }, { status: 400 });
  }

  try {
    const requestedUrl = request.nextUrl.searchParams.get("url");
    const upstream = requestedUrl ? new URL(requestedUrl) : await resolvePlaybackUrl(channel);

    if (!upstream) {
      return NextResponse.json({ error: "Kick channel is offline" }, { status: 404 });
    }
    if (!isAllowedPlaybackUrl(upstream)) {
      return NextResponse.json({ error: "Unsupported playback host" }, { status: 403 });
    }

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
      const rewritten = rewriteManifest(await upstreamResponse.text(), upstream, request, channel);
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
  } catch (error) {
    console.error(`Failed to proxy Kick stream ${channel}:`, error);
    return NextResponse.json({ error: "Unable to load Kick stream" }, { status: 502 });
  }
}
