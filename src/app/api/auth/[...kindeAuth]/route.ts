import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string[] }> }
) {
  try {
    const resolvedParams = await context.params;
    const resolvedContext = { params: resolvedParams };

    if (typeof handleAuth !== 'function') {
      console.error('[KindeAuth] handleAuth is not a function:', typeof handleAuth);
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'handleAuth function is not available',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const handler = handleAuth();

    if (typeof handler !== 'function') {
      console.error('[KindeAuth] Handler is not a function:', typeof handler);
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'Handler is not a function',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const response = await handler(request, resolvedContext);

    if (!response) {
      console.error('[KindeAuth] Handler returned no response');
      return NextResponse.json(
        {
          error: 'Authentication error',
          message: 'No response from authentication handler',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    return response;
  } catch (error) {
    console.error('[KindeAuth] Error in GET handler:', error);

    if (error instanceof Error) {
      console.error('[KindeAuth] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      {
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        path: request.nextUrl.pathname,
        method: request.method
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string[] }> }
) {
  try {
    const resolvedParams = await context.params;
    const resolvedContext = { params: resolvedParams };

    if (typeof handleAuth !== 'function') {
      console.error('[KindeAuth] handleAuth is not a function:', typeof handleAuth);
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'handleAuth function is not available',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const handler = handleAuth();

    if (typeof handler !== 'function') {
      console.error('[KindeAuth] Handler is not a function:', typeof handler);
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'Handler is not a function',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const response = await handler(request, resolvedContext);

    if (!response) {
      console.error('[KindeAuth] Handler returned no response');
      return NextResponse.json(
        {
          error: 'Authentication error',
          message: 'No response from authentication handler',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    return response;
  } catch (error) {
    console.error('[KindeAuth] Error in POST handler:', error);

    if (error instanceof Error) {
      console.error('[KindeAuth] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      {
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        path: request.nextUrl.pathname,
        method: request.method
      },
      { status: 500 }
    );
  }
}