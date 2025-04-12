import { prisma } from '@/lib/prismaDB';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'success',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed' },
      { status: 500 }
    );
  }
} 