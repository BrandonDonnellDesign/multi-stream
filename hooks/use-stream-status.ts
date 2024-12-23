"use client";
"use client";

import { useState, useEffect } from 'react';
import { checkStreamStatus } from '@/lib/twitch-api';
import { checkKickStreamStatus } from '@/lib/kick-api';
import { Stream } from '@/types/stream';

export function useStreamStatus(stream: Stream) {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = stream.platform === 'twitch' 
        ? await checkStreamStatus(stream.channel)
        : await checkKickStreamStatus(stream.channel);
      setIsLive(status);
    };

    checkStatus();
    
    // Check status every 2 minutes
    const interval = setInterval(checkStatus, 120000);
    
    return () => clearInterval(interval);
  }, [stream.channel, stream.platform]);

  return isLive;
}