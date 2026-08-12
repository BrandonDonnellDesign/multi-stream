import { NextRequest, NextResponse } from 'next/server';

type TokenPayload = { access_token: string; refresh_token?: string; expires_in?: number };

async function refreshAccessToken(refreshToken: string): Promise<TokenPayload | null> {
  const clientId = process.env.NEXT_PUBLIC_KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const response = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken }),
  });
  return response.ok ? response.json() : null;
}

async function postMessage(token: string, broadcasterUserId: number, content: string) {
  return fetch('https://api.kick.com/public/v1/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ broadcaster_user_id: broadcasterUserId, content, type: 'user' }),
  });
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('kick_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Connect your Kick account in Settings first.' }, { status: 401 });
  const body = await request.json().catch(() => null) as { channel?: string; content?: string } | null;
  const channel = body?.channel?.trim();
  const content = body?.content?.trim();
  if (!channel || !content || content.length > 500) return NextResponse.json({ error: 'A channel and message of up to 500 characters are required.' }, { status: 400 });

  const channelResponse = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`, { cache: 'no-store' });
  if (!channelResponse.ok) return NextResponse.json({ error: 'Could not find that Kick channel.' }, { status: 404 });
  const channelData = await channelResponse.json() as { user_id?: number };
  if (!channelData.user_id) return NextResponse.json({ error: 'Kick did not return a broadcaster ID for this channel.' }, { status: 502 });

  let token = accessToken;
  let kickResponse = await postMessage(token, channelData.user_id, content);
  let refreshed: TokenPayload | null = null;
  if (kickResponse.status === 401) {
    const refreshToken = request.cookies.get('kick_refresh_token')?.value;
    if (refreshToken) refreshed = await refreshAccessToken(refreshToken);
    if (refreshed) {
      token = refreshed.access_token;
      kickResponse = await postMessage(token, channelData.user_id, content);
    }
  }
  if (!kickResponse.ok) {
    const failure = await kickResponse.json().catch(() => null) as { message?: string } | null;
    return NextResponse.json({ error: failure?.message ?? `Kick rejected the message (${kickResponse.status}).` }, { status: kickResponse.status });
  }
  const response = NextResponse.json(await kickResponse.json());
  if (refreshed) {
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
    response.cookies.set('kick_access_token', refreshed.access_token, { ...options, maxAge: refreshed.expires_in ?? 3600 });
    if (refreshed.refresh_token) response.cookies.set('kick_refresh_token', refreshed.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 });
  }
  return response;
}
