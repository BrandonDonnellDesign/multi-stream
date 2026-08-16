
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import { Stream } from "@/types/stream";
import { cn } from "@/lib/utils";

interface PlatformPlayerProps {
  stream: Stream;
  className?: string;
}

function getStreamUrl(stream: Stream): string {
  if (stream.platform === "twitch") {
    return `https://player.twitch.tv/?channel=${encodeURIComponent(stream.channel)}&parent=${window.location.hostname}`;
  }
  if (stream.platform === "youtube") {
    return `https://www.youtube.com/embed/${stream.channel}?autoplay=1`;
  }
  return `/api/kick/hls/${encodeURIComponent(stream.channel)}`;
}

function KickPlayer({ stream }: { stream: Stream }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<Array<{ index: number; label: string }>>([]);
  const [selectedQuality, setSelectedQuality] = useState(-1);
  const [activeQuality, setActiveQuality] = useState<string | null>(null);
  const channel = stream.channel;
  const playerVersion = stream.playerVersion;

  const resolveSource = useCallback(async () => {
    const slug = channel.trim().toLowerCase();
    const endpoints = [
      `https://kick.com/api/v2/channels/${encodeURIComponent(slug)}/livestream`,
      `https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`,
    ];
    let playbackUrl: string | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) continue;

        const data = (await response.json()) as {
          playback_url?: string | null;
          data?: { playback_url?: string | null };
          livestream?: { playback_url?: string | null };
        };
        playbackUrl =
          data.playback_url ??
          data.data?.playback_url ??
          data.livestream?.playback_url ??
          null;
        if (playbackUrl) break;
      } catch {
        // Kick may block one legacy endpoint while allowing the other.
      }
    }

    if (!playbackUrl) return null;

    const source = new URL(`/api/kick/hls/${encodeURIComponent(channel)}`, window.location.origin);
    source.searchParams.set("url", playbackUrl);
    return source.toString();
  }, [channel]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let disposed = false;
    let destroyPlayer: (() => void) | undefined;
    const fallBackToEmbed = () => {
      if (disposed) return;
      setError(null);
      setQualityLevels([]);
      setUseEmbedFallback(true);
    };
    const start = async () => {
      setError(null);
      setUseEmbedFallback(false);
      setQualityLevels([]);
      setSelectedQuality(-1);
      setActiveQuality(null);
      const source = await resolveSource();
      if (!source) {
        setUseEmbedFallback(true);
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.load();
        void video.play().catch(() => undefined);
        destroyPlayer = () => {
          video.removeAttribute("src");
          video.load();
        };
        return;
      }

      const { default: Hls } = await import("hls.js");
      if (disposed) return;
      if (!Hls.isSupported()) {
        fallBackToEmbed();
        return;
      }

      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
      });
      hlsRef.current = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setQualityLevels(hls.levels.map((level, index) => ({
          index,
          label: level.height
            ? `${level.height}p`
            : `${Math.round(level.bitrate / 1_000)} kbps`,
        })));
        void video.play().catch(() => undefined);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const level = hls.levels[data.level];
        setActiveQuality(level?.height ? `${level.height}p` : null);
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.destroy();
          if (hlsRef.current === hls) hlsRef.current = null;
          fallBackToEmbed();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        hls.destroy();
        if (hlsRef.current === hls) hlsRef.current = null;
        fallBackToEmbed();
      });
      destroyPlayer = () => {
        hls.destroy();
        if (hlsRef.current === hls) hlsRef.current = null;
      };
    };

    void start().catch((reason) => {
      console.error(`Failed to start Kick player for ${channel}:`, reason);
      fallBackToEmbed();
    });

    return () => {
      disposed = true;
      destroyPlayer?.();
    };
  }, [channel, playerVersion, resolveSource]);

  const changeQuality = (value: string) => {
    const level = Number(value);
    setSelectedQuality(level);
    if (hlsRef.current) hlsRef.current.currentLevel = level;
  };

  return (
    <>
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 h-full w-full bg-black object-contain",
          useEmbedFallback && "hidden",
        )}
        controls
        autoPlay
        muted
        playsInline
        onError={() => {
          setError(null);
          setQualityLevels([]);
          setUseEmbedFallback(true);
        }}
      />
      {useEmbedFallback && (
        <iframe
          key={`${channel}-${playerVersion ?? 0}`}
          src={`https://player.kick.com/${encodeURIComponent(channel.trim().toLowerCase())}?autoplay=true&muted=true`}
          title={`${channel} Kick stream`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; storage-access"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
      {!useEmbedFallback && qualityLevels.length > 0 && (
        <label className="absolute right-2 top-2 z-10 flex items-center gap-2 rounded-md bg-black/75 px-2 py-1 text-xs text-white shadow-sm backdrop-blur-sm">
          <span className="hidden sm:inline">Quality</span>
          <select
            value={selectedQuality}
            onChange={(event) => changeQuality(event.target.value)}
            className="cursor-pointer bg-transparent font-medium text-white outline-none"
            aria-label="Kick stream quality"
          >
            <option value={-1} className="bg-black text-white">
              Auto{selectedQuality === -1 && activeQuality ? ` (${activeQuality})` : ""}
            </option>
            {qualityLevels.map((level) => (
              <option key={level.index} value={level.index} className="bg-black text-white">
                {level.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-white">
          {error}
        </div>
      )}
    </>
  );
}

export function PlatformPlayer({ stream, className }: PlatformPlayerProps) {
  return (
    <div className={cn("relative w-full h-full shadow-lg", className)}>
      <div className="overflow-hidden w-full h-full">
        {stream.platform === "kick" ? (
          <KickPlayer stream={stream} />
        ) : (
          <iframe
          key={stream.playerVersion ?? 0}
          src={getStreamUrl(stream)}
          allowFullScreen
          title="Stream Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          frameBorder="0"
          className="absolute inset-0 w-full h-full"
          loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
