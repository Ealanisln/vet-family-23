// app/api/kinde-token/route.ts

import { NextRequest, NextResponse } from "next/server";

async function getKindeToken(grantType: string, refreshToken?: string) {
  const kindeDomain = process.env.KINDE_DOMAIN;
  const clientId = process.env.KINDE_M2M_CLIENT_ID;
  const clientSecret = process.env.KINDE_M2M_CLIENT_SECRET;

  if (!kindeDomain || !clientId || !clientSecret) {
    console.error("Missing Kinde environment variables");
    throw new Error("Server configuration error");
  }

  const tokenUrl = `https://${kindeDomain}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: grantType,
    client_id: clientId,
    client_secret: clientSecret,
    audience: `https://${kindeDomain}/api`, // Add the audience parameter
    ...(grantType === "refresh_token" && { refresh_token: refreshToken }),
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Kinde token fetch failed:", response.status, errorData);
    throw new Error(`Failed to fetch token: ${response.status} ${errorData}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const data = await getKindeToken("client_credentials");
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error in Kinde token GET route:", error);
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
    console.error("Error in Kinde token POST route:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
