import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string[] }> }
) {
  const resolvedParams = await context.params;
  const resolvedContext = { params: resolvedParams };
  
  try {
    const handler = handleAuth();
    const response = await handler(request, resolvedContext);
    return response;
  } catch (error) {
    console.error(`Error in GET handler:`, error);
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string[] }> }
) {
  const resolvedParams = await context.params;
  const resolvedContext = { params: resolvedParams };
  
  try {
    const handler = handleAuth();
    const response = await handler(request, resolvedContext);
    return response;
  } catch (error) {
    console.error(`Error in POST handler:`, error);
    throw error;
  }
}