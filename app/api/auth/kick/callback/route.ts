import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json({ error }, { status: 400 });
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get('kick_oauth_state')?.value;
    const codeVerifier = cookieStore.get('kick_code_verifier')?.value;

    if (!state || !storedState || state !== storedState) {
        return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    if (!code || !codeVerifier) {
        return NextResponse.json({ error: 'Missing code or code verifier' }, { status: 400 });
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
            console.error("Token exchange failed:", errText);
            return NextResponse.json({ error: 'Failed to exchange token', details: errText }, { status: tokenResponse.status });
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Redirect to the main page with a query param success message
        // We will set a cookie that is NOT httpOnly so the client can read it, OR
        // we can return a page that writes to localStorage.
        // Setting a cookie readable by JS is the easiest way to bridge to our current localStorage-based client code,
        // although simply using the cookie on the client side would be better.
        // Given the existing architecture looks for localStorage item 'kick_oauth_token', let's render a page that sets it.

        const html = `
      <html>
        <body>
          <script>
            localStorage.setItem('kick_oauth_token', '${accessToken}');
            window.location.href = '/multistream?kick_connected=true';
          </script>
          <p>Redirecting...</p>
        </body>
      </html>
    `;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html',
            },
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
