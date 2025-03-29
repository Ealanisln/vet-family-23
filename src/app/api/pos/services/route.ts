// src/app/api/pos/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { userHasPOSPermission } from "@/utils/pos-helpers";
import { prisma } from "@/lib/prismaDB";
import { ServiceCategory, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación con Kinde
    const { isAuthenticated, getUser } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario de Kinde
    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "No se pudo obtener la información del usuario" },
        { status: 401 }
      );
    }

    // Verificar si el usuario tiene permisos para el POS
    const hasPermission = await userHasPOSPermission(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "No tiene permisos para acceder al sistema POS" },
        { status: 403 }
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
    const whereClause: Prisma.ServiceWhereInput = {};

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (category) {
      // Verificar que la categoría sea válida (opcional)
      whereClause.category = category as ServiceCategory;
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
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
