import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string[] }> }
) {
  console.log(`[KindeAuth] GET request received for path: ${request.nextUrl.pathname}`);
  
  try {
    const resolvedParams = await context.params;
    const resolvedContext = { params: resolvedParams };
    
    console.log(`[KindeAuth] Resolved params:`, resolvedParams);
    console.log(`[KindeAuth] Request URL:`, request.url);
    console.log(`[KindeAuth] Request method:`, request.method);
    
    // Verificar que handleAuth esté disponible
    if (typeof handleAuth !== 'function') {
      console.error(`[KindeAuth] handleAuth is not a function:`, typeof handleAuth);
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
    console.log(`[KindeAuth] Handler created successfully:`, typeof handler);
    
    if (typeof handler !== 'function') {
      console.error(`[KindeAuth] Handler is not a function:`, typeof handler);
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
    console.log(`[KindeAuth] Handler response received:`, {
      status: response?.status,
      statusText: response?.statusText,
      headers: Object.fromEntries(response?.headers?.entries() || [])
    });
    
    if (!response) {
      console.error(`[KindeAuth] Handler returned no response`);
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
    console.error(`[KindeAuth] Error in GET handler:`, error);
    
    // Log additional error details
    if (error instanceof Error) {
      console.error(`[KindeAuth] Error name:`, error.name);
      console.error(`[KindeAuth] Error message:`, error.message);
      console.error(`[KindeAuth] Error stack:`, error.stack);
    }
    
    // Retornar una respuesta de error en lugar de lanzar la excepción
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
  console.log(`[KindeAuth] POST request received for path: ${request.nextUrl.pathname}`);
  
  try {
    const resolvedParams = await context.params;
    const resolvedContext = { params: resolvedParams };
    
    console.log(`[KindeAuth] Resolved params:`, resolvedParams);
    console.log(`[KindeAuth] Request URL:`, request.url);
    console.log(`[KindeAuth] Request method:`, request.method);
    
    // Verificar que handleAuth esté disponible
    if (typeof handleAuth !== 'function') {
      console.error(`[KindeAuth] handleAuth is not a function:`, typeof handleAuth);
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
    console.log(`[KindeAuth] Handler created successfully:`, typeof handler);
    
    if (typeof handler !== 'function') {
      console.error(`[KindeAuth] Handler is not a function:`, typeof handler);
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
    console.log(`[KindeAuth] Handler response received:`, {
      status: response?.status,
      statusText: response?.statusText,
      headers: Object.fromEntries(response?.headers?.entries() || [])
    });
    
    if (!response) {
      console.error(`[KindeAuth] Handler returned no response`);
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
    console.error(`[KindeAuth] Error in POST handler:`, error);
    
    // Log additional error details
    if (error instanceof Error) {
      console.error(`[KindeAuth] Error name:`, error.name);
      console.error(`[KindeAuth] Error message:`, error.message);
      console.error(`[KindeAuth] Error stack:`, error.stack);
    }
    
    // Retornar una respuesta de error en lugar de lanzar la excepción
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