import { NextResponse } from 'next/server';

export async function GET() {
  const envDebug = {
    NODE_ENV: process.env.NODE_ENV,
    IS_BUILD_TIME: process.env.IS_BUILD_TIME,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + '...',
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    runtime: 'server-side',
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(envDebug);
} 