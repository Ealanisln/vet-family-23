'use server';

import { Prisma, InventoryCategory } from '@prisma/client';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prismaDB';

/**
 * Calculates the profit margin percentage between price and cost
 * @param price The selling price
 * @param cost The cost price
 * @returns The margin percentage or null if either price or cost is null
 */
export async function calculateMargin(price: number | null, cost: number | null): Promise<number | null> {
  if (price === null || cost === null || cost === 0) {
    return null;
  }
  
  const margin = ((price - cost) / price) * 100;
  return Number(margin.toFixed(1)); // Round to 1 decimal place
}

/**
 * Updates the price and cost of an inventory item
 * @param id The ID of the item to update
 * @param price The new price value
 * @param cost The new cost value
 * @returns Object with success status and updated item
 */
export async function updateItemPriceAndCost(id: string, price: number | null, cost: number | null) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    throw new Error('No autenticado');
  }

  const user = await getUser();
  if (!user || !user.id) {
    throw new Error('No se pudo obtener la información del usuario');
  }
  
  // Verificar permisos de administrador
  const userInDb = await prisma.user.findUnique({
    where: { kindeId: user.id },
    include: { userRoles: { include: { role: true } } }
  });
  
  const isAdmin = userInDb?.userRoles.some(userRole => userRole.role.key === "ADMIN");
  
  if (!isAdmin) {
    throw new Error('No autorizado');
  }

  try {
    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        price,
        cost,
        updatedAt: new Date(),
      },
    });
    
    revalidatePath('/admin/pos/inventario/precios');
    return { success: true, item: updated };
  } catch (error) {
    console.error('Error al actualizar precios:', error);
    throw new Error('Error al actualizar los precios');
  }
}

/**
 * Parameters for bulk price adjustment operations
 */
interface BulkPriceAdjustmentParams {
  category: InventoryCategory | null;
  adjustmentType: 'percent' | 'fixed';
  priceComponent: 'price' | 'cost' | 'both';
  adjustmentDirection: 'increase' | 'decrease';
  adjustmentValue: number;
}

/**
 * Generate a preview of bulk price adjustments without applying them
 */
export async function previewBulkPriceAdjustment({
  category,
  adjustmentType,
  priceComponent,
  adjustmentDirection,
  adjustmentValue,
}: BulkPriceAdjustmentParams) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    throw new Error('No autenticado');
  }

  const user = await getUser();
  if (!user || !user.id) {
    throw new Error('No se pudo obtener la información del usuario');
  }
  
  // Verificar permisos de administrador
  const userInDb = await prisma.user.findUnique({
    where: { kindeId: user.id },
    include: { userRoles: { include: { role: true } } }
  });
  
  const isAdmin = userInDb?.userRoles.some(userRole => userRole.role.key === "ADMIN");
  
  if (!isAdmin) {
    throw new Error('No autorizado');
  }

  try {
    // Construir la consulta
    const whereClause: Prisma.InventoryItemWhereInput = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    // Filtrar productos que tienen precio o costo dependiendo del componente a ajustar
    const orConditions: Prisma.InventoryItemWhereInput[] = [];
    
    if (priceComponent === 'price' || priceComponent === 'both') {
      orConditions.push({ price: { not: null } });
    }
    
    if (priceComponent === 'cost' || priceComponent === 'both') {
      orConditions.push({ cost: { not: null } });
    }
    
    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
    }
    
    // Obtener los productos afectados
    const products = await prisma.inventoryItem.findMany({
      where: whereClause,
      select: {
        id: true,
        price: true,
        cost: true,
      },
    });
    
    let totalBeforePrice = 0;
    let totalAfterPrice = 0;
    let totalBeforeCost = 0;
    let totalAfterCost = 0;
    let countPrice = 0;
    let countCost = 0;
    
    // Calcular promedios y nuevos valores
    products.forEach(product => {
      if ((priceComponent === 'price' || priceComponent === 'both') && product.price !== null) {
        totalBeforePrice += product.price;
        countPrice++;
        
        let newPrice = product.price;
        
        if (adjustmentType === 'percent') {
          const adjustmentMultiplier = adjustmentDirection === 'increase' 
            ? 1 + (adjustmentValue / 100) 
            : 1 - (adjustmentValue / 100);
          newPrice = product.price * adjustmentMultiplier;
        } else { // 'fixed'
          newPrice = adjustmentDirection === 'increase' 
            ? product.price + adjustmentValue 
            : product.price - adjustmentValue;
        }
        
        // Asegurarse de que el precio no sea negativo
        newPrice = Math.max(0, newPrice);
        totalAfterPrice += newPrice;
      }
      
      if ((priceComponent === 'cost' || priceComponent === 'both') && product.cost !== null) {
        totalBeforeCost += product.cost;
        countCost++;
        
        let newCost = product.cost;
        
        if (adjustmentType === 'percent') {
          const adjustmentMultiplier = adjustmentDirection === 'increase' 
            ? 1 + (adjustmentValue / 100) 
            : 1 - (adjustmentValue / 100);
          newCost = product.cost * adjustmentMultiplier;
        } else { // 'fixed'
          newCost = adjustmentDirection === 'increase' 
            ? product.cost + adjustmentValue 
            : product.cost - adjustmentValue;
        }
        
        // Asegurarse de que el costo no sea negativo
        newCost = Math.max(0, newCost);
        totalAfterCost += newCost;
      }
    });
    
    // Calcular promedios
    const averageBeforeAdjustment = priceComponent === 'price' 
      ? (countPrice > 0 ? totalBeforePrice / countPrice : 0) 
      : priceComponent === 'cost' 
        ? (countCost > 0 ? totalBeforeCost / countCost : 0) 
        : ((countPrice > 0 ? totalBeforePrice / countPrice : 0) + (countCost > 0 ? totalBeforeCost / countCost : 0)) / 2;
    
    const averageAfterAdjustment = priceComponent === 'price' 
      ? (countPrice > 0 ? totalAfterPrice / countPrice : 0) 
      : priceComponent === 'cost' 
        ? (countCost > 0 ? totalAfterCost / countCost : 0) 
        : ((countPrice > 0 ? totalAfterPrice / countPrice : 0) + (countCost > 0 ? totalAfterCost / countCost : 0)) / 2;
    
    return {
      affectedProducts: products.length,
      averageBeforeAdjustment,
      averageAfterAdjustment,
    };
  } catch (error) {
    console.error('Error al generar vista previa:', error);
    throw new Error('Error al generar la vista previa del ajuste');
  }
}

/**
 * Apply bulk price adjustments to inventory items
 */
export async function applyBulkPriceAdjustment({
  category,
  adjustmentType,
  priceComponent,
  adjustmentDirection,
  adjustmentValue,
}: BulkPriceAdjustmentParams) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    throw new Error('No autenticado');
  }

  const user = await getUser();
  if (!user || !user.id) {
    throw new Error('No se pudo obtener la información del usuario');
  }
  
  // Verificar permisos de administrador
  const userInDb = await prisma.user.findUnique({
    where: { kindeId: user.id },
    include: { userRoles: { include: { role: true } } }
  });
  
  const isAdmin = userInDb?.userRoles.some(userRole => userRole.role.key === "ADMIN");
  
  if (!isAdmin) {
    throw new Error('No autorizado');
  }

  try {
    // Construir la consulta
    const whereClause: Prisma.InventoryItemWhereInput = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    // Filtrar productos que tienen precio o costo dependiendo del componente a ajustar
    const orConditions: Prisma.InventoryItemWhereInput[] = [];
    
    if (priceComponent === 'price' || priceComponent === 'both') {
      orConditions.push({ price: { not: null } });
    }
    
    if (priceComponent === 'cost' || priceComponent === 'both') {
      orConditions.push({ cost: { not: null } });
    }
    
    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
    }
    
    // Obtener los productos afectados
    const products = await prisma.inventoryItem.findMany({
      where: whereClause,
      select: {
        id: true,
        price: true,
        cost: true,
      },
    });
    
    // Actualizar cada producto
    const updates = products.map(product => {
      const updates: Prisma.InventoryItemUpdateInput = { updatedAt: new Date() };
      
      if ((priceComponent === 'price' || priceComponent === 'both') && product.price !== null) {
        let newPrice = product.price;
        
        if (adjustmentType === 'percent') {
          const adjustmentMultiplier = adjustmentDirection === 'increase' 
            ? 1 + (adjustmentValue / 100) 
            : 1 - (adjustmentValue / 100);
          newPrice = product.price * adjustmentMultiplier;
        } else { // 'fixed'
          newPrice = adjustmentDirection === 'increase' 
            ? product.price + adjustmentValue 
            : product.price - adjustmentValue;
        }
        
        // Asegurarse de que el precio no sea negativo
        updates.price = Math.max(0, newPrice);
      }
      
      if ((priceComponent === 'cost' || priceComponent === 'both') && product.cost !== null) {
        let newCost = product.cost;
        
        if (adjustmentType === 'percent') {
          const adjustmentMultiplier = adjustmentDirection === 'increase' 
            ? 1 + (adjustmentValue / 100) 
            : 1 - (adjustmentValue / 100);
          newCost = product.cost * adjustmentMultiplier;
        } else { // 'fixed'
          newCost = adjustmentDirection === 'increase' 
            ? product.cost + adjustmentValue 
            : product.cost - adjustmentValue;
        }
        
        // Asegurarse de que el costo no sea negativo
        updates.cost = Math.max(0, newCost);
      }
      
      return prisma.inventoryItem.update({
        where: { id: product.id },
        data: updates,
      });
    });
    
    // Ejecutar todas las actualizaciones
    await Promise.all(updates);
    
    revalidatePath('/admin/pos/inventario/precios');
    return { success: true, updatedCount: products.length };
  } catch (error) {
    console.error('Error al aplicar ajuste:', error);
    throw new Error('Error al aplicar el ajuste de precios');
  }
}