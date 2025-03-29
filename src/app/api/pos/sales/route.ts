// src/app/api/pos/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { userHasPOSPermission } from "@/utils/pos-helpers";
import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";

interface SaleItemInput {
  itemId?: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación con Kinde
    const { isAuthenticated, getUser } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener usuario de Kinde
    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "No se pudo obtener la información del usuario" },
        { status: 401 }
      );
    }

    // Verificar permisos
    const hasPermission = await userHasPOSPermission(user.id);

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    // Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir filtros
    const whereClause: Prisma.SaleWhereInput = {};

    if (search) {
      whereClause.OR = [
        {
          receiptNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ];
    }

    if (status) {
      whereClause.status = status as Prisma.EnumSaleStatusFilter;
    }

    if (paymentMethod) {
      whereClause.paymentMethod =
        paymentMethod as Prisma.EnumPaymentMethodFilter;
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.date = {
        lte: new Date(endDate),
      };
    }

    // Realizar la consulta
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
            },
          },
          items: true,
        },
        orderBy: {
          date: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({
        where: whereClause,
      }),
    ]);

    // Transformar datos para la respuesta
    const transformedSales = sales.map((sale) => ({
      ...sale,
      date: sale.date.toISOString(),
      createdAt: sale.createdAt.toISOString(),
      updatedAt: sale.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      sales: transformedSales,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación con Kinde
    const { isAuthenticated, getUser } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener usuario de Kinde
    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "No se pudo obtener la información del usuario" },
        { status: 401 }
      );
    }

    // Verificar permisos
    const hasPermission = await userHasPOSPermission(user.id);

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    // Obtener datos de la venta
    const data = await request.json();

    // Obtener el cajón de caja abierto actualmente
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
    });

    if (!openDrawer) {
      return NextResponse.json(
        {
          error:
            "No hay caja abierta. Debe abrir una caja para procesar ventas.",
        },
        { status: 400 }
      );
    }

    // Generar número de recibo
    const today = new Date();
    const datePart = today.toISOString().slice(2, 10).replace(/-/g, "");

    // Contar ventas de hoy
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const salesCount = await prisma.sale.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequentialNumber = (salesCount + 1).toString().padStart(4, "0");
    const receiptNumber = `${datePart}-${sequentialNumber}`;

    // Crear la venta y procesar el inventario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la venta
      const sale = await tx.sale.create({
        data: {
          receiptNumber,
          userId: data.userId || null,
          petId: data.petId || null,
          subtotal: data.subtotal,
          tax: data.tax,
          discount: data.discount,
          total: data.total,
          paymentMethod: data.paymentMethod,
          status: "COMPLETED",
          notes: data.notes,
          items: {
            create: data.items.map((item: SaleItemInput) => ({
              itemId: item.itemId,
              serviceId: item.serviceId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              total: item.total,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Actualizar inventario si es un producto
      for (const item of sale.items) {
        if (item.itemId) {
          // Obtener el producto
          const product = await tx.inventoryItem.findUnique({
            where: { id: item.itemId },
          });

          if (product) {
            // Actualizar cantidad en inventario
            await tx.inventoryItem.update({
              where: { id: item.itemId },
              data: {
                quantity: {
                  decrement: item.quantity,
                },
                status:
                  product.quantity - item.quantity <= 0
                    ? "OUT_OF_STOCK"
                    : product.quantity - item.quantity <=
                        (product.minStock || 0)
                      ? "LOW_STOCK"
                      : "ACTIVE",
              },
            });

            // Registrar movimiento de inventario
            await tx.inventoryMovement.create({
              data: {
                itemId: item.itemId,
                type: "OUT",
                quantity: item.quantity,
                reason: "Venta",
                userId: data.userId,
                relatedRecordId: sale.id,
                notes: `Venta #${sale.receiptNumber}`,
              },
            });
          }
        }
      }

      // 3. Registrar transacción de caja
      await tx.cashTransaction.create({
        data: {
          drawerId: openDrawer.id,
          amount: data.total,
          type: "SALE",
          description: `Venta #${sale.receiptNumber}`,
          saleId: sale.id,
        },
      });

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error al crear venta:", error);
    return NextResponse.json(
      { error: "Error al procesar la venta" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
