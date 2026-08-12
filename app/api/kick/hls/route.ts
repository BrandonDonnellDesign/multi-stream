import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST_SUFFIX = ".playback.live-video.net";

function parseAllowedUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.endsWith(ALLOWED_HOST_SUFFIX)) return null;
    return url;
  } catch {
    return null;
  }
}

function proxiedUrl(target: URL, request: NextRequest) {
  const proxy = new URL("/api/kick/hls", request.nextUrl.origin);
  proxy.searchParams.set("url", target.toString());
  return `${proxy.pathname}${proxy.search}`;
}

function rewriteManifest(manifest: string, source: URL, request: NextRequest) {
  return manifest.split(/\r?\n/).map((line) => {
    if (!line) return line;
    if (!line.startsWith("#")) return proxiedUrl(new URL(line, source), request);
    return line.replace(/URI="([^"]+)"/g, (_, uri: string) => `URI="${proxiedUrl(new URL(uri, source), request)}"`);
  }).join("\n");
}

export async function GET(request: NextRequest) {
  const target = parseAllowedUrl(request.nextUrl.searchParams.get("url"));
  if (!target) return NextResponse.json({ error: "Invalid Kick playback URL" }, { status: 400 });

  try {
    const range = request.headers.get("range");
    const upstream = await fetch(target, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MultiStream/1.0)",
        "Origin": "https://player.kick.com",
        "Referer": "https://player.kick.com/",
        ...(range ? { Range: range } : {}),
      },
    });
    if (!upstream.ok) return NextResponse.json({ error: `Kick CDN returned ${upstream.status}` }, { status: upstream.status });

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    if (target.pathname.endsWith(".m3u8") || contentType.includes("mpegurl")) {
      const manifest = rewriteManifest(await upstream.text(), target, request);
      return new NextResponse(manifest, {
        headers: { "Content-Type": "application/vnd.apple.mpegurl", "Cache-Control": "no-store" },
      });
    }

    const responseHeaders = new Headers({
      "Content-Type": contentType,
      "Cache-Control": upstream.headers.get("cache-control") ?? "private, max-age=2",
    });
    for (const name of ["accept-ranges", "content-length", "content-range"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        ...Object.fromEntries(responseHeaders.entries()),
      },
    });
  } catch {
    return NextResponse.json({ error: "Kick CDN request failed" }, { status: 502 });
  }
}
