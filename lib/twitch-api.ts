
// Cache token in memory
let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Twitch API credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Twitch access token:', error);
    return null;
  }
}

export async function checkStreamStatus(channelName: string): Promise<boolean> {
  const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  
  if (!clientId) {
    console.error('Twitch client ID not configured');
    return false;
  }

  try {
    const token = await getAccessToken();
    if (!token) return false;

    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${channelName}`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.length > 0;
  } catch (error) {
    console.error('Error checking stream status:', error);
    return false;
  }
}