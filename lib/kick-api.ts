"use client";

import { handleApiError, fetchWithTimeout } from './api-utils';

export async function checkKickStreamStatus(channelName: string): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      `https://kick.com/api/v2/channels/${channelName}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.livestream !== null;
  } catch (error) {
    handleApiError(error, 'Error checking Kick stream status');
    return false;
  }
}