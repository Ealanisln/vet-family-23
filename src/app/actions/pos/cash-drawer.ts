// src/app/actions/pos/cash-drawer.ts
"use server";

import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Prisma } from '@prisma/client';
import type { CashDrawer, Transaction } from '@/types/pos';
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prismaDB";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// Define state types using the custom CashDrawer
export type OpenDrawerState = {
  success?: boolean;
  error?: string | null;
  drawer?: CashDrawer | null; // Use custom type
  statusCode?: number | null;
};

export type CloseDrawerState = {
  success?: boolean;
  error?: string | null;
  drawer?: CashDrawer | null; // Use custom type
  statusCode?: number | null;
};

// Helper function to format Prisma drawer data to custom type

// Correctly define the type based on Prisma Client's generated types for includes
// Using any type due to Prisma type generation issues
type PrismaDrawerWithRelations = any;

function formatDrawerForClient(
  // Type the input correctly using the payload type
  prismaDrawer: PrismaDrawerWithRelations | null 
): CashDrawer | null { 
  if (!prismaDrawer) return null;

  // Access included relations directly as they are now part of the type
  return {
    id: prismaDrawer.id,
    initialAmount: prismaDrawer.initialAmount,
    openedAt: prismaDrawer.openedAt,
    closedAt: prismaDrawer.closedAt,
    openedBy: prismaDrawer.openedBy,
    closedBy: prismaDrawer.closedBy,
    finalAmount: prismaDrawer.finalAmount,
    expectedAmount: prismaDrawer.expectedAmount,
    difference: prismaDrawer.difference,
    status: prismaDrawer.status,
    notes: prismaDrawer.notes,
    // Access prismaDrawer.CashTransaction directly
    transactions: prismaDrawer.CashTransaction.map((tx): Transaction => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      createdAt: tx.createdAt,
      saleId: tx.saleId,
    })),
     // Access prismaDrawer.User_CashDrawer_openedByToUser directly
    openUser: prismaDrawer.User_CashDrawer_openedByToUser
      ? { 
          id: prismaDrawer.User_CashDrawer_openedByToUser.id,
          firstName: prismaDrawer.User_CashDrawer_openedByToUser.firstName,
          lastName: prismaDrawer.User_CashDrawer_openedByToUser.lastName,
          email: prismaDrawer.User_CashDrawer_openedByToUser.email,
        }
      : undefined,
    // closeUser mapping remains commented out unless needed
  };
}

/**
 * Abre una nueva caja registrando el monto inicial.
 * @param formData FormData con el campo initialAmount
 * @returns Resultado de la operación
 */
export async function openCashDrawer(
  prevState: OpenDrawerState,
  formData: FormData
): Promise<OpenDrawerState> {
  const initialAmountRaw = formData.get("initialAmount");
  const initialAmount = typeof initialAmountRaw === "string" && initialAmountRaw.trim() !== '' ? parseFloat(initialAmountRaw) : NaN;

  // Validación con Zod
  const schema = z.object({ initialAmount: z.number().positive("El monto inicial debe ser un número positivo.") });
  const parse = schema.safeParse({ initialAmount });

  if (!parse.success) {
    const errorMessage = parse.error.errors.map(e => e.message).join(', ');
    return { success: false, error: errorMessage, drawer: null, statusCode: 400 };
  }

  const validatedInitialAmount = parse.data.initialAmount;

  console.log("[openCashDrawer] Action started. Initial Amount:", validatedInitialAmount);
  try {
    console.log("[openCashDrawer] Getting Kinde session...");
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    // Utilizar la nueva utilidad de autenticación
    const dbUser = await getAuthenticatedUser(getUser, isAuthenticated);
    
    if (!dbUser) {
      console.error("[openCashDrawer] No se pudo obtener un usuario autenticado");
      return { success: false, error: "No se pudo identificar al usuario", statusCode: 401, drawer: null };
    }
    
    console.log(`[openCashDrawer] User found in database:`, dbUser);

    // Check if there is already an open cash drawer
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
    });
    
    if (openDrawer) {
      return { success: false, error: "Ya hay una caja abierta. Cierre la caja actual antes de abrir una nueva.", drawer: null, statusCode: 409 };
    }
    
    // Create a new cash drawer, now including the openedBy field
    const drawer = await prisma.cashDrawer.create({
      data: {
        id: randomUUID(),
        initialAmount: validatedInitialAmount,
        status: "OPEN",
        openedBy: dbUser.id,
      },
    });
    
    // Refetch with relations to format
    const fullDrawerData = await prisma.cashDrawer.findUniqueOrThrow({
        where: { id: drawer.id },
        include: {
            CashTransaction: true,
            User_CashDrawer_openedByToUser: { select: { id: true, firstName: true, lastName: true, email: true }},
            User_CashDrawer_closedByToUser: { select: { id: true, firstName: true, lastName: true, email: true }} // Include if needed for formatting
        }
    });

    revalidatePath("/admin/pos");
    revalidatePath("/admin/pos/apertura-caja");
    
    // Return formatted drawer
    return { success: true, drawer: formatDrawerForClient(fullDrawerData), error: null, statusCode: 201 };
  } catch (error) {
    console.error("Error opening cash drawer:", error);
    let errorMessage = "Error interno del servidor al abrir la caja";
    let statusCode = 500;
    if (error && typeof error === 'object' && 'code' in error) {
       const prismaError = error as { code: string };
       console.error("Prisma Error Code:", prismaError.code);
       errorMessage = `Error de base de datos: ${prismaError.code}`;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage, drawer: null, statusCode: statusCode };
  }
}

// Define the input type for the simplified closeCashDrawer action
interface CloseDrawerInput {
  finalAmount: number;
  notes?: string;
}

// Adjust closeCashDrawer to accept a single argument object
export async function closeCashDrawer(
  input: CloseDrawerInput // Single argument
): Promise<CloseDrawerState> { // Still returns the state object
  
  // Validation can use the input object directly
  const schema = z.object({
    finalAmount: z.number().nonnegative("El monto final no puede ser negativo."),
    notes: z.string().optional(),
  });

  // Validate the input object
  const parse = schema.safeParse(input);
  if (!parse.success) {
    const errorMessage = parse.error.errors.map(e => e.message).join(', ');
    // Return the CloseDrawerState structure on validation error
    return { success: false, error: errorMessage, drawer: null, statusCode: 400 }; 
  }

  // Use validated data
  const { finalAmount, notes } = parse.data; 

  console.log(`[closeCashDrawer] Action started. Final Amount: ${finalAmount}, Notes: ${notes || 'N/A'}`);

  try {
    console.log(`[closeCashDrawer] Starting close drawer process with final amount: ${finalAmount}`);
    
    // Verificar autenticación
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    // Utilizar la nueva utilidad de autenticación
    const dbUser = await getAuthenticatedUser(getUser, isAuthenticated);
    
    if (!dbUser) {
      console.error("[closeCashDrawer] No se pudo obtener un usuario autenticado");
      return { success: false, error: "No se pudo identificar al usuario", statusCode: 401, drawer: null };
    }
    
    console.log(`[closeCashDrawer] Database user ID found: ${dbUser.id}`);
    
    // Buscar la caja abierta
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
      include: {
        CashTransaction: true, // Need transactions for calculation
      },
    });
    
    if (!openDrawer) {
      console.log("[closeCashDrawer] No open drawer found to close.");
       // Return the CloseDrawerState structure
      return { success: false, error: "No hay caja abierta para cerrar", statusCode: 404, drawer: null };
    }
    
    console.log(`[closeCashDrawer] Found open drawer ID: ${openDrawer.id}`);
    
    // Calcular el monto esperado basado en las transacciones
    const totalTransactions = openDrawer.CashTransaction.reduce((sum, tx) => sum + tx.amount, 0);
    const expectedAmount = openDrawer.initialAmount + totalTransactions;
    
    // Calcular la diferencia
    const difference = finalAmount - expectedAmount;
    
    console.log(`[closeCashDrawer] Calculation - Initial: ${openDrawer.initialAmount}, Transactions Total: ${totalTransactions}, Expected: ${expectedAmount}, Final Reported: ${finalAmount}, Difference: ${difference}`);
    
    // Update and include relations in the result
    const closedDrawerData = await prisma.cashDrawer.update({
      where: { id: openDrawer.id },
      data: {
        closedAt: new Date(),
        closedBy: dbUser.id,
        finalAmount: finalAmount,
        expectedAmount,
        difference,
        status: "CLOSED",
        notes: notes,
      },
      include: { // Include relations in the update return
          CashTransaction: true,
          User_CashDrawer_openedByToUser: { select: { id: true, firstName: true, lastName: true, email: true }},
          User_CashDrawer_closedByToUser: { select: { id: true, firstName: true, lastName: true, email: true }}
      }
    });

    revalidatePath("/admin/pos");
    revalidatePath("/admin/pos/cierre-caja");

    // Return formatted drawer using the helper
    return { success: true, drawer: formatDrawerForClient(closedDrawerData), error: null, statusCode: 200 };

  } catch (error) {
    console.error("Error closing cash drawer:", error);
    let errorMessage = "Error interno del servidor al cerrar la caja";
    let statusCode = 500;
    if (error && typeof error === 'object' && 'code' in error) {
       const prismaError = error as { code: string };
       console.error("Prisma Error Code:", prismaError.code);
       errorMessage = `Error de base de datos al cerrar la caja: ${prismaError.code}`;
       if (prismaError.code === 'P2025') {
           errorMessage = "La caja que intenta cerrar no fue encontrada.";
           statusCode = 404;
       }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage, drawer: null, statusCode: statusCode };
  }
}

/**
 * Fetches the currently open cash drawer, formatted for client-side use.
 * @returns The open CashDrawer object conforming to the custom type, or null if no drawer is open.
 */
export async function getCurrentDrawer(): Promise<CashDrawer | null> {
  console.log("[getCurrentDrawer] Fetching the currently open cash drawer...");
  try {
    const openDrawerData = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
      include: {
        User_CashDrawer_openedByToUser: { 
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        CashTransaction: true,
        // Include closedBy user relation temporarily for consistent type with helper
        User_CashDrawer_closedByToUser: { 
           select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Pass the fetched data (or null) to the formatter
    return formatDrawerForClient(openDrawerData);

  } catch (error) {
    console.error("Error fetching current cash drawer:", error);
    return null;
  }
}
