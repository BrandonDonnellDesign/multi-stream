"use client";

import { useCallback } from "react";
import { Stream } from "@/types/stream";

export function useAudioControl() {
  const handleFullscreenAudio = useCallback((streamId: string, streams: Stream[]) => {
    // Get all stream iframes
    const iframes = document.querySelectorAll('iframe');
    
    iframes.forEach(iframe => {
      // Extract stream ID from iframe's parent element's data attribute
      const parentStreamId = iframe.closest('[data-stream-id]')?.getAttribute('data-stream-id');
      
      if (parentStreamId) {
        // Set volume based on whether this is the active stream
        const volume = parentStreamId === streamId ? '1' : '0';
        
        // Post message to iframe to control volume
        iframe.contentWindow?.postMessage({
          func: 'setVolume',
          args: volume
        }, '*');
      }
    });
  }, []);

  return {
    handleFullscreenAudio
  };
}