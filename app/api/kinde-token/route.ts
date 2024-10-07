import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const kindeDomain = process.env.KINDE_DOMAIN;
    const clientId = process.env.KINDE_M2M_CLIENT_ID;
    const clientSecret = process.env.KINDE_M2M_CLIENT_SECRET;

    if (!kindeDomain || !clientId || !clientSecret) {
      console.error('Missing Kinde environment variables:', { kindeDomain, clientId, clientSecret: clientSecret ? '[REDACTED]' : undefined });
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const tokenUrl = `https://${kindeDomain}/oauth2/token`;
    console.log('Fetching Kinde token from:', tokenUrl);

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${kindeDomain}/api`, // Add the audience parameter
    });

    console.log('Request body:', body.toString());

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    });

    const responseData = await response.text();
    console.log('Kinde API response:', response.status, responseData);

    if (!response.ok) {
      console.error('Kinde token fetch failed:', response.status, responseData);
      return NextResponse.json({ 
        error: 'Failed to fetch token', 
        details: responseData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      }, { status: response.status });
    }

    const data = JSON.parse(responseData);
    console.log('Successfully fetched Kinde token');
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching Kinde token:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}