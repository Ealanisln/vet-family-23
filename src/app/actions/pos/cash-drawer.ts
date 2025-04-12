// src/app/actions/pos/cash-drawer.ts
"use server";

import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Prisma } from '@prisma/client';
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prismaDB";

// Definición de tipos para las transacciones
type TransactionType = "SALE" | "REFUND" | "DEPOSIT" | "WITHDRAWAL" | "ADJUSTMENT";

// Función auxiliar para verificar errores de Prisma
function isPrismaError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

// Custom error class
class ServerActionError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ServerActionError";
  }
}

export async function openCashDrawer(initialAmount: number) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    // Verificar autenticación
    if (!(await isAuthenticated())) {
      return { success: false, error: "No autorizado" };
    }
    
    // Obtener usuario de Kinde
    const kindeUser = await getUser();
    if (!kindeUser || !kindeUser.id) {
      return { success: false, error: "No se pudo obtener la información del usuario" };
    }
    
    // Buscar o crear el usuario en la base de datos local
    let dbUser = await prisma.user.findFirst({
      where: {
        kindeId: kindeUser.id
      }
    });
    
    // Si el usuario no existe en la base de datos, crearlo
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          kindeId: kindeUser.id,
          firstName: kindeUser.given_name || "",
          lastName: kindeUser.family_name || "",
          email: kindeUser.email || "",
          name: (kindeUser.given_name || "") + " " + (kindeUser.family_name || "")
        }
      });
    }
    
    // Verificar si ya hay una caja abierta
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
    });
    
    if (openDrawer) {
      return { success: false, error: "Ya hay una caja abierta. Cierre la caja actual antes de abrir una nueva." };
    }
    
    // Crear un nuevo cajón de caja usando el ID del usuario en la base de datos local
    const drawer = await prisma.cashDrawer.create({
      data: {
        id: randomUUID(),
        initialAmount,
        openedBy: dbUser.id, // Usar el ID de la base de datos local
        status: "OPEN",
      },
    });
    
    revalidatePath("/admin/pos");
    revalidatePath("/admin/pos/apertura-caja");
    
    return { success: true, drawer };
  } catch (error) {
    console.error("Error opening cash drawer:", error);
    return { success: false, error: "Error al abrir la caja" };
  }
}

// Reemplaza la función closeCashDrawer en src/app/actions/pos/cash-drawer.ts

export async function closeCashDrawer(data: { 
  finalAmount: number;
  notes?: string;
}) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    // Verificar autenticación
    if (!(await isAuthenticated())) {
      console.log("Cierre de caja: Usuario no autorizado");
      return { success: false, error: "No autorizado", statusCode: 401 };
    }
    
    // Obtener usuario
    const user = await getUser();
    if (!user || !user.id) {
      console.log("Cierre de caja: No se pudo obtener información del usuario");
      return { success: false, error: "No se pudo obtener la información del usuario", statusCode: 401 };
    }
    
    console.log(`Cierre de caja: Usuario autenticado (${user.id})`);
    
    // Buscar al usuario en la base de datos
    const dbUser = await prisma.user.findFirst({
      where: {
        kindeId: user.id
      }
    });
    
    if (!dbUser) {
      console.log("Cierre de caja: Usuario no encontrado en la base de datos");
      return { success: false, error: "Usuario no encontrado en la base de datos", statusCode: 404 };
    }
    
    console.log(`Cierre de caja: Usuario encontrado en la base de datos (${dbUser.id})`);
    
    // Buscar la caja abierta
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
      include: {
        User_CashDrawer_openedByToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        User_CashDrawer_closedByToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        CashTransaction: true,
      },
    });
    
    if (!openDrawer) {
      console.log("Cierre de caja: No hay caja abierta para cerrar");
      return { success: false, error: "No hay caja abierta para cerrar", statusCode: 404 };
    }
    
    console.log(`Cierre de caja: Caja encontrada (${openDrawer.id})`);
    
    // Calcular el monto esperado basado en las transacciones
    const totalTransactions = openDrawer.CashTransaction.reduce((sum, tx) => sum + tx.amount, 0);
    const expectedAmount = openDrawer.initialAmount + totalTransactions;
    
    // Calcular la diferencia
    const difference = data.finalAmount - expectedAmount;
    
    console.log(`Cierre de caja: Montos calculados - Inicial: ${openDrawer.initialAmount}, Transacciones: ${totalTransactions}, Esperado: ${expectedAmount}, Final: ${data.finalAmount}, Diferencia: ${difference}`);
    
    // Cerrar la caja
    const closedDrawer = await prisma.cashDrawer.update({
      where: { id: openDrawer.id },
      data: {
        closedAt: new Date(),
        closedBy: dbUser.id,
        finalAmount: data.finalAmount,
        expectedAmount,
        difference,
        status: "CLOSED",
        notes: data.notes,
      },
    });
    
    console.log(`Cierre de caja: Caja cerrada correctamente (${closedDrawer.id}, ${closedDrawer.status})`);
    
    revalidatePath("/admin/pos");
    revalidatePath("/admin/pos/cierre-caja");
    
    return { success: true, drawer: closedDrawer };
  } catch (error: unknown) {
    console.error("Error al cerrar la caja (detallado):", error);
    
    if (error instanceof ServerActionError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    
    if (isPrismaError(error)) {
      console.error("Prisma error code:", error.code);
      if (error.code === "P2025") {
        return { success: false, error: "Caja no encontrada", statusCode: 404 };
      }
    }
    
    return { success: false, error: "Error al cerrar la caja", statusCode: 500 };
  }
}

export async function getCurrentDrawer() {
  console.log("[getCurrentDrawer] Action started."); // Log start
  try {
    const drawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
      include: {
        CashTransaction: true,
      },
    });

    if (!drawer) {
      console.log("[getCurrentDrawer] No open drawer found. Returning null."); // Log null return
      return null;
    }

    console.log(`[getCurrentDrawer] Found open drawer: ${drawer.id}, opened by: ${drawer.openedBy}`); // Log found drawer

    // Siempre buscar el usuario que abrió la caja
    const openUser = await prisma.user.findUnique({
      where: { id: drawer.openedBy },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Si no se encuentra el usuario, retornar null
    if (!openUser) {
      console.log(`[getCurrentDrawer] User not found for openedBy ID: ${drawer.openedBy}. Returning null.`); // Log null return
      return null;
    }

    console.log(`[getCurrentDrawer] Found user: ${openUser.id}. Returning drawer data.`); // Log success return
    return {
      ...drawer,
      openUser,
      transactions: drawer.CashTransaction,
    };
  } catch (error: unknown) {
    console.error("Error fetching current drawer:", error);
    return null;
  }
}

export async function getDrawerTransactions(drawerId: string) {
  try {
    return await prisma.cashTransaction.findMany({
      where: {
        drawerId,
      },
      include: {
        Sale: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching drawer transactions:", error);
    throw new ServerActionError("Failed to fetch drawer transactions");
  }
}

export async function getDrawerHistory({ 
  page = 1, 
  limit = 10, 
  startDate, 
  endDate 
}: { 
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const whereClause: {
      openedAt?: {
        gte?: Date;
        lte?: Date;
      }
    } = {};
    
    if (startDate && endDate) {
      whereClause.openedAt = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      whereClause.openedAt = {
        gte: startDate,
      };
    } else if (endDate) {
      whereClause.openedAt = {
        lte: endDate,
      };
    }
    
    const [drawers, total] = await Promise.all([
      prisma.cashDrawer.findMany({
        where: whereClause,
        include: {
          User_CashDrawer_openedByToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          User_CashDrawer_closedByToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          CashTransaction: true,
        },
        orderBy: {
          openedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cashDrawer.count({
        where: whereClause,
      }),
    ]);
    
    return {
      drawers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching drawer history:", error);
    throw new ServerActionError("Failed to fetch drawer history");
  }
}

export async function addCashTransaction(data: {
  amount: number;
  type: TransactionType;
  description: string;
}) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    // Verificar autenticación
    if (!(await isAuthenticated())) {
      throw new ServerActionError("No autorizado", 401);
    }
    
    // Obtener usuario
    const user = await getUser();
    if (!user || !user.id) {
      throw new ServerActionError("No se pudo obtener la información del usuario", 401);
    }
    
    // Buscar la caja abierta
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
    });
    
    if (!openDrawer) {
      throw new ServerActionError("No hay caja abierta", 404);
    }
    
    // Crear la transacción
    const transaction = await prisma.cashTransaction.create({
      data: {
        id: randomUUID(),
        drawerId: openDrawer.id,
        amount: data.amount,
        type: data.type,
        description: data.description,
      },
    });
    
    revalidatePath("/admin/pos");
    revalidatePath("/admin/pos/cierre-caja");
    
    return { success: true, transaction };
  } catch (error: unknown) {
    if (error instanceof ServerActionError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return { success: false, error: "Caja o referencia no encontrada", statusCode: 404 };
      }
    }
    console.error("Error adding cash transaction:", error);
    return { success: false, error: "Error al agregar la transacción", statusCode: 500 };
  }
}