// src/app/actions/pos/services.ts
"use server";

import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PrismaClient, Prisma, ServiceCategory } from "@prisma/client";
import { randomUUID } from "crypto";

// Función auxiliar para verificar errores de Prisma
function isPrismaError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

// Custom error class para utilizar en casos específicos
class ServerActionError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ServerActionError";
  }
}

// Implement a singleton pattern for PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export async function createService(data: {
  name: string;
  description?: string;
  category: ServiceCategory;
  price: number;
  duration?: number;
}) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    // Verificar autenticación
    if (!(await isAuthenticated())) {
      throw new ServerActionError("No autorizado", 401);
    }
    
    // Obtener usuario de Kinde
    const kindeUser = await getUser();
    
    // Buscar o crear el usuario en la base de datos local
    let dbUser = await prisma.user.findFirst({
      where: {
        kindeId: kindeUser.id
      }
    });
    
    // Si el usuario no existe en la base de datos, crearlo
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          kindeId: kindeUser.id,
          firstName: kindeUser.given_name || "",
          lastName: kindeUser.family_name || "",
          email: kindeUser.email || "",
          name: kindeUser.given_name + " " + kindeUser.family_name
        }
      });
    }
    
    const service = await prisma.service.create({
      data: {
        id: randomUUID(),
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        duration: data.duration,
        isActive: true,
      },
    });
    
    revalidatePath("/admin/pos/servicios");
    
    return { success: true, service };
  } catch (error: unknown) {
    if (error instanceof ServerActionError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    console.error("Error creating service:", error);
    return { success: false, error: "Error al crear el servicio" };
  }
}

export async function updateService(id: string, data: {
  name: string;
  description?: string;
  category: ServiceCategory;
  price: number;
  duration?: number;
  isActive: boolean;
}) {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    // Verificar autenticación
    if (!(await isAuthenticated())) {
      throw new ServerActionError("No autorizado", 401);
    }
    
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        duration: data.duration,
        isActive: data.isActive,
      },
    });
    
    revalidatePath("/admin/pos/servicios");
    revalidatePath(`/admin/pos/servicios/${id}`);
    
    return { success: true, service };
  } catch (error: unknown) {
    if (error instanceof ServerActionError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return { success: false, error: "Servicio no encontrado" };
      }
    }
    console.error("Error updating service:", error);
    return { success: false, error: "Error al actualizar el servicio" };
  }
}

export async function deleteService(id: string) {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    // Verificar autenticación
    if (!(await isAuthenticated())) {
      throw new ServerActionError("No autorizado", 401);
    }
    
    // Verificar si el servicio está siendo utilizado en alguna venta
    const usageCount = await prisma.saleItem.count({
      where: {
        serviceId: id,
      },
    });
    
    if (usageCount > 0) {
      // Si está siendo utilizado, solo inactivarlo en lugar de eliminarlo
      await prisma.service.update({
        where: { id },
        data: {
          isActive: false,
        },
      });
      
      return { 
        success: true, 
        message: "El servicio ha sido desactivado ya que está siendo utilizado en ventas" 
      };
    }
    
    // Si no está siendo utilizado, eliminarlo completamente
    await prisma.service.delete({
      where: { id },
    });
    
    revalidatePath("/admin/pos/servicios");
    
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ServerActionError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return { success: false, error: "Servicio no encontrado" };
      }
    }
    console.error("Error deleting service:", error);
    return { success: false, error: "Error al eliminar el servicio" };
  }
}

export async function getServiceById(id: string) {
  try {
    return await prisma.service.findUnique({
      where: { id },
    });
  } catch (error: unknown) {
    console.error("Error fetching service:", error);
    throw error;
  }
}

export async function getServices({
  page = 1,
  limit = 50,
  category = null,
  isActive = null,
}: {
  page?: number;
  limit?: number;
  category?: ServiceCategory | null;
  isActive?: boolean | null;
}) {
  try {
    const whereClause: {
      category?: ServiceCategory;
      isActive?: boolean;
    } = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (isActive !== null) {
      whereClause.isActive = isActive;
    }
    
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        orderBy: {
          name: "asc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.service.count({
        where: whereClause,
      }),
    ]);
    
    return {
      services,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

export async function searchServices({
  searchTerm = "",
  category = null,
  isActive = true,
  limit = 24,
}: {
  searchTerm?: string;
  category?: ServiceCategory | null;
  isActive?: boolean | null;
  limit?: number;
}) {
  try {
    const whereClause: {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
      category?: ServiceCategory;
      isActive?: boolean;
    } = {};
    
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
    
    if (category) {
      whereClause.category = category;
    }
    
    if (isActive !== null) {
      whereClause.isActive = isActive;
    }
    
    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: {
        name: "asc",
      },
      take: limit,
    });
    
    return services;
  } catch (error: unknown) {
    console.error("Error searching services:", error);
    throw error;
  }
}