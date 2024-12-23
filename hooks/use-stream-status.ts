"use client";

import { useState, useEffect } from 'react';
import { checkStreamStatus } from '@/lib/twitch-api';
import { Stream } from '@/types/stream';

export function useStreamStatus(stream: Stream) {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (stream.platform !== 'twitch') return;

    const checkStatus = async () => {
      const status = await checkStreamStatus(stream.channel);
      setIsLive(status);
    };

    checkStatus();
    
    // Check status every 2 minutes
    const interval = setInterval(checkStatus, 120000);
    
    return () => clearInterval(interval);
  }, [stream.channel, stream.platform]);

  return isLive;
}