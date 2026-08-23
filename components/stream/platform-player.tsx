"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type videojs from "video.js";
import type { VideoJSIVSTech, VideoJSQualityPlugin } from "amazon-ivs-player";
import { Stream } from "@/types/stream";
import { cn } from "@/lib/utils";

interface PlatformPlayerProps { stream: Stream; className?: string }
type IVSVideoJsPlayer = ReturnType<typeof videojs> & VideoJSIVSTech & VideoJSQualityPlugin;

function getStreamUrl(stream: Stream): string {
  if (stream.platform === "twitch") return `https://player.twitch.tv/?channel=${encodeURIComponent(stream.channel)}&parent=${window.location.hostname}`;
  if (stream.platform === "youtube") return `https://www.youtube.com/embed/${stream.channel}?autoplay=1`;
  return "";
}

function KickPlayer({ stream }: { stream: Stream }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<string | null>("Connecting to Kick");
  const channel = stream.channel.trim().toLowerCase();
  const playerVersion = stream.playerVersion;

  const resolvePlaybackUrl = useCallback(async () => {
    const endpoints = [
      `https://kick.com/api/v2/channels/${encodeURIComponent(channel)}/livestream`,
      `https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`,
    ];
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: "no-store", headers: { Accept: "application/json" } });
        if (!response.ok) continue;
        const data = (await response.json()) as {
          playback_url?: string | null;
          data?: { playback_url?: string | null };
          livestream?: { playback_url?: string | null };
        };
        const playbackUrl = data.playback_url ?? data.data?.playback_url ?? data.livestream?.playback_url ?? null;
        if (playbackUrl) return playbackUrl;
      } catch {
        // Kick sometimes blocks one endpoint while allowing the other.
      }
    }
    return null;
  }, [channel]);

  const authorizeProxy = useCallback(async (playbackUrl: string) => {
    const response = await fetch(`/api/kick/hls/${encodeURIComponent(channel)}/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playbackUrl }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { source?: string };
    return data.source ?? null;
  }, [channel]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    let player: IVSVideoJsPlayer | null = null;
    let recoveryInProgress = false;
    let liveEdgeTimer: ReturnType<typeof setTimeout> | undefined;
    let statusTimer: ReturnType<typeof setTimeout> | undefined;

    const fallBackToEmbed = (reason: string) => {
      if (disposed) return;
      setPlaybackStatus(`Embed fallback · ${reason}`);
      setUseEmbedFallback(true);
    };
    const loadSource = (source: string) => {
      if (!player || disposed) return;
      // The Amazon IVS Video.js tech expects the playback URL directly.
      // Supplying a Video.js source object can make IVS report ErrorNoSource.
      player.src(source);
      player.load();
      void player.play()?.catch(() => undefined);
    };
    const refreshProxySource = async () => {
      if (!player || disposed || recoveryInProgress) return;
      recoveryInProgress = true;
      setPlaybackStatus("Refreshing Kick source");
      const playbackUrl = await resolvePlaybackUrl();
      if (!playbackUrl) {
        recoveryInProgress = false;
        fallBackToEmbed("stream unavailable");
        return;
      }
      const proxySource = playbackUrl ? await authorizeProxy(playbackUrl) : null;
      if (!proxySource) {
        recoveryInProgress = false;
        fallBackToEmbed("stream unavailable");
        return;
      }
      loadSource(proxySource);
      recoveryInProgress = false;
    };

    const start = async () => {
      setUseEmbedFallback(false);
      setPlaybackStatus("Connecting to Kick");
      const playbackUrl = await resolvePlaybackUrl();
      if (!playbackUrl || disposed) {
        fallBackToEmbed("stream unavailable");
        return;
      }
      const proxySource = await authorizeProxy(playbackUrl);
      if (!proxySource || disposed) {
        fallBackToEmbed("stream unavailable");
        return;
      }
      const [{ default: createVideoJs }, ivs] = await Promise.all([import("video.js"), import("amazon-ivs-player")]);
      if (disposed) return;
      ivs.registerIVSTech(createVideoJs, {
        wasmWorker: "/ivs/amazon-ivs-wasmworker.min.js",
        wasmBinary: "/ivs/amazon-ivs-wasmworker.min.wasm",
      });
      ivs.registerIVSQualityPlugin(createVideoJs);
      const videoElement = document.createElement("video-js");
      videoElement.className = "video-js vjs-big-play-centered vjs-fill";
      container.replaceChildren(videoElement);
      player = createVideoJs(videoElement, {
        autoplay: true, muted: true, controls: true, fill: true, liveui: true,
        playsinline: true, techOrder: ["AmazonIVS"],
      }) as IVSVideoJsPlayer;
      player.enableIVSQualityPlugin();

      const refreshButton = player.getChild("controlBar")?.addChild("button", {}, 1);
      if (refreshButton) {
        const element = refreshButton.el();
        element.classList.add("vjs-kick-refresh-control");
        element.setAttribute("title", "Refresh Kick stream");
        element.setAttribute("aria-label", "Refresh Kick stream");
        element.textContent = "↻";
        refreshButton.on("click", () => void refreshProxySource());
      }
      const ivsPlayer = player.getIVSPlayer();
      const events = player.getIVSEvents();
      ivsPlayer.addEventListener(events.PlayerState.READY, () => {
        if (disposed) return;
        setPlaybackStatus("Kick · low latency");
        if (statusTimer) clearTimeout(statusTimer);
        statusTimer = setTimeout(() => {
          if (!disposed) setPlaybackStatus(null);
        }, 1_500);
        if (liveEdgeTimer) clearTimeout(liveEdgeTimer);
        liveEdgeTimer = setTimeout(() => {
          if (disposed || ivsPlayer.isPaused()) return;
          const buffered = ivsPlayer.getBuffered();
          if (Number.isFinite(buffered.end)) ivsPlayer.seekTo(buffered.end);
        }, 2_500);
      });
      ivsPlayer.addEventListener(events.PlayerEventType.ERROR, () => {
        if (!recoveryInProgress) fallBackToEmbed("playback failed");
      });
      loadSource(proxySource);
    };

    void start().catch(() => {
      fallBackToEmbed("player initialization failed");
    });
    return () => {
      disposed = true;
      if (liveEdgeTimer) clearTimeout(liveEdgeTimer);
      if (statusTimer) clearTimeout(statusTimer);
      if (player && !player.isDisposed()) player.dispose();
      container.replaceChildren();
    };
  }, [authorizeProxy, channel, playerVersion, resolvePlaybackUrl]);

  return <>
    <div ref={containerRef} data-vjs-player className={cn("absolute inset-0 h-full w-full bg-black", useEmbedFallback && "hidden")} />
    {useEmbedFallback && <iframe
      key={`${channel}-${playerVersion ?? 0}`}
      src={`https://player.kick.com/${encodeURIComponent(channel)}?autoplay=true&muted=true`}
      title={`${channel} Kick stream`}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; storage-access"
      allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
      className="absolute inset-0 h-full w-full border-0"
    />}
    {playbackStatus && <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">{playbackStatus}</div>}
  </>;
}

export function PlatformPlayer({ stream, className }: PlatformPlayerProps) {
  return <div className={cn("relative h-full w-full shadow-lg", className)}>
    <div className="h-full w-full overflow-hidden">
      {stream.platform === "kick" ? <KickPlayer stream={stream} /> : <iframe
        key={stream.playerVersion ?? 0} src={getStreamUrl(stream)} allowFullScreen title="Stream Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        frameBorder="0" className="absolute inset-0 h-full w-full" loading="lazy"
      />}
    </div>
  </div>;
}
