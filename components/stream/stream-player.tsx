import { Stream } from "@/types/stream";
import { getStreamUrl } from "@/lib/stream-utils";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { KickHlsPlayer } from "./kick-hls-player";

interface StreamPlayerProps {
  stream: Stream;
}

export function StreamPlayer({ stream }: StreamPlayerProps) {
  const streamUrl = getStreamUrl(stream);
  const [experimentalKickPlayer, setExperimentalKickPlayer] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setExperimentalKickPlayer(localStorage.getItem("experimental-kick-hls") === "true");
      setFallbackReason(null);
    };
    update();
    window.addEventListener("kick-player-setting", update);
    return () => window.removeEventListener("kick-player-setting", update);
  }, []);

  const useFallback = useCallback((reason: string) => setFallbackReason(reason), []);

  if (stream.platform === "kick" && experimentalKickPlayer && !fallbackReason) {
    return <KickHlsPlayer channel={stream.channel} onFallback={useFallback} />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-black shadow-md">
      <iframe
        key={stream.playerVersion ?? 0}
        src={streamUrl}
        title={`${stream.channel} ${stream.platform} stream`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        frameBorder="0"
        allowFullScreen
        scrolling="no"
        className={cn(
          "absolute inset-0 w-full h-full"
        )}
      />
      {stream.platform === "kick" && experimentalKickPlayer && fallbackReason && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[80%] rounded-lg border border-amber-300/20 bg-black/85 px-3 py-2 text-[10px] leading-relaxed text-amber-100 shadow-lg backdrop-blur">
          <span className="block font-semibold">Experimental HLS unavailable · Official player</span>
          <span className="mt-0.5 block text-white/60">{fallbackReason}</span>
        </div>
      )}
    </div>
  );
}
