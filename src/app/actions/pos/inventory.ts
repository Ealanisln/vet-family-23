// src/app/actions/pos/inventory.ts
"use server";

import { Prisma } from "@prisma/client";

// Using string literals instead of importing enums due to type generation issues
type InventoryCategory = 'MEDICINE' | 'SURGICAL_MATERIAL' | 'VACCINE' | 'FOOD' | 'ACCESSORY' | 'CONSUMABLE' | 'ANTI_INFLAMMATORY_ANALGESICS' | 'ANTIBIOTIC' | 'ANTIFUNGAL' | 'DEWORMERS' | 'GASTROPROTECTORS_GASTROENTEROLOGY' | 'CARDIOLOGY' | 'DERMATOLOGY' | 'ENDOCRINOLOGY_HORMONAL' | 'ANESTHETICS_SEDATIVES' | 'OTIC' | 'OINTMENTS' | 'RESPIRATORY' | 'OPHTHALMIC' | 'DRY_FOOD' | 'WET_FOOD' | 'CHIPS' | 'ANTI_EMETIC' | 'ANTISEPTICS_HEALING' | 'NEPHROLOGY' | 'ANTAGONISTS' | 'IMMUNOSTIMULANT' | 'APPETITE_STIMULANTS_HEMATOPOIESIS' | 'SUPPLEMENTS_OTHERS' | 'LAXATIVES' | 'ANTIDIARRHEAL' | 'ANTIHISTAMINE' | 'MEDICATED_SHAMPOO' | 'CORTICOSTEROIDS' | 'EXPECTORANT' | 'BRONCHODILATOR';
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
    console.log('Searching inventory with:', { searchTerm, category, limit });
    
    /*
    // REMOVED - Middleware handles authentication
    const { isAuthenticated } = getKindeServerSession();
    
    // Verify authentication
    if (!(await isAuthenticated())) {
      throw new ServerActionError("No autorizado", 401);
    }
    */
    
    // Build the query to search for products - removing active and quantity filters temporarily
    const whereClause: Prisma.InventoryItemWhereInput = {};
    
    // Añadir filtro por categoría si se proporciona
    if (category) {
      whereClause.category = category;
    }
    
    // Añadir búsqueda por términos si se proporciona
    if (searchTerm && searchTerm.trim().length > 0) {
      whereClause.OR = [
        {
          name: {
            contains: searchTerm.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm.trim(),
            mode: 'insensitive',
          },
        },
        {
          activeCompound: {
            contains: searchTerm.trim(),
            mode: 'insensitive',
          },
        },
        {
          brand: {
            contains: searchTerm.trim(),
            mode: 'insensitive',
          },
        }
      ];
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2));
    
    // First, let's check how many total products match without any status/quantity filter
    const totalCount = await prisma.inventoryItem.count({
      where: whereClause,
    });
    
    console.log(`Total matching products (without filters): ${totalCount}`);

    // Now let's get all matching products to see their status and quantity
    const allProducts = await prisma.inventoryItem.findMany({
      where: whereClause,
      select: {
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
        activeCompound: true,
        brand: true,
      },
      orderBy: [
        { name: "asc" },
      ],
    });

    console.log('All matching products:', allProducts.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      quantity: p.quantity
    })));

    // Now filter for active products with stock
    const activeProducts = allProducts.filter(p => 
      p.status === "ACTIVE" && p.quantity > 0
    ).slice(0, limit);

    console.log(`Found ${activeProducts.length} active products with stock`);
    
    // Aplicar precio predeterminado y convertir fechas a ISO string
    const result = activeProducts.map(product => ({
      ...product,
      price: product.price as number,
      expirationDate: product.expirationDate?.toISOString() || null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt?.toISOString() || null,
    }));

    console.log('Returning products:', result.length);
    return result;
    
  } catch (error: unknown) {
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