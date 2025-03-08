// src/app/api/pos/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { userHasPOSPermission } from "@/utils/pos-helpers";
import prisma from "@/lib/prismaDB";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    
    // Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    
    // Construir filtros
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (isActive === "true") {
      whereClause.isActive = true;
    } else if (isActive === "false") {
      whereClause.isActive = false;
    }
    
    // Realizar la consulta
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        orderBy: {
          name: "asc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.service.count({
        where: whereClause,
      }),
    ]);
    
    return NextResponse.json({
      services,