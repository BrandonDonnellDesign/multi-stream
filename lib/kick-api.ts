"use client";

export async function checkKickStreamStatus(channelName: string): Promise<boolean> {
  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${channelName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Kick stream status');
    }
    const data = await response.json();
    return data.livestream !== null;
  } catch (error) {
    console.error('Error checking Kick stream status:', error);
    return false;
  }
}