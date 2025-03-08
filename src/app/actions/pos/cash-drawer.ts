// src/app/actions/pos/cash-drawer.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismaDB";

export async function openCashDrawer(initialAmount: number) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return { success: false, error: "No autorizado" };
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
    
    // Crear un nuevo cajón de caja
    const drawer = await prisma.cashDrawer.create({
      data: {
        initialAmount,
        openedBy: session.user?.id,
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

export async function closeCashDrawer(data: { 
  finalAmount: number;
  notes?: string;
}) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return { success: false, error: "No autorizado" };
    }
    
    // Buscar la caja abierta
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
      include: {
        transactions: true,
      },
    });
    
    if (!openDrawer) {
      return { success: false, error: "No hay caja abierta para cerrar" };
    }
    
    // Calcular el monto esperado basado en las transacciones
    const totalTransactions = openDrawer.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const expectedAmount = openDrawer.initialAmount + totalTransactions;
    
    // Calcular la diferencia
    const difference = data.finalAmount - expectedAmount;
    
    // Cerrar la caja
    const closedDrawer = await prisma.cashDrawer.update({
      where: { id: openDrawer.id },
      data: {
        closedAt: new Date(),
        closedBy: session.user?.id,
        finalAmount: data.finalAmount,
        expectedAmount,
        difference,
        status: "CLOSED",
        notes: data.notes,
      },
    });
    
    revalidatePath("/admin/pos");
    revalidatePath("/admin/pos/cierre-caja");
    
    return { success: true, drawer: closedDrawer };
  } catch (error) {
    console.error("Error closing cash drawer:", error);
    return { success: false, error: "Error al cerrar la caja" };
  }
}

export async function getCurrentDrawer() {
  try {
    return await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
      include: {
        openUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  } catch (error) {
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
        sale: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching drawer transactions:", error);
    throw error;
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
    const whereClause: any = {};
    
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
          openUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          closeUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
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
  } catch (error) {
    console.error("Error fetching drawer history:", error);
    throw error;
  }
}

export async function addCashTransaction(data: {
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "ADJUSTMENT";
  description: string;
}) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return { success: false, error: "No autorizado" };
    }
    
    // Buscar la caja abierta
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
    });
    
    if (!openDrawer) {
      return { success: false, error: "No hay caja abierta" };
    }
    
    // Crear la transacción
    const transaction = await prisma.cashTransaction.create({
      data: {
        drawerId: openDrawer.id,
        amount: data.amount,
        type: data.type,
        description: data.description,
      },
    });
    
    revalidatePath("/admin/pos");
    revalidatePath("/admin/pos/cierre-caja");
    
    return { success: true, transaction };
  } catch (error) {
    console.error("Error adding cash transaction:", error);
    return { success: false, error: "Error al agregar la transacción" };
  }
}