import { NextRequest, NextResponse } from "next/server";
import { prisma, safePrismaOperation } from "@/lib/prismaDB";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Fetch the client's pets with safe operation
    const pets = await safePrismaOperation(
      () => prisma.pet.findMany({
        where: {
          userId: id,
        },
        select: {
          id: true,
          name: true,
          species: true,
          breed: true,
          dateOfBirth: true,
          gender: true,
          weight: true,
          microchipNumber: true,
          internalId: true,
          isNeutered: true,
          isDeceased: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      [] // fallback empty array for build time
    );

    return NextResponse.json(pets);
  } catch (error) {
    console.error("Error fetching client pets:", error);
    return NextResponse.json(
      { error: "Failed to fetch pets" },
      { status: 500 }
    );
  }
} 