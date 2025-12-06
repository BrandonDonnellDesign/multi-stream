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

export async function getKickChannelInfo(channelName: string) {
  try {
    const response = await fetchWithTimeout(
      `https://kick.com/api/v2/channels/${channelName}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    handleApiError(error, 'Error fetching Kick channel info');
    throw error;
  }
}

export async function sendKickMessage(broadcasterUserId: string | number, content: string, token: string) {
  try {
    const response = await fetch('https://api.kick.com/public/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        broadcaster_user_id: typeof broadcasterUserId === 'string' ? parseInt(broadcasterUserId) : broadcasterUserId,
        content: content,
        type: 'user'
      })
    });

    if (!response.ok) {
      // Attempt to parse error message but fallback to status text
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send Kick message:', error);
    throw error;
  }
}