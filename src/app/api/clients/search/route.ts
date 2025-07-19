import { prisma } from "@/lib/prismaDB";
import { NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse, logError } from "@/lib/error-handling";

export const dynamic = 'force-dynamic'



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      const errorResponse = createErrorResponse("El parámetro de búsqueda es requerido");
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Sanitize query to prevent potential issues
    const sanitizedQuery = query.trim();
    
    if (sanitizedQuery.length < 2) {
      const errorResponse = createErrorResponse("La búsqueda debe tener al menos 2 caracteres");
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const clients = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: sanitizedQuery, mode: "insensitive" } },
          { lastName: { contains: sanitizedQuery, mode: "insensitive" } },
          { email: { contains: sanitizedQuery, mode: "insensitive" } },
          { phone: { contains: sanitizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
      take: 10,
    });

    const successResponse = createSuccessResponse({ clients, total: clients.length });
    return NextResponse.json(successResponse);
  } catch (error) {
    logError(error, "client-search", { query: request.url });
    const errorResponse = createErrorResponse("Error al buscar clientes");
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 