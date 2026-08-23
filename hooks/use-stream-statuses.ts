"use client";

import { useEffect, useMemo, useState } from "react";
import { Stream } from "@/types/stream";

type StatusMap = Record<string, boolean | undefined>;

export function useStreamStatuses(streams: Stream[]) {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const requestStreams = useMemo(
    () => streams.map(({ id, platform, channel }) => ({ id, platform, channel })),
    [streams],
  );
  const requestKey = JSON.stringify(requestStreams);

  useEffect(() => {
    let cancelled = false;

    const checkStatuses = async () => {
      if (requestStreams.length === 0) return;
      try {
        const response = await fetch("/api/streams/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streams: requestStreams }),
        });
        if (!response.ok) return;
        const payload = await response.json() as {
          statuses: Array<{ id: string; isLive: boolean | null }>;
        };
        if (cancelled) return;
        setStatuses((previous) => {
          const next = { ...previous };
          for (const status of payload.statuses) {
            if (status.isLive !== null) next[status.id] = status.isLive;
          }
          return next;
        });
      } catch {
        // Preserve the last known result during transient network failures.
      }
    };

    void checkStatuses();
    const interval = window.setInterval(checkStatuses, 120_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  // requestKey is a stable serialization of the fields used by the request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  return statuses;
}
