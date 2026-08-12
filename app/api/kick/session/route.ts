import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ connected: Boolean(request.cookies.get('kick_access_token')?.value) });
}

export async function DELETE() {
  const response = NextResponse.json({ connected: false });
  response.cookies.delete('kick_access_token');
  response.cookies.delete('kick_refresh_token');
  return response;
}
