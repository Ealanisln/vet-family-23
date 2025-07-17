// src/app/api/pos/inventory/price/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { PrismaClient, Prisma } from '@prisma/client';

// Manual type definition due to Prisma client export issues
type InventoryCategory = 'MEDICINE' | 'SURGICAL_MATERIAL' | 'VACCINE' | 'FOOD' | 'ACCESSORY' | 'CONSUMABLE' | 'ANTI_INFLAMMATORY_ANALGESICS' | 'ANTIBIOTIC' | 'ANTIFUNGAL' | 'DEWORMERS' | 'GASTROPROTECTORS_GASTROENTEROLOGY' | 'CARDIOLOGY' | 'DERMATOLOGY' | 'ENDOCRINOLOGY_HORMONAL' | 'ANESTHETICS_SEDATIVES' | 'OTIC' | 'OINTMENTS' | 'RESPIRATORY' | 'OPHTHALMIC' | 'DRY_FOOD' | 'WET_FOOD' | 'CHIPS' | 'ANTI_EMETIC' | 'ANTISEPTICS_HEALING' | 'NEPHROLOGY' | 'ANTAGONISTS' | 'IMMUNOSTIMULANT' | 'APPETITE_STIMULANTS_HEMATOPOIESIS' | 'SUPPLEMENTS_OTHERS' | 'LAXATIVES' | 'ANTIDIARRHEAL' | 'ANTIHISTAMINE' | 'MEDICATED_SHAMPOO' | 'CORTICOSTEROIDS' | 'EXPECTORANT' | 'BRONCHODILATOR';
import { userHasPOSPermission } from '@/utils/pos-helpers';

// Implementación del patrón singleton para PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export const dynamic = "force-dynamic";

// Obtener vista previa de ajuste de precios
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación con Kinde
    const { isAuthenticated, getUser } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
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
        { error: "No tiene permisos para acceder al sistema POS" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      category,
      adjustmentType,
      priceComponent,
      adjustmentDirection,
      adjustmentValue
    } = body;
    
    if (!adjustmentType || !priceComponent || !adjustmentDirection || adjustmentValue === undefined) {
      return NextResponse.json({ error: 'Parámetros incompletos' }, { status: 400 });
    }
    
    // Construir la consulta
    const whereClause: any = {};
    
    if (category) {
      whereClause.category = category as InventoryCategory;
    }
    
    // Filtrar productos que tienen precio o costo dependiendo del componente a ajustar
    if (priceComponent === 'price' || priceComponent === 'both') {
      whereClause.price = { not: null };
    }
    
    if (priceComponent === 'cost' || priceComponent === 'both') {
      whereClause.cost = { not: null };
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
    
    return NextResponse.json({
      affectedProducts: products.length,
      averageBeforeAdjustment,
      averageAfterAdjustment,
    }, { status: 200 });
  } catch (error) {
    console.error('Error al generar vista previa:', error);
    return NextResponse.json({ error: 'Error al generar la vista previa del ajuste' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}