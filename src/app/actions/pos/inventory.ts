// src/app/actions/pos/inventory.ts
"use server";

import { Prisma, InventoryCategory } from "@prisma/client";
// Removed unused import
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prismaDB";

// Función auxiliar para verificar errores de Prisma
function isPrismaError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

// Custom error class para manejar errores específicos
class ServerActionError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ServerActionError";
  }
}

// Define a type for the selected fields in searchInventory
type SelectedInventoryItem = Prisma.InventoryItemGetPayload<{ 
  select: { 
    id: true,
    name: true,
    description: true,
    price: true,
    quantity: true,
    presentation: true,
    category: true,
    status: true,
    expirationDate: true,
    createdAt: true,
    updatedAt: true,
  }
}>;

/**
 * Obtiene productos disponibles para ventas
 */
export async function getInventoryForSale({
  page = 1,
  limit = 24,
  category = null,
  searchTerm = "",
}: {
  page?: number;
  limit?: number;
  category?: InventoryCategory | null;
  searchTerm?: string;
}) {
  try {
    /*
    // REMOVED - Middleware handles authentication
    const { isAuthenticated } = getKindeServerSession();
    
    // Verify authentication
    if (!(await isAuthenticated())) {
      throw new ServerActionError("No autorizado", 401);
    }
    */
    
    // Build the query to get only active products with stock
    const whereClause: Prisma.InventoryItemWhereInput = {
      status: "ACTIVE",
      quantity: { gt: 0 } // Solo productos con stock disponible
    };
    
    // Añadir filtro por categoría si se proporciona
    if (category) {
      whereClause.category = category;
    }
    
    // Añadir búsqueda por términos si se proporciona
    if (searchTerm) {
      whereClause.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    // Consultar productos con paginación
    const [products, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: whereClause,
        orderBy: {
          name: "asc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventoryItem.count({
        where: whereClause,
      }),
    ]);
    
    // Aplicar precio predeterminado a los productos que no lo tengan
    const productsWithPrice = applyDefaultPrice(products);
    
    return {
      products: productsWithPrice,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  } catch (error: unknown) {
    if (error instanceof ServerActionError) {
      throw error;
    }
    console.error("Error fetching inventory for sale:", error);
    throw new ServerActionError("Error al obtener el inventario");
  }
}

/**
 * Busca productos por término de búsqueda
 */
export async function searchInventory({
  searchTerm = "",
  category = null,
  limit = 10,
}: {
  searchTerm?: string;
  category?: InventoryCategory | null;
  limit?: number;
}) {
  try {
    /*
    // REMOVED - Middleware handles authentication
    const { isAuthenticated } = getKindeServerSession();
    
    // Verify authentication
    if (!(await isAuthenticated())) {
      throw new ServerActionError("No autorizado", 401);
    }
    */
    
    // Build the query to search for products
    const whereClause: Prisma.InventoryItemWhereInput = {
      status: "ACTIVE",
      quantity: { gt: 0 } // Solo productos con stock disponible
    };
    
    // Añadir filtro por categoría si se proporciona
    if (category) {
      whereClause.category = category;
    }
    
    // Añadir búsqueda por términos si se proporciona
    if (searchTerm) {
      whereClause.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    // Buscar productos
    const products = await prisma.inventoryItem.findMany({
      where: whereClause,
      select: { // Explicitly select fields
        id: true,
        name: true,
        description: true,
        price: true,
        quantity: true,
        presentation: true,
        measure: true,
        category: true,
        status: true,
        expirationDate: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
      take: limit,
    });
    
    // Aplicar precio predeterminado y convertir fechas a ISO string
    const productsWithPrice = applyDefaultPrice(products);
    return productsWithPrice.map(product => ({
      ...product,
      price: product.price as number,
      expirationDate: product.expirationDate?.toISOString() || null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt?.toISOString() || null,
    }));
    
  } catch (error: unknown) {
    if (error instanceof ServerActionError) {
      throw error;
    }
    console.error("Error searching inventory:", error);
    throw new ServerActionError("Error al buscar en el inventario");
  }
}

/**
 * Obtiene un producto por su ID
 */
export async function getProductById(id: string) {
  try {
    /*
    // REMOVED - Middleware handles authentication
    const { isAuthenticated } = getKindeServerSession();
    
    // Verify authentication
    if (!(await isAuthenticated())) {
      throw new ServerActionError("No autorizado", 401);
    }
    */
    
    const product = await prisma.inventoryItem.findUnique({
      where: { id },
    });
    
    if (!product) {
      throw new ServerActionError("Producto no encontrado", 404);
    }
    
    // Aplicar precio predeterminado si es necesario
    return product.price === undefined || product.price === null 
      ? { ...product, price: 0.00 }
      : product;
    
  } catch (error: unknown) {
    if (error instanceof ServerActionError) {
      throw error;
    }
    if (isPrismaError(error) && error.code === "P2025") {
      throw new ServerActionError("Producto no encontrado", 404);
    }
    console.error("Error fetching product:", error);
    throw new ServerActionError("Error al obtener el producto");
  }
}

// Agregar precio predeterminado si es necesario
function applyDefaultPrice(products: SelectedInventoryItem[]) {
  return products.map(product => {
    // Si el producto no tiene un precio definido, asignar 0.00
    if (product.price === undefined || product.price === null) {
      return {
        ...product,
        price: 0.00
      };
    }
    return product;
  });
}