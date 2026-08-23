import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isAllowedKickPlaybackUrl,
  createKickPlaybackToken,
  readKickPlaybackToken,
  rewriteKickManifest,
} from "./kick-hls";

describe("Kick HLS proxy authorization", () => {
  beforeEach(() => vi.stubEnv("KICK_HLS_PROXY_SECRET", "test-secret"));

  it("only accepts approved HTTPS playback CDNs", () => {
    expect(isAllowedKickPlaybackUrl(new URL("https://abc.playback.live-video.net/live.m3u8"))).toBe(true);
    expect(isAllowedKickPlaybackUrl(new URL("https://abc.playlist.live-video.net/live.m3u8"))).toBe(true);
    expect(isAllowedKickPlaybackUrl(new URL("https://abc.cloudfront.hls.live-video.net/segment.ts"))).toBe(true);
    expect(isAllowedKickPlaybackUrl(new URL("https://d123.cloudfront.net/live.m3u8"))).toBe(true);
    expect(isAllowedKickPlaybackUrl(new URL("http://abc.playback.live-video.net/live.m3u8"))).toBe(false);
    expect(isAllowedKickPlaybackUrl(new URL("https://cloudfront.net.evil.example/live.m3u8"))).toBe(false);
    expect(isAllowedKickPlaybackUrl(new URL("https://playlist.live-video.net.evil.example/live.m3u8"))).toBe(false);
    expect(isAllowedKickPlaybackUrl(new URL("https://hls.live-video.net.evil.example/segment.ts"))).toBe(false);
  });

  it("encrypts playback URLs and rejects tampered or expired tokens", () => {
    const upstream = new URL("https://abc.playback.live-video.net/live.m3u8");
    const expires = Math.floor(Date.now() / 1000) + 60;
    const token = createKickPlaybackToken("rayc", upstream, expires);
    expect(token).not.toContain("live-video.net");
    expect(readKickPlaybackToken("rayc", token)?.upstream.toString()).toBe(upstream.toString());
    expect(readKickPlaybackToken("other", token)).toBeNull();
    expect(readKickPlaybackToken("rayc", `${token.slice(0, -1)}x`)).toBeNull();
    const expired = createKickPlaybackToken("rayc", upstream, expires - 120);
    expect(readKickPlaybackToken("rayc", expired)).toBeNull();
  });

  it("rewrites playlists and key URIs into signed proxy URLs", () => {
    const expires = Math.floor(Date.now() / 1000) + 60;
    const rewritten = rewriteKickManifest(
      '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="key.bin"\nsegment.ts',
      new URL("https://abc.playback.live-video.net/path/master.m3u8"),
      "https://multistream.example/api/kick/hls/rayc",
      "rayc",
      expires,
    );
    expect(rewritten).toContain("/api/kick/hls/rayc.ts?");
    expect(rewritten).toContain("/api/kick/hls/rayc.bin?");
    expect(rewritten).toContain("token=");
    expect(rewritten).not.toContain("live-video.net");
  });
});
