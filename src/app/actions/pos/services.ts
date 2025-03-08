// src/app/actions/pos/services.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismaDB";
import type { Service } from "@/types/pos";

export async function createService(data: {
  name: string;
  description?: string;
  category: string;
  price: number;
  duration?: number;
}) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return { success: false, error: "No autorizado" };
    }
    
    const service = await prisma.service.create({
      data: {
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
  } catch (error) {
    console.error("Error creating service:", error);
    return { success: false, error: "Error al crear el servicio" };
  }
}

export async function updateService(id: string, data: {
  name: string;
  description?: string;
  category: string;
  price: number;
  duration?: number;
  isActive: boolean;
}) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return { success: false, error: "No autorizado" };
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
  } catch (error) {
    console.error("Error updating service:", error);
    return { success: false, error: "Error al actualizar el servicio" };
  }
}

export async function deleteService(id: string) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return { success: false, error: "No autorizado" };
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
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: "Error al eliminar el servicio" };
  }
}

export async function getServiceById(id: string) {
  try {
    return await prisma.service.findUnique({
      where: { id },
    });
  } catch (error) {
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
  category?: string | null;
  isActive?: boolean | null;
}) {
  try {
    const whereClause: any = {};
    
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
  } catch (error) {
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
  category?: string | null;
  isActive?: boolean | null;
  limit?: number;
}) {
  try {
    const whereClause: any = {};
    
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
  } catch (error) {
    console.error("Error searching services:", error);
    throw error;
  }
}