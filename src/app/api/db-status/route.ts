import { prisma, safePrismaOperation } from '@/lib/prismaDB';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the database connection with safe operation
    const result = await safePrismaOperation(
      () => prisma.$queryRaw`SELECT 1`,
      null // fallback for build time
    );
    
    return NextResponse.json({
      status: result ? 'success' : 'build-time',
      environment: process.env.NODE_ENV,
      buildTime: result === null
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed' },
      { status: 500 }
    );
  }
} 