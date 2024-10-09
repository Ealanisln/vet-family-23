// app/api/user/delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Custom error type for Kinde API errors
interface KindeApiError {
  errors: Array<{ code: string; message: string }>;
}

// Helper function to check if an error is a KindeApiError
function isKindeApiError(error: unknown): error is KindeApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as KindeApiError).errors)
  );
}

async function getKindeToken(): Promise<string> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;
  const tokenUrl = new URL("/api/kinde-token", baseUrl).toString();

  console.log("Fetching Kinde token from:", tokenUrl);

  try {
    const response = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Kinde token response status:", response.status);

    const responseText = await response.text();
    console.log("Kinde token response body:", responseText);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Kinde token: ${response.status} ${responseText}`
      );
    }

    const data = JSON.parse(responseText);
    if (!data.access_token) {
      throw new Error(`No access token in response: ${JSON.stringify(data)}`);
    }
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Kinde token:", error);
    throw error;
  }
}

async function deleteUserFromKinde(
  kindeUserId: string,
  token: string,
  isDeleteProfile: boolean = false
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_KINDE_ISSUER_URL;
  const url = new URL(`${baseUrl}/api/v1/user`);
  url.searchParams.append("id", kindeUserId);
  if (isDeleteProfile) {
    url.searchParams.append("is_delete_profile", "true");
  }

  console.log("Deleting user from Kinde. URL:", url.toString());

  try {
    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Kinde delete response status:", response.status);

    const responseText = await response.text();
    console.log("Kinde delete response body:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = responseText;
      }
      console.error("Kinde API Error Response:", errorData);
      throw new Error(
        `Failed to delete user from Kinde: ${JSON.stringify(errorData)}`
      );
    }

    const responseData = JSON.parse(responseText);
    console.log("Kinde delete success:", responseData);
  } catch (error) {
    console.error("Error in deleteUserFromKinde:", error);
    throw error;
  }
}

async function deleteUserFromDatabase(userId: string): Promise<void> {
  // Obtener todas las mascotas del usuario
  const userPets = await prisma.pet.findMany({ where: { userId } });

  // Eliminar todos los registros relacionados, incluyendo los de las mascotas
  await prisma.$transaction([
    // Eliminar registros relacionados con las mascotas
    prisma.medicalHistory.deleteMany({
      where: { petId: { in: userPets.map((pet) => pet.id) } },
    }),
    prisma.vaccination.deleteMany({
      where: { petId: { in: userPets.map((pet) => pet.id) } },
    }),
    // Eliminar registros relacionados directamente con el usuario
    prisma.visitHistory.deleteMany({ where: { userId } }),
    prisma.appointment.deleteMany({ where: { userId } }),
    prisma.billing.deleteMany({ where: { userId } }),
    prisma.reminder.deleteMany({ where: { userId } }),
    // Eliminar todas las mascotas del usuario
    prisma.pet.deleteMany({ where: { userId } }),
    // Finalmente, eliminar al usuario
    prisma.user.delete({ where: { id: userId } }),
  ]);
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, isDeleteProfile = false } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("Deleting user with ID:", userId);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found:", user);

    if (user.kindeId && !user.kindeId.startsWith("local_")) {
      try {
        console.log(
          "Attempting to delete user from Kinde. KindeId:",
          user.kindeId
        );
        const token = await getKindeToken();
        await deleteUserFromKinde(user.kindeId, token, isDeleteProfile);
        console.log("User successfully deleted from Kinde");
      } catch (error: unknown) {
        console.error("Error deleting user from Kinde:", error);
        if (error instanceof Error) {
          console.error("Kinde deletion error details:", error.message);
        } else if (isKindeApiError(error)) {
          console.error("Kinde API error:", error.errors);
        }
        // Decide whether to continue with local deletion or not
        // For now, we'll continue with the local deletion
      }
    } else {
      console.log(
        "User is not associated with Kinde or is a local user. Skipping Kinde deletion."
      );
    }

    console.log("Deleting user from local database");
    await deleteUserFromDatabase(userId);
    console.log("User successfully deleted from local database");

    return NextResponse.json({
      message: "User and related data deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error in DELETE route:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
