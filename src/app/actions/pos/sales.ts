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
} from "@/types/pos";
// Node Utils
import { randomUUID } from "crypto";

// --- Definición de Tipos de Retorno para las Acciones ---

// Tipo para el resultado de createSale
type CreateSaleResult =
  | { success: true; id: string; receiptNumber: string; }
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
 * Crea una nueva venta, actualiza inventario y registra transacción en caja.
 * @param data Datos del formulario de venta.
 * @returns Un objeto indicando éxito (con id y receiptNumber) o fallo (con error).
 */
// --- Anotación de Retorno Explícita ---
export async function createSale(data: SaleFormData): Promise<CreateSaleResult> {
// -------------------------------------
  console.log("Iniciando createSale con data:", JSON.stringify(data, null, 2));
  try {
    const { isAuthenticated } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      console.error("createSale: Falla de autenticación.");
      return { success: false, error: "No autorizado" }; // Coincide con CreateSaleResult
    }
    console.log("createSale: Autenticación exitosa.");

    const operatorDbUserId = await getDbUserIdFromKinde();
    if (!operatorDbUserId) {
      console.error("createSale: No se pudo obtener el ID del operador.");
      return { success: false, error: "No se pudo verificar la identidad del operador." }; // Coincide
    }
    console.log(`createSale: ID de operador obtenido: ${operatorDbUserId}`);

    // Asegúrate que 'status: "OPEN"' coincida con tu Enum si usas DrawerStatus.OPEN
    const openDrawer = await prisma.cashDrawer.findFirst({ where: { status: "OPEN" } });
    if (!openDrawer) {
      console.error("createSale: No se encontró caja abierta.");
      return { success: false, error: "No hay caja abierta. Debe abrir una caja para procesar ventas." }; // Coincide
    }
    console.log(`createSale: Caja abierta encontrada: ${openDrawer.id}`);

    const receiptNumber = await generateReceiptNumber();
    console.log(`createSale: Número de recibo generado: ${receiptNumber}`);

    console.log("createSale: Iniciando transacción de Prisma...");
    // El resultado de $transaction debe coincidir con CreateSaleResult si no hay error interno
    const result = await prisma.$transaction(async (tx): Promise<CreateSaleResult> => { // Puede tipar aquí también
      console.log("createSale (tx): Creando registro de venta...");
      const sale = await tx.sale.create({
        data: {
          receiptNumber,
          userId: data.userId || null,
          petId: data.petId || null,
          subtotal: data.subtotal,
          tax: data.tax,
          discount: data.discount,
          total: data.total,
          paymentMethod: data.paymentMethod as PaymentMethod,
          status: SaleStatus.COMPLETED,
          notes: data.notes,
        },
      });
      console.log(`createSale (tx): Venta creada con ID: ${sale.id}`);

      console.log(`createSale (tx): Procesando ${data.items.length} items...`);
      for (const item of data.items) {
        console.log(`createSale (tx): Procesando item: ${item.description} (ID: ${item.itemId ?? item.serviceId})`);
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            itemId: item.itemId,
            serviceId: item.serviceId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          },
        });

        if (item.itemId) {
          console.log(`createSale (tx): Item ${item.itemId} es un producto, actualizando inventario...`);
          const product = await tx.inventoryItem.findUnique({ where: { id: item.itemId } });
          if (product) {
            const newQuantity = product.quantity - item.quantity;
            console.log(`createSale (tx): Stock actual ${product.quantity}, cantidad vendida ${item.quantity}, nuevo stock ${newQuantity}`);
            let newStatus: InventoryStatus = product.status; // Mantener estado actual por defecto
            if (newQuantity <= 0) {
              newStatus = InventoryStatus.OUT_OF_STOCK;
            } else if (product.minStock != null && newQuantity <= product.minStock) {
              newStatus = InventoryStatus.LOW_STOCK;
            } else if (product.status === InventoryStatus.OUT_OF_STOCK || product.status === InventoryStatus.LOW_STOCK) {
              // Si había poco o nada de stock y ahora hay, ponerlo como activo
              newStatus = InventoryStatus.ACTIVE; // O IN_STOCK si lo usas
            }
            console.log(`createSale (tx): Nuevo estado determinado: ${newStatus}`);
            await tx.inventoryItem.update({
              where: { id: item.itemId },
              data: { quantity: { decrement: item.quantity }, status: newStatus },
            });
            console.log(`createSale (tx): InventoryItem ${item.itemId} actualizado.`);
            console.log(`createSale (tx): Registrando InventoryMovement para ${item.itemId}...`);
            await tx.inventoryMovement.create({
              data: {
                itemId: item.itemId, type: MovementType.OUT, quantity: item.quantity,
                reason: "VENTA", relatedRecordId: sale.id, notes: `Venta #${receiptNumber}`,
                userId: operatorDbUserId,
              },
            });
            console.log(`createSale (tx): InventoryMovement registrado.`);
          } else {
            console.error(`createSale (tx): Producto ${item.itemId} NO ENCONTRADO.`);
            // Considerar lanzar un error aquí para abortar la transacción si un producto no existe
            // throw new Error(`Producto con ID ${item.itemId} no encontrado en inventario.`);
          }
        }
      } // Fin loop items

      console.log(`createSale (tx): Registrando CashTransaction en caja ${openDrawer.id}...`);
      await tx.cashTransaction.create({
        data: {
          drawerId: openDrawer.id, amount: data.total, type: TransactionType.SALE,
          description: `Venta #${receiptNumber}`, saleId: sale.id,
        },
      });
      console.log(`createSale (tx): CashTransaction registrada.`);

      // Retorno de éxito dentro de la transacción
      return { success: true, id: sale.id, receiptNumber }; // Coincide con CreateSaleResult
    }); // Fin $transaction
    console.log("createSale: Transacción de Prisma completada con resultado:", result);

    // result ya tiene el tipo CreateSaleResult aquí si la transacción tuvo éxito
    if (result.success) {
      console.log("createSale: Revalidando paths...");
      revalidatePath("/admin/pos/ventas");
      revalidatePath("/admin/pos");
      revalidatePath("/admin/inventario");
      revalidatePath(`/admin/pos/ventas/${result.id}`);
      console.log("createSale: Paths revalidados.");
    }
    // Devuelve el resultado de la transacción (éxito o error si la transacción falló internamente)
    return result;

  } catch (error) {
    console.error("Error BUCLE PRINCIPAL createSale:", error);
    // Retorno de error del bloque catch principal
    return { success: false, error: error instanceof Error ? error.message : "Error inesperado al procesar la venta" }; // Coincide
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
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    console.warn("getSales: Intento no autorizado.");
    throw new Error("No autorizado para ver las ventas.");
  }
  console.log("getSales: Autenticación exitosa.");

  try {
    const whereClause: Prisma.SaleWhereInput = {};
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    if(parsedStartDate) parsedStartDate.setHours(0, 0, 0, 0); // Inicio del día
    if (parsedEndDate) parsedEndDate.setHours(23, 59, 59, 999); // Fin del día

    if (parsedStartDate && parsedEndDate) whereClause.date = { gte: parsedStartDate, lte: parsedEndDate };
    else if (parsedStartDate) whereClause.date = { gte: parsedStartDate };
    else if (parsedEndDate) whereClause.date = { lte: parsedEndDate };

    if (paymentMethod) whereClause.paymentMethod = paymentMethod as PaymentMethod;
    if (status) whereClause.status = status as SaleStatus;

    console.log("getSales: Cláusula Where construida:", JSON.stringify(whereClause));

    const [sales, total] = await prisma.$transaction([
      prisma.sale.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          pet: { select: { id: true, name: true, species: true, breed: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where: whereClause }),
    ]);
    console.log(`getSales: Encontradas ${sales.length} ventas de un total de ${total}.`);

    // Asegurarse de que las ventas coincidan con SaleListItem si hay diferencias (ej. formato de fecha)
    // Aquí asumimos que la estructura devuelta por Prisma es compatible con SaleListItem
    const formattedSales: SaleListItem[] = sales as SaleListItem[];

    return {
      sales: formattedSales,
      pagination: { total, pages: Math.ceil(total / limit), page, limit },
    };
  } catch (error) {
    console.error("Error BUCLE PRINCIPAL getSales:", error);
    // Lanzar el error para que sea manejado por el componente que llama
    throw new Error(error instanceof Error ? error.message : "Error al obtener las ventas");
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
  console.log(`Iniciando getSaleById con ID: ${id}`);
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    console.warn(`getSaleById(${id}): Intento no autorizado.`);
    throw new Error("No autorizado para ver detalles de la venta.");
  }
  console.log(`getSaleById(${id}): Autenticación exitosa.`);

  if (!id) {
    console.error("getSaleById: ID no proporcionado.");
    throw new Error("Se requiere un ID para buscar la venta.");
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        user: true, // Incluir todos los campos por defecto o seleccionar específicos
        pet: true,  // Incluir todos los campos por defecto o seleccionar específicos
        items: {
          include: {
            inventoryItem: true, // Incluye todos los detalles del item
            service: true,       // Incluye todos los detalles del servicio
          },
          orderBy: { description: 'asc' }
        },
      },
    });

    if (!sale) {
      console.warn(`getSaleById(${id}): Venta no encontrada.`);
      // Lanzar error en lugar de devolver null para que el tipo Promise<Sale> se cumpla en caso de éxito
      throw new Error("Venta no encontrada.");
    }

    console.log(`getSaleById(${id}): Venta encontrada.`);
    // Asegurarse que el tipo devuelto por Prisma coincida con tu tipo 'Sale' importado
    // Puede requerir un casting 'as Sale' si hay pequeñas diferencias que sabes que son seguras
    return sale as Sale;

  } catch (error) {
    console.error(`Error BUCLE PRINCIPAL getSaleById (${id}):`, error);
    // Re-lanzar el error (puede ser el error de 'Venta no encontrada' o un error de BD)
    throw new Error(error instanceof Error ? error.message : "Error al obtener la venta");
  }
}

/**
 * Cancela una venta completada, revierte inventario y registra transacción en caja.
 * @param id El ID de la venta a cancelar.
 * @returns Un objeto indicando éxito o fallo (con error).
 */
 // --- Anotación de Retorno Explícita ---
export async function cancelSale(id: string): Promise<CancelSaleResult> {
// -------------------------------------
  console.log(`Iniciando cancelSale con ID: ${id}`);
  try {
    const { isAuthenticated } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      console.error(`cancelSale(${id}): Falla de autenticación.`);
      return { success: false, error: "No autorizado" }; // Coincide con CancelSaleResult
    }
    console.log(`cancelSale(${id}): Autenticación exitosa.`);

    const operatorDbUserId = await getDbUserIdFromKinde();
    if (!operatorDbUserId) {
      console.error(`cancelSale(${id}): No se pudo obtener ID del operador.`);
      return { success: false, error: "No se pudo verificar la identidad del operador." }; // Coincide
    }
    console.log(`cancelSale(${id}): ID de operador obtenido: ${operatorDbUserId}`);

    if (!id) {
      console.error("cancelSale: ID no proporcionado.");
      return { success: false, error: "Se requiere ID para cancelar la venta." }; // Coincide
    }

    console.log(`cancelSale(${id}): Iniciando transacción de Prisma...`);
    // La transacción devuelve CancelSaleResult o lanza un error si falla internamente
    const result = await prisma.$transaction(async (tx): Promise<CancelSaleResult> => { // Puede tipar aquí también
      console.log(`cancelSale(${id}) (tx): Buscando venta...`);
      const sale = await tx.sale.findUnique({ where: { id }, include: { items: true } });
      if (!sale) {
        console.error(`cancelSale(${id}) (tx): Venta no encontrada.`);
        throw new Error("Venta no encontrada"); // Aborta la transacción
      }
      if (sale.status !== SaleStatus.COMPLETED) {
        console.error(`cancelSale(${id}) (tx): Intento de cancelar venta con estado ${sale.status}.`);
        throw new Error(`Solo se pueden cancelar ventas completadas. Estado actual: ${sale.status}`); // Aborta
      }
      console.log(`cancelSale(${id}) (tx): Venta encontrada, estado ${sale.status}. Procediendo a cancelar...`);

      await tx.sale.update({ where: { id }, data: { status: SaleStatus.CANCELLED } });
      console.log(`cancelSale(${id}) (tx): Estado de la venta actualizado a CANCELLED.`);

      console.log(`cancelSale(${id}) (tx): Revirtiendo inventario para ${sale.items.length} items...`);
      for (const item of sale.items) {
        if (item.itemId) {
          console.log(`cancelSale(${id}) (tx): Revirtiendo stock para item ${item.itemId}...`);
          const product = await tx.inventoryItem.findUnique({ where: { id: item.itemId } });
          if (product) {
            const newQuantity = product.quantity + item.quantity;
            console.log(`cancelSale(${id}) (tx): Stock actual ${product.quantity}, cantidad devuelta ${item.quantity}, nuevo stock ${newQuantity}`);
            let newStatus: InventoryStatus = product.status; // Mantener estado actual por defecto
             if (newQuantity <= 0 && product.status !== InventoryStatus.OUT_OF_STOCK) {
                 newStatus = InventoryStatus.OUT_OF_STOCK;
             } else if (newQuantity > 0 && product.minStock != null && newQuantity <= product.minStock && product.status !== InventoryStatus.LOW_STOCK) {
                 newStatus = InventoryStatus.LOW_STOCK;
             } else if (newQuantity > 0 && (product.minStock == null || newQuantity > product.minStock) && (product.status === InventoryStatus.OUT_OF_STOCK || product.status === InventoryStatus.LOW_STOCK)) {
                 // Si había poco/nada y ahora hay suficiente, poner como activo
                 newStatus = InventoryStatus.ACTIVE; // O IN_STOCK si lo usas
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
                itemId: item.itemId, type: MovementType.RETURN, quantity: item.quantity,
                reason: "CANCELACIÓN", relatedRecordId: sale.id, notes: `Cancelación Venta #${sale.receiptNumber}`,
                userId: operatorDbUserId,
              },
            });
            console.log(`cancelSale(${id}) (tx): InventoryMovement (RETURN) registrado.`);
          } else {
            console.warn(`cancelSale(${id}) (tx): Producto ${item.itemId} no encontrado al revertir inventario.`);
          }
        }
      } // Fin loop items

      console.log(`cancelSale(${id}) (tx): Buscando caja abierta para registrar reembolso...`);
      // Asegúrate que 'status: "OPEN"' coincida con tu Enum si usas DrawerStatus.OPEN
      const openDrawer = await tx.cashDrawer.findFirst({ where: { status: "OPEN" } });
      if (openDrawer) {
        console.log(`cancelSale(${id}) (tx): Caja abierta ${openDrawer.id} encontrada. Registrando CashTransaction (REFUND)...`);
        await tx.cashTransaction.create({
          data: {
            drawerId: openDrawer.id, amount: -sale.total, type: TransactionType.REFUND,
            description: `Cancelación Venta #${sale.receiptNumber}`, saleId: sale.id,
          },
        });
        console.log(`cancelSale(${id}) (tx): CashTransaction (REFUND) registrada.`);
      } else {
        console.warn(`cancelSale(${id}) (tx): No se encontró caja abierta. No se registró transacción de caja para la cancelación.`);
      }

      // Retorno de éxito dentro de la transacción
      return { success: true }; // Coincide con CancelSaleResult
    }); // Fin $transaction
    console.log(`cancelSale(${id}): Transacción de Prisma completada con resultado:`, result);

    // result ya tiene el tipo CancelSaleResult aquí si la transacción tuvo éxito
    if (result.success) {
      console.log(`cancelSale(${id}): Revalidando paths...`);
      revalidatePath("/admin/pos/ventas");
      revalidatePath(`/admin/pos/ventas/${id}`);
      revalidatePath("/admin/inventario");
      revalidatePath("/admin/pos");
      console.log(`cancelSale(${id}): Paths revalidados.`);
    }
    // Devuelve el resultado de la transacción
    return result;

  } catch (error) {
    console.error(`Error BUCLE PRINCIPAL cancelSale (${id}):`, error);
    // Retorno de error del bloque catch principal (o si la transacción lanzó error)
    return { success: false, error: error instanceof Error ? error.message : "Error al cancelar la venta" }; // Coincide
  }
}