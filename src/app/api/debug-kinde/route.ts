import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  
  const kindeRelatedCookies = allCookies.filter(cookie => 
    cookie.name.toLowerCase().includes('kinde') || 
    cookie.name.toLowerCase().includes('state') ||
    cookie.name.toLowerCase().includes('auth')
  );

  const debugInfo = {
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    cookies: {
      all: allCookies.length,
      kindeRelated: kindeRelatedCookies,
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      KINDE_SITE_URL: process.env.KINDE_SITE_URL,
      KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
      KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
      KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID?.substring(0, 8) + '...',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    }
  };

  return NextResponse.json(debugInfo, { status: 200 });
} 