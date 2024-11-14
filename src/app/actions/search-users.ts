// app/actions/search-users.ts
"use server";

import { prisma } from "@/lib/prismaDB";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { z } from "zod";

const searchParamsSchema = z.object({
  query: z.string().default(""),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(10),
});

export type SearchResults = {
  users: Array<{
    id: string;
    kindeId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    phone: string | null;
    address: string | null;
    preferredContactMethod: string | null;
    pet: string | null;
    visits: number;
    nextVisitFree: boolean;
    lastVisit: Date | null;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
  }>;
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    pageSize: number;
  };
};

export async function searchUsers(
  params: z.infer<typeof searchParamsSchema>
): Promise<SearchResults> {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate params
    const { query, page, pageSize } = searchParamsSchema.parse(params);
    const skip = (page - 1) * pageSize;

    // Create the search conditions for MongoDB
    const whereCondition = query
      ? {
          OR: [
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { phone: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.user.count({
      where: whereCondition as any, // Type assertion needed for MongoDB specific operators
    });

    // Get the users
    const users = await prisma.user.findMany({
      where: whereCondition as any, // Type assertion needed for MongoDB specific operators
      select: {
        id: true,
        kindeId: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        phone: true,
        address: true,
        preferredContactMethod: true,
        pet: true,
        visits: true,
        nextVisitFree: true,
        lastVisit: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data
    const transformedUsers = users.map((user) => {
      const { userRoles, ...rest } = user;
      return {
        ...rest,
        roles: userRoles.map((ur) => ur.role.key),
      };
    });

    return {
      users: transformedUsers,
      pagination: {
        total,
        pages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  } catch (error) {
    console.error("Search Users Error:", error);
    throw error;
  } finally {
    // In development, don't actually disconnect as this would cause issues
    if (process.env.NODE_ENV === "production") {
      await prisma.$disconnect();
    }
  }
}
