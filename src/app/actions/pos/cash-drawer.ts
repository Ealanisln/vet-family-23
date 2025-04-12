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
    const { getUser } = getKindeServerSession(); // Get user session
    const user = await getUser(); // Get user object

    // Check if user is authenticated
    if (!user || !user.id) {
      console.error("openCashDrawer: User not authenticated.");
      return { success: false, error: "No autorizado", statusCode: 401 };
    }

    // Find the user in your database using the Kinde ID
    const dbUser = await prisma.user.findUnique({
      where: { kindeId: user.id },
      select: { id: true }, // Only select the ID we need
    });

    // Check if user exists in the database
    if (!dbUser) {
      console.error(`openCashDrawer: User with Kinde ID ${user.id} not found in the database.`);
      return { success: false, error: "Usuario no encontrado", statusCode: 404 };
    }

    // Check if there is already an open cash drawer
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
    });
    
    if (openDrawer) {
      return { success: false, error: "Ya hay una caja abierta. Cierre la caja actual antes de abrir una nueva." };
    }
    
    // Create a new cash drawer, now including the openedBy field
    const drawer = await prisma.cashDrawer.create({
      data: {
        id: randomUUID(),
        initialAmount,
        status: "OPEN",
        openedBy: dbUser.id, // Assign the database user ID
      },
    });
    
    revalidatePath("/admin/pos");
    revalidatePath("/admin/pos/apertura-caja");
    
    return { success: true, drawer };
  } catch (error) {
    console.error("Error opening cash drawer:", error);
    // Consider more specific error handling if needed
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
       // Handle known Prisma errors
       console.error("Prisma Error Code:", error.code);
       return { success: false, error: `Error de base de datos: ${error.code}` };
    }
    return { success: false, error: "Error al abrir la caja" };
  }
}

// Reemplaza la función closeCashDrawer en src/app/actions/pos/cash-drawer.ts

export async function closeCashDrawer(data: { 
  finalAmount: number;
  notes?: string;
}) {
  try {
    const { getUser } = getKindeServerSession(); // Keep getUser for closedBy
    
    /*
    // REMOVED - Middleware already handles authentication
    if (!(await isAuthenticated())) {
      console.log("Cierre de caja: Usuario no autorizado");
      return { success: false, error: "No autorizado", statusCode: 401 };
    }
    */

    // Obtener usuario - Assume user exists if action is reached
    const user = await getUser();
    if (!user || !user.id) {
      // This check might still be relevant if getUser can fail even after middleware passes
      // Keep it but log an error if it happens.
      console.error("closeCashDrawer: getUser() returned null/no ID even after middleware auth.");
      return { success: false, error: "No se pudo obtener la información del usuario autenticado.", statusCode: 500 };
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
  // console.log("[getCurrentDrawer] Action started."); // Log removido
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
      // console.log("[getCurrentDrawer] No open drawer found. Returning null."); // Log removido
      return null;
    }

    // console.log(`[getCurrentDrawer] Found open drawer: ${drawer.id}, opened by: ${drawer.openedBy}`); // Log removido

    // If openedBy is null, we cannot fetch the user. Handle this case.
    if (!drawer.openedBy) {
      console.warn(`[getCurrentDrawer] Drawer ${drawer.id} has null openedBy. Returning drawer data without user.`);
      // Return the drawer but let openUser be undefined to match the CashDrawer type.
      const { CashTransaction, ...restOfDrawer } = drawer;
      return {
        ...restOfDrawer, 
        // openUser property is omitted, making it undefined
        transactions: CashTransaction, // Map Prisma transactions if needed, or ensure type compatibility
      };
    }

    // If openedBy has an ID, proceed to fetch the user
    const openUser = await prisma.user.findUnique({
      where: { id: drawer.openedBy }, // Now we know drawer.openedBy is a string
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // If the user is not found, return the drawer without the user info, or handle as an error.
    // Current type requires openUser to be potentially undefined.
    if (!openUser) {
      console.warn(`[getCurrentDrawer] User not found for openedBy ID: ${drawer.openedBy}. Returning drawer data without user.`);
      const { CashTransaction, ...restOfDrawer } = drawer;
       return {
        ...restOfDrawer,
        // openUser property is omitted, making it undefined
        transactions: CashTransaction, 
      };
    }
    
    // User found, map transactions and return the complete object
    const { CashTransaction, ...restOfDrawerData } = drawer;
    return {
      ...restOfDrawerData,
      openUser,
      transactions: CashTransaction, // Ensure this matches the expected Transaction[] type in CashDrawer
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