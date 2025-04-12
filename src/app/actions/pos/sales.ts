// src/app/actions/pos/sales.ts
"use server";

import { revalidatePath } from "next/cache";
// Kinde Imports
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
// Prisma Imports - Importar Enums directamente desde @prisma/client
import {
    Prisma,
    InventoryStatus,
    PaymentMethod,
    SaleStatus,
    TransactionType,
    MovementType,
    // Asumiendo que DrawerStatus está definido en tus enums si lo usas explícitamente
    // DrawerStatus
 } from '@prisma/client';
// Importar la instancia de prisma desde tu archivo lib
import { prisma } from "@/lib/prismaDB";
// Utils & Types
import { generateReceiptNumber } from "@/utils/pos-helpers";
// Importar tipos necesarios desde tu archivo de tipos POS
import type {
  SaleFormData,
  Sale,             // Importa el tipo completo de Venta
  SaleListItem,     // Importa el tipo para listas de ventas
  SaleItemData,     // Import SaleItemData if not already
} from "@/types/pos";
// Node Utils
import { randomUUID } from "crypto";

// --- Definición de Tipos de Retorno para las Acciones ---

// Tipo para el resultado de createSale
type CreateSaleResult =
  | { success: true; sale: Sale }
  | { success: false; error: string; };

// Tipo para el resultado de cancelSale
type CancelSaleResult =
  | { success: true; }
  | { success: false; error: string; };

// Tipo para la información de paginación
interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// Tipo para el resultado de getSales
interface GetSalesResult {
  sales: SaleListItem[]; // Usa el tipo importado
  pagination: PaginationInfo;
}

// Define un nuevo tipo que extienda SaleFormData para incluir el status
interface CreateSaleData extends SaleFormData {
  status: SaleStatus; // Añadir el estado deseado
}

// ------------------------------------------------------


// --- Helper para obtener el ID de usuario de la BD local desde Kinde ---
async function getDbUserIdFromKinde(): Promise<string | null> {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  if (!kindeUser || !kindeUser.id) {
    console.error("Helper getDbUserIdFromKinde: No se pudo obtener el usuario de Kinde.");
    return null;
  }
  try {
    let dbUser = await prisma.user.findUnique({ where: { kindeId: kindeUser.id } });
    if (!dbUser) {
      console.warn(`Creando usuario local para Kinde ID: ${kindeUser.id} (${kindeUser.email})`);
      dbUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          kindeId: kindeUser.id,
          email: kindeUser.email ?? `kinde_${kindeUser.id}@placeholder.email`,
          firstName: kindeUser.given_name,
          lastName: kindeUser.family_name,
          name: `${kindeUser.given_name ?? ''} ${kindeUser.family_name ?? ''}`.trim(),
        },
      });
      console.log(`Usuario local creado con ID: ${dbUser.id}`);
    }
    return dbUser.id;
  } catch (error) {
    console.error("Error en getDbUserIdFromKinde al buscar/crear usuario:", error);
    return null;
  }
}
// --- Fin del Helper ---

/**
 * Crea una nueva venta, opcionalmente actualiza inventario y registra transacción si es COMPLETADA.
 * @param data Datos del formulario de venta MÁS el estado deseado (PENDING o COMPLETED).
 * @returns Un objeto indicando éxito (con id y receiptNumber) o fallo (con error).
 */
// --- Anotación de Retorno Explícita ---
export async function createSale(data: CreateSaleData): Promise<CreateSaleResult> {
// -------------------------------------
  console.log(`Iniciando createSale con status: ${data.status} y data:`, JSON.stringify(data, null, 2));
  try {
    /*
    // REMOVED - Middleware handles authentication
    const { isAuthenticated } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      console.error("createSale: Falla de autenticación.");
      return { success: false, error: "No autorizado" };
    }
    */
    const operatorDbUserId = await getDbUserIdFromKinde();
    if (!operatorDbUserId) {
      console.error("createSale: No se pudo obtener el ID del operador.");
      return { success: false, error: "No se pudo verificar la identidad del operador." };
    }

    let openDrawer: { id: string } | null = null;
    if (data.status === SaleStatus.COMPLETED) {
      console.log("createSale: Venta es COMPLETED, buscando caja abierta...");
      openDrawer = await prisma.cashDrawer.findFirst({ where: { status: "OPEN" } });
      if (!openDrawer) {
        console.error("createSale: No se encontró caja abierta para venta COMPLETED.");
        return { success: false, error: "No hay caja abierta. Debe abrir una caja para procesar ventas completadas." };
      }
      console.log(`createSale: Caja abierta encontrada: ${openDrawer.id}`);
    } else {
      console.log("createSale: Venta es PENDING, no se requiere caja abierta.");
    }

    const receiptNumber = await generateReceiptNumber();
    console.log(`createSale: Número de recibo generado: ${receiptNumber}`);

    console.log("createSale: Iniciando transacción de Prisma...");
    const result = await prisma.$transaction(async (tx): Promise<CreateSaleResult> => {
      console.log("createSale (tx): Creando registro de venta...");

      // Preparar datos para SaleItem (nested create)
      const saleItemsToCreate = data.items.map((item: SaleItemData) => ({
        id: randomUUID(),
        itemId: item.itemId,
        serviceId: item.serviceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      }));

      const sale = await tx.sale.create({
        data: {
          id: randomUUID(),
          receiptNumber,
          userId: data.userId || null,
          petId: data.petId || null,
          subtotal: data.subtotal,
          tax: data.tax,
          discount: data.discount,
          total: data.total,
          paymentMethod: data.paymentMethod as PaymentMethod,
          status: data.status,
          notes: data.notes,
          SaleItem: {
             create: saleItemsToCreate,
          },
        },
      });
      console.log(`createSale (tx): Venta creada con ID: ${sale.id} y status: ${sale.status}`);

      if (data.status === SaleStatus.COMPLETED) {
         console.log(`createSale (tx): Venta COMPLETED. Procesando inventario y caja para ${data.items.length} items...`);
         for (const item of data.items) {
           if (item.itemId) {
             console.log(`createSale (tx): Item ${item.itemId} es un producto, actualizando inventario...`);
             const product = await tx.inventoryItem.findUnique({ where: { id: item.itemId } });
             if (product) {
               const newQuantity = product.quantity - item.quantity;
               let newStatus: InventoryStatus = product.status;
               if (newQuantity <= 0) newStatus = InventoryStatus.OUT_OF_STOCK;
               else if (product.minStock != null && newQuantity <= product.minStock) newStatus = InventoryStatus.LOW_STOCK;
               else if (product.status === InventoryStatus.OUT_OF_STOCK || product.status === InventoryStatus.LOW_STOCK) newStatus = InventoryStatus.ACTIVE;

               await tx.inventoryItem.update({
                 where: { id: item.itemId },
                 data: { quantity: { decrement: item.quantity }, status: newStatus },
               });
               await tx.inventoryMovement.create({
                 data: {
                   itemId: item.itemId,
                   type: MovementType.OUT,
                   quantity: item.quantity,
                   reason: "VENTA",
                   relatedRecordId: sale.id,
                   notes: `Venta #${receiptNumber}`,
                   userId: operatorDbUserId,
                 },
               });
               console.log(`createSale (tx): Inventario y movimiento registrados para ${item.itemId}.`);
             } else {
               console.error(`createSale (tx): Producto ${item.itemId} NO ENCONTRADO para venta COMPLETED.`);
               throw new Error(`Producto con ID ${item.itemId} no encontrado en inventario.`);
             }
           }
         }

         if (!openDrawer) {
           console.error("createSale (tx): ERROR INESPERADO - openDrawer es null dentro de la transacción para venta COMPLETED.");
           throw new Error("Error interno: Falta la referencia a la caja abierta.");
         }
         console.log(`createSale (tx): Registrando CashTransaction en caja ${openDrawer.id}...`);
         await tx.cashTransaction.create({
           data: {
             id: randomUUID(),
             drawerId: openDrawer.id,
             amount: data.total,
             type: TransactionType.SALE,
             description: `Venta #${receiptNumber}`,
             saleId: sale.id,
           },
         });
         console.log(`createSale (tx): CashTransaction registrada para venta COMPLETED.`);
      } else {
         console.log(`createSale (tx): Venta PENDING. No se actualiza inventario ni caja en este paso.`);
      }

      // Fetch the complete sale object with relations before returning
      const fullSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          User: true,
          Pet: true,
          SaleItem: true,
        },
      });

      if (!fullSale) {
        // This should ideally not happen within a transaction after creation
        console.error(`createSale (tx): Failed to fetch the created sale ${sale.id} after creation.`);
        throw new Error("Could not retrieve the sale details after creation.");
      }

      // Return the full sale object, casting it to the expected Sale type
      // This assumes the structure returned by Prisma (with includes)
      // is compatible with your custom Sale type definition.
      return { success: true, sale: fullSale as Sale };
    });
    console.log("createSale: Transacción de Prisma completada con resultado:", result);

    if (result.success) {
      console.log("createSale: Revalidando paths...");
      revalidatePath("/admin/pos/ventas");
      revalidatePath("/admin/pos");
      if(data.status === SaleStatus.COMPLETED) {
         revalidatePath("/admin/inventario");
      }
      revalidatePath(`/admin/pos/ventas/${result.sale.id}`);
      revalidatePath("/admin/pos/ventas/pendientes");
      console.log("createSale: Paths revalidados.");
    }
    return result;

  } catch (error) {
    console.error("Error BUCLE PRINCIPAL createSale:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error inesperado al procesar la venta" };
  }
}

/**
 * Obtiene una lista paginada de ventas con filtros opcionales.
 * @returns Un objeto con la lista de ventas y la información de paginación.
 * @throws Error si el usuario no está autenticado o si ocurre un error en la base de datos.
 */
 // --- Anotación de Retorno Explícita ---
export async function getSales({
  page = 1, limit = 10, startDate, endDate, paymentMethod, status,
}: {
  page?: number; limit?: number; startDate?: string | Date; endDate?: string | Date;
  paymentMethod?: string; status?: string;
}): Promise<GetSalesResult> {
// -------------------------------------
  console.log("Iniciando getSales con filtros:", { page, limit, startDate, endDate, paymentMethod, status });
  /*
  // REMOVED - Middleware handles authentication
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    console.warn("getSales: Intento no autorizado.");
    throw new Error("No autorizado para ver las ventas.");
  }
  */

  try {
    const whereClause: Prisma.SaleWhereInput = {};
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    if(parsedStartDate) parsedStartDate.setHours(0, 0, 0, 0);
    if (parsedEndDate) parsedEndDate.setHours(23, 59, 59, 999);

    if (parsedStartDate && parsedEndDate) whereClause.date = { gte: parsedStartDate, lte: parsedEndDate };
    else if (parsedStartDate) whereClause.date = { gte: parsedStartDate };
    else if (parsedEndDate) whereClause.date = { lte: parsedEndDate };

    if (paymentMethod) whereClause.paymentMethod = paymentMethod as PaymentMethod;
    if (status) whereClause.status = status as SaleStatus;

    console.log("getSales: Cláusula Where construida:", JSON.stringify(whereClause));

    const orderBy: Prisma.SaleOrderByWithRelationInput[] = [{ date: 'desc' }];

    const [sales, total] = await prisma.$transaction([
      prisma.sale.findMany({
        where: whereClause,
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          Pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where: whereClause }),
    ]);
    console.log(`getSales: Encontradas ${sales.length} ventas de un total de ${total}.`);

    const formattedSales: SaleListItem[] = sales as SaleListItem[];

    return {
      sales: formattedSales,
      pagination: { total, pages: Math.ceil(total / limit), page, limit },
    };
  } catch (error) {
    console.error("Error BUCLE PRINCIPAL getSales:", error);
    throw new Error(error instanceof Error ? error.message : "Error al obtener la lista de ventas");
  }
}

/**
 * Obtiene los detalles completos de una venta específica por su ID.
 * @param id El ID de la venta a buscar.
 * @returns El objeto completo de la venta.
 * @throws Error si el usuario no está autenticado, si no se proporciona ID, si la venta no se encuentra, o si ocurre un error de base de datos.
 */
 // --- Anotación de Retorno Explícita ---
export async function getSaleById(id: string): Promise<Sale> { // Devuelve Sale o lanza error
// -------------------------------------
  console.log(`getSaleById: Buscando venta con ID: ${id}`);
  if (!id) {
    console.error("getSaleById: ID de venta no proporcionado.");
    throw new Error("ID de venta no proporcionado.");
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        User: true,     // Include related User
        Pet: true,      // Include related Pet
        SaleItem: true // Include related SaleItems
      }
    });

    if (!sale) {
      console.warn(`getSaleById: Venta con ID ${id} no encontrada.`);
      throw new Error("Venta no encontrada.");
    }

    console.log(`getSaleById(${id}): Venta encontrada.`);
    return sale as Sale;

  } catch (error) {
    console.error(`Error BUCLE PRINCIPAL getSaleById (${id}):`, error);
    throw new Error(error instanceof Error ? error.message : "Error al obtener la venta");
  }
}

/**
 * Cancela una venta existente, revierte inventario y registra transacción de caja.
 * @param id El ID de la venta a cancelar.
 * @returns Un objeto indicando éxito o fallo (con error).
 * @throws Error si el usuario no está autenticado o la venta no existe.
 */
// --- Anotación de Retorno Explícita ---
export async function cancelSale(id: string): Promise<CancelSaleResult> {
// -------------------------------------
  console.log(`Iniciando cancelSale para ID: ${id}`);
  /*
  // REMOVED - Middleware handles authentication
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    console.error(`cancelSale(${id}): Falla de autenticación.`);
    return { success: false, error: "No autorizado" };
  }
  */
  const operatorDbUserId = await getDbUserIdFromKinde();
  if (!operatorDbUserId) {
    console.error(`cancelSale(${id}): No se pudo obtener el ID del operador.`);
    return { success: false, error: "No se pudo verificar la identidad del operador." };
  }

  try {
    console.log(`cancelSale(${id}): Iniciando transacción de Prisma...`);
    const result = await prisma.$transaction(async (tx): Promise<CancelSaleResult> => {
      console.log(`cancelSale(${id}) (tx): Buscando venta...`);
      const sale = await tx.sale.findUnique({
        where: { id },
        include: {
          SaleItem: true,
        },
      });

      if (!sale) {
        console.warn(`cancelSale(${id}) (tx): Venta no encontrada.`);
        throw new Error("Venta no encontrada.");
      }

      if (sale.status === SaleStatus.CANCELLED || sale.status === SaleStatus.REFUNDED) {
        console.warn(`cancelSale(${id}) (tx): La venta ya está cancelada o reembolsada (estado: ${sale.status}).`);
        throw new Error("La venta ya está cancelada o reembolsada.");
      }

      console.log(`cancelSale(${id}) (tx): Venta encontrada con status ${sale.status}. Actualizando a CANCELLED...`);
      await tx.sale.update({
        where: { id: sale.id },
        data: { status: SaleStatus.CANCELLED },
      });

      if (sale.status === SaleStatus.COMPLETED) {
        console.log(`cancelSale(${id}) (tx): Venta estaba COMPLETED. Revirtiendo inventario y caja...`);

        console.log(`cancelSale(${id}) (tx): Procesando ${sale.SaleItem.length} items para revertir stock...`);
        for (const item of sale.SaleItem) {
          if (item.itemId) {
            console.log(`cancelSale(${id}) (tx): Revirtiendo stock para item ${item.itemId}...`);
            const product = await tx.inventoryItem.findUnique({ where: { id: item.itemId } });
            if (product) {
              const newQuantity = product.quantity + item.quantity;
              let newStatus: InventoryStatus = product.status;
              if (newQuantity <= 0 && product.status !== InventoryStatus.OUT_OF_STOCK) {
                  newStatus = InventoryStatus.OUT_OF_STOCK;
              } else if (newQuantity > 0 && product.minStock != null && newQuantity <= product.minStock && product.status !== InventoryStatus.LOW_STOCK) {
                  newStatus = InventoryStatus.LOW_STOCK;
              } else if (newQuantity > 0 && (product.minStock == null || newQuantity > product.minStock) && (product.status === InventoryStatus.OUT_OF_STOCK || product.status === InventoryStatus.LOW_STOCK)) {
                  newStatus = InventoryStatus.ACTIVE;
              }
              console.log(`cancelSale(${id}) (tx): Nuevo estado determinado: ${newStatus}`);
              await tx.inventoryItem.update({
                where: { id: item.itemId },
                data: { quantity: { increment: item.quantity }, status: newStatus },
              });
              console.log(`cancelSale(${id}) (tx): InventoryItem ${item.itemId} actualizado.`);
              console.log(`cancelSale(${id}) (tx): Registrando InventoryMovement (RETURN) para ${item.itemId}...`);
              await tx.inventoryMovement.create({
                data: {
                  itemId: item.itemId,
                  type: MovementType.RETURN,
                  quantity: item.quantity,
                  reason: "CANCELACIÓN",
                  relatedRecordId: sale.id,
                  notes: `Cancelación Venta #${sale.receiptNumber}`,
                  userId: operatorDbUserId,
                },
              });
              console.log(`cancelSale(${id}) (tx): InventoryMovement (RETURN) registrado.`);
            } else {
              console.warn(`cancelSale(${id}) (tx): Producto ${item.itemId} no encontrado al revertir inventario.`);
            }
          }
        }

        console.log(`cancelSale(${id}) (tx): Buscando caja abierta para registrar reembolso...`);
        const openDrawer = await tx.cashDrawer.findFirst({ where: { status: "OPEN" } });
        if (openDrawer) {
          console.log(`cancelSale(${id}) (tx): Caja abierta ${openDrawer.id} encontrada. Registrando CashTransaction (REFUND)...`);
          await tx.cashTransaction.create({
            data: {
              id: randomUUID(),
              drawerId: openDrawer.id,
              amount: -sale.total,
              type: TransactionType.REFUND,
              description: `Cancelación Venta #${sale.receiptNumber}`,
              saleId: sale.id,
            },
          });
          console.log(`cancelSale(${id}) (tx): CashTransaction (REFUND) registrada.`);
        } else {
          console.warn(`cancelSale(${id}) (tx): No se encontró caja abierta. No se registró transacción de caja para la cancelación.`);
        }
      } else {
        console.log(`cancelSale(${id}) (tx): Venta estaba ${sale.status}. Solo se cambió status a CANCELLED.`);
      }

      return { success: true };
    });
    console.log(`cancelSale(${id}): Transacción de Prisma completada con resultado:`, result);

    if (result.success) {
      console.log(`cancelSale(${id}): Revalidando paths...`);
      revalidatePath("/admin/pos/ventas");
      revalidatePath("/admin/pos");
      revalidatePath("/admin/inventario"); // Revalidar inventario por si acaso
      revalidatePath(`/admin/pos/ventas/${id}`);
      revalidatePath("/admin/pos/ventas/pendientes");
      console.log(`cancelSale(${id}): Paths revalidados.`);
    }
    return result;

  } catch (error) {
    console.error(`Error BUCLE PRINCIPAL cancelSale (${id}):`, error);
    return { success: false, error: error instanceof Error ? error.message : "Error inesperado al cancelar la venta" };
  }
}