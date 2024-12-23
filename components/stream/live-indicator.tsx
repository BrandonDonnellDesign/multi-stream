"use client";

import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  isLive: boolean;
  className?: string;
}

export function LiveIndicator({ isLive, className }: LiveIndicatorProps) {
  if (!isLive) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-medium text-red-500">LIVE</span>
    </div>
  );
}