
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  isLive: boolean;
  className?: string;
}

export function LiveIndicator({ isLive, className }: LiveIndicatorProps) {
  if (!isLive) return null;

  return (
    <div className={cn("flex items-center", className)}>
      <span
        className="text-xs font-semibold uppercase text-white bg-destructive rounded-full px-2 py-1 relative"
      >
        <span className="absolute -inset-0.5 bg-destructive rounded-full animate-[ping_1.5s_ease-in-out_infinite]" />
        <span className="relative">LIVE</span>
      </span>
    </div>
  );
}