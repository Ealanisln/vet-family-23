// src/app/actions/pos/sales.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismaDB";
import { generateReceiptNumber } from "@/utils/pos-helpers";
import type { SaleFormData, SaleItem } from "@/types/pos";

export async function createSale(data: SaleFormData) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return { success: false, error: "No autorizado" };
    }
    
    // Obtener el cajón de caja abierto actualmente
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: {
        status: "OPEN",
      },
    });
    
    if (!openDrawer) {
      return { success: false, error: "No hay caja abierta. Debe abrir una caja para procesar ventas." };
    }

    // Generar número de recibo
    const receiptNumber = await generateReceiptNumber();
    
    // Iniciar transacción
    return await prisma.$transaction(async (tx) => {
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
        },
      });
      
      // 2. Crear los items de la venta
      for (const item of data.items) {
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
        
        // 3. Actualizar inventario si es un producto
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
                status: product.quantity - item.quantity <= 0 ? "OUT_OF_STOCK" : 
                       (product.minStock && product.quantity - item.quantity <= product.minStock) ? "LOW_STOCK" : 
                       product.status,
              },
            });
            
            // Registrar movimiento de inventario
            await tx.inventoryMovement.create({
              data: {
                itemId: item.itemId,
                type: "OUT",
                quantity: item.quantity,
                reason: "VENTA",
                relatedRecordId: sale.id,
                notes: `Venta #${receiptNumber}`,
                userId: session.user?.id,
              },
            });
          }
        }
      }
      
      // 4. Registrar transacción en la caja
      await tx.cashTransaction.create({
        data: {
          drawerId: openDrawer.id,
          amount: data.total,
          type: "SALE",
          description: `Venta #${receiptNumber}`,
          saleId: sale.id,
        },
      });
      
      // Actualizar rutas para reflejar los cambios
      revalidatePath("/admin/pos/ventas");
      revalidatePath("/admin/pos");
      revalidatePath("/admin/inventario");
      
      return { 
        success: true, 
        id: sale.id, 
        receiptNumber 
      };
    });
  } catch (error) {
    console.error("Error creating sale:", error);
    return { success: false, error: "Error al procesar la venta" };
  }
}

export async function getSales({ 
  page = 1, 
  limit = 10, 
  startDate, 
  endDate, 
  paymentMethod,
  status,
}: { 
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  paymentMethod?: string;
  status?: string;
}) {
  try {
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      whereClause.date = {
        gte: startDate,
      };
    } else if (endDate) {
      whereClause.date = {
        lte: endDate,
      };
    }
    
    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
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
    
    return {
      sales,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw error;
  }
}

export async function getSaleById(id: string) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        user: true,
        pet: true,
        items: {
          include: {
            inventoryItem: true,
            service: true,
          },
        },
      },
    });
    
    return sale;
  } catch (error) {
    console.error("Error fetching sale:", error);
    throw error;
  }
}

export async function cancelSale(id: string) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return { success: false, error: "No autorizado" };
    }
    
    // Obtener la venta para ver si se puede cancelar
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
    
    if (!sale) {
      return { success: false, error: "Venta no encontrada" };
    }
    
    if (sale.status !== "COMPLETED") {
      return { success: false, error: "Solo se pueden cancelar ventas completadas" };
    }
    
    // Iniciar transacción para cancelar la venta
    return await prisma.$transaction(async (tx) => {
      // 1. Actualizar el estado de la venta
      await tx.sale.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
      });
      
      // 2. Revertir movimientos de inventario si hay productos
      for (const item of sale.items) {
        if (item.itemId) {
          // Actualizar cantidad en inventario
          await tx.inventoryItem.update({
            where: { id: item.itemId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
          
          // Registrar movimiento de inventario
          await tx.inventoryMovement.create({
            data: {
              itemId: item.itemId,
              type: "RETURN",
              quantity: item.quantity,
              reason: "CANCELACIÓN",
              relatedRecordId: sale.id,
              notes: `Cancelación de venta #${sale.receiptNumber}`,
              userId: session.user?.id,
            },
          });
        }
      }
      
      // 3. Registrar transacción en la caja si hay una abierta
      const openDrawer = await tx.cashDrawer.findFirst({
        where: {
          status: "OPEN",
        },
      });
      
      if (openDrawer) {
        await tx.cashTransaction.create({
          data: {
            drawerId: openDrawer.id,
            amount: -sale.total, // Valor negativo para indicar devolución
            type: "REFUND",
            description: `Cancelación de venta #${sale.receiptNumber}`,
            saleId: sale.id,
          },
        });
      }
      
      // Actualizar rutas para reflejar los cambios
      revalidatePath("/admin/pos/ventas");
      revalidatePath(`/admin/pos/ventas/${id}`);
      revalidatePath("/admin/inventario");
      
      return { success: true };
    });
  } catch (error) {
    console.error("Error cancelling sale:", error);
    return { success: false, error: "Error al cancelar la venta" };
  }
}