// app/api/kinde-token/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodeFetch from "node-fetch"; 

const fetch = global.fetch || nodeFetch;

async function getKindeToken(grantType: string, refreshToken?: string) {


  const kindeDomain = process.env.KINDE_ISSUER_URL


  const clientId = process.env.KINDE_M2M_CLIENT_ID;
  const clientSecret = process.env.KINDE_M2M_CLIENT_SECRET;

  if (!kindeDomain || !clientId || !clientSecret) {

    throw new Error("Server configuration error");
  }

  const tokenUrl = `https://${kindeDomain}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: grantType,
    client_id: clientId,
    client_secret: clientSecret,
    audience: `https://${kindeDomain}/api`,
    ...(grantType === "refresh_token" && { refresh_token: refreshToken }),
  });

  console.log("Requesting token from URL:", tokenUrl);
  console.log("Request body (sanitized):", body.toString().replace(clientSecret, '[REDACTED]'));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Kinde token fetch failed:", response.status, errorData);
      throw new Error(`Failed to fetch token: ${response.status} ${errorData}`);
    }

    return response.json();
  } catch (error: unknown) {
    console.error("Error fetching Kinde token:", error);
    console.error("Detailed error information:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      errorString: String(error)
    });

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw new Error(`Kinde token fetch error: ${error.message}`);
    }
    // If it's not an Error object, throw a generic error
    throw new Error('An unknown error occurred while fetching the Kinde token');
  }
}

export async function GET() {
  try {
    const data = await getKindeToken("client_credentials");
    return NextResponse.json(data);
  } catch (error: unknown) {

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const { grant_type, refresh_token } = await req.json();
    const data = await getKindeToken(grant_type, refresh_token);
    return NextResponse.json(data);
  } catch (error: unknown) {

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}