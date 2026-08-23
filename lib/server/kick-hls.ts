import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALLOWED_PLAYBACK_HOSTS = [
  "playback.live-video.net",
  "playlist.live-video.net",
  "hls.live-video.net",
  "cloudfront.net",
];

export function isAllowedKickPlaybackUrl(url: URL) {
  return url.protocol === "https:" && ALLOWED_PLAYBACK_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
  );
}

function signingSecret() {
  const secret = process.env.KICK_HLS_PROXY_SECRET ?? process.env.KICK_CLIENT_SECRET;
  if (!secret) throw new Error("Missing KICK_HLS_PROXY_SECRET or KICK_CLIENT_SECRET");
  return secret;
}

function encryptionKey() {
  return createHash("sha256").update(signingSecret()).digest();
}

export function createKickPlaybackToken(channel: string, upstream: URL, expires: number) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const payload = JSON.stringify({ channel: channel.toLowerCase(), upstream: upstream.toString(), expires });
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function readKickPlaybackToken(channel: string, token: string) {
  try {
    const packed = Buffer.from(token, "base64url");
    if (packed.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), packed.subarray(0, 12));
    decipher.setAuthTag(packed.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([
      decipher.update(packed.subarray(28)),
      decipher.final(),
    ]).toString("utf8")) as { channel?: unknown; upstream?: unknown; expires?: unknown };
    if (payload.channel !== channel.toLowerCase() || typeof payload.upstream !== "string" ||
        typeof payload.expires !== "number" || !Number.isSafeInteger(payload.expires) ||
        payload.expires < Math.floor(Date.now() / 1000)) return null;
    const upstream = new URL(payload.upstream);
    return isAllowedKickPlaybackUrl(upstream) ? { upstream, expires: payload.expires } : null;
  } catch {
    return null;
  }
}

export function createKickProxyUrl(baseUrl: string, channel: string, upstream: URL, expires: number) {
  const extension = upstream.pathname.match(/\.[a-z0-9]{1,5}$/i)?.[0] ?? "";
  const url = new URL(`/api/kick/hls/${encodeURIComponent(channel)}${extension}`, baseUrl);
  url.searchParams.set("token", createKickPlaybackToken(channel, upstream, expires));
  return url.toString();
}

export function rewriteKickManifest(
  manifest: string,
  baseUrl: URL,
  requestUrl: string,
  channel: string,
  expires: number,
) {
  return manifest
    .split(/\r?\n/)
    .map((line) => {
      if (!line) return line;
      if (!line.startsWith("#")) {
        return createKickProxyUrl(requestUrl, channel, new URL(line, baseUrl), expires);
      }
      return line.replace(/URI="([^"]+)"/g, (_match, uri: string) =>
        `URI="${createKickProxyUrl(requestUrl, channel, new URL(uri, baseUrl), expires)}"`,
      );
    })
    .join("\n");
}
