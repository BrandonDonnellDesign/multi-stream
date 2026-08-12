"use client";

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KickHlsPlayerProps {
  channel: string;
  onFallback: (reason: string) => void;
}

interface QualityLevel {
  index: number;
  label: string;
}

export function KickHlsPlayer({ channel, onFallback }: KickHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const networkRetries = useRef(0);
  const mediaRetries = useRef(0);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [quality, setQuality] = useState("auto");
  const [notice, setNotice] = useState("Loading experimental player…");

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const response = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`);
        if (!response.ok) throw new Error(`Channel request failed (${response.status})`);
        const data = await response.json() as { playback_url?: string; livestream?: unknown };
        if (!data.livestream || !data.playback_url) throw new Error("Kick reports this channel offline; HLS is available only while live");
        if (cancelled || !videoRef.current) return;

        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 30 });
          hlsRef.current = hls;
          const proxyUrl = `/api/kick/hls?url=${encodeURIComponent(data.playback_url)}`;
          hls.loadSource(proxyUrl);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, (_, manifest) => {
            const unique = manifest.levels.map((level, index) => ({
              index,
              label: level.height ? `${level.height}p${level.frameRate ? ` ${Math.round(level.frameRate)}fps` : ""}` : `${Math.round(level.bitrate / 1000)} kbps`,
            }));
            setQualities(unique);
            setNotice("");
            videoRef.current?.play().catch(() => undefined);
          });
          hls.on(Hls.Events.ERROR, (_, error) => {
            if (!error.fatal) return;
            if (error.type === Hls.ErrorTypes.NETWORK_ERROR && networkRetries.current < 3) {
              networkRetries.current += 1;
              setNotice(`Retrying Kick media… (${networkRetries.current}/3)`);
              window.setTimeout(() => hls.startLoad(), 600 * networkRetries.current);
              return;
            }
            if (error.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetries.current < 2) {
              mediaRetries.current += 1;
              setNotice(`Recovering video decoder… (${mediaRetries.current}/2)`);
              hls.recoverMediaError();
              return;
            }
            const responseDetail = error.response?.text?.trim();
            onFallback(`HLS ${error.type}: ${error.details}${error.response?.code ? ` (${error.response.code})` : ""}${responseDetail ? ` — ${responseDetail.slice(0, 160)}` : ""}`);
          });
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = `/api/kick/hls?url=${encodeURIComponent(data.playback_url)}`;
          setNotice("Native HLS · quality managed by browser");
        } else {
          onFallback("This browser does not support HLS playback");
        }
      } catch (error) {
        onFallback(error instanceof Error ? error.message : "Kick blocked direct playback");
      }
    };
    start();
    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [channel, onFallback]);

  const selectQuality = (value: string) => {
    setQuality(value);
    if (hlsRef.current) hlsRef.current.currentLevel = value === "auto" ? -1 : Number(value);
  };

  return (
    <div className="relative h-full w-full bg-black">
      <video ref={videoRef} controls playsInline className="h-full w-full" />
      {qualities.length > 0 && <div className="absolute right-3 top-3 z-10"><Select value={quality} onValueChange={selectQuality}><SelectTrigger className="h-8 w-32 border-white/15 bg-black/75 text-xs text-white backdrop-blur"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="auto">Auto</SelectItem>{qualities.map((item) => <SelectItem key={item.index} value={String(item.index)}>{item.label}</SelectItem>)}</SelectContent></Select></div>}
      {notice && <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-black/70 px-2.5 py-1.5 text-[11px] text-white/70"><AlertTriangle className="h-3 w-3" />{notice}</div>}
    </div>
  );
}
