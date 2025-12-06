import { NextResponse } from 'next/server';
import crypto from 'crypto';
import * as cookie from 'cookie';

export async function GET() {
    const clientId = process.env.NEXT_PUBLIC_KICK_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_KICK_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return NextResponse.json({ error: 'Missing Kick OAuth configuration' }, { status: 500 });
    }

    // Generate PKCE Verifier and Challenge
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'chat:write user:read'; // Added user:read as usually required for profile info

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state,
    });

    const url = `https://id.kick.com/oauth/authorize?${params.toString()}`;

    const response = NextResponse.redirect(url);

    // Store code_verifier and state in cookies for callback verification
    response.headers.append('Set-Cookie', cookie.serialize('kick_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        path: '/',
        sameSite: 'lax',
    }));

    response.headers.append('Set-Cookie', cookie.serialize('kick_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        path: '/',
        sameSite: 'lax',
    }));

    return response;
}
