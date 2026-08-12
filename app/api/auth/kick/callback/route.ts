import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/?kick_error=${encodeURIComponent(error)}`, request.url));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get('kick_oauth_state')?.value;
    const codeVerifier = cookieStore.get('kick_code_verifier')?.value;

    if (!state || !storedState || state !== storedState) {
        return NextResponse.redirect(new URL('/?kick_error=oauth_state_expired', request.url));
    }

    if (!code || !codeVerifier) {
        return NextResponse.redirect(new URL('/?kick_error=oauth_session_expired', request.url));
    }

    const clientId = process.env.NEXT_PUBLIC_KICK_CLIENT_ID;
    const clientSecret = process.env.KICK_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_KICK_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    try {
        const tokenResponse = await fetch('https://id.kick.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier,
                code: code,
            }),
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            return NextResponse.json({ error: 'Failed to exchange token', details: errText }, { status: tokenResponse.status });
        }

        const tokenData = await tokenResponse.json() as {
            access_token: string;
            refresh_token?: string;
            expires_in?: number;
        };
        const response = NextResponse.redirect(new URL('/?kick_connected=true', request.url));
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
        };
        response.cookies.set('kick_access_token', tokenData.access_token, {
            ...cookieOptions,
            maxAge: tokenData.expires_in ?? 3600,
        });
        if (tokenData.refresh_token) {
            response.cookies.set('kick_refresh_token', tokenData.refresh_token, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 30,
            });
        }
        response.cookies.delete('kick_code_verifier');
        response.cookies.delete('kick_oauth_state');
        return response;

    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
