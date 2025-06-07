import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const pets = await prisma.pet.findMany({
      where: {
        userId: id,
      },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        isDeceased: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ success: true, pets });
  } catch (error) {
    console.error("Error fetching pets:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching pets" },
      { status: 500 }
    );
  }
} 