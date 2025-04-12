import { prisma } from "@/lib/prismaDB";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ success: false, error: "Query parameter is required" }, { status: 400 });
    }

    const clients = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
      take: 10,
    });

    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error("Error searching clients:", error);
    return NextResponse.json(
      { success: false, error: "Error searching clients" },
      { status: 500 }
    );
  }
} 