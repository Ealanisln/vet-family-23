// src/app/api/pos/inventory/price/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { prisma } from '@/lib/prismaDB';

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Actualizar precio y costo de un producto
export async function PUT(request: NextRequest) {
  const { isAuthenticated, getRoles } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const roles = await getRoles();
  const isAdmin = roles?.some((role) => role.key === 'admin');
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, price, cost } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID del producto es requerido' }, { status: 400 });
    }
    
    // Actualizar el producto
    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        price: price !== undefined ? price : null,
        cost: cost !== undefined ? cost : null,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({ success: true, item: updated }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar precios:', error);
    return NextResponse.json({ error: 'Error al actualizar los precios' }, { status: 500 });
  }
}