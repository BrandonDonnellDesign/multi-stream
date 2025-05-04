// lib/youtube-api.ts

export interface VideoInfo {
  title: string;
  live: boolean;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  // Placeholder for actual YouTube API interaction
  // Replace this with actual API call logic
  return {
    title: `Video Title for ${videoId}`,
    live: false,
  };
}