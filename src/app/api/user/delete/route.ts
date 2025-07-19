// app/api/user/delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

interface KindeApiError {
  errors: Array<{ code: string; message: string }>;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function isKindeApiError(error: unknown): error is KindeApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as KindeApiError).errors)
  );
}

async function getKindeToken(): Promise<TokenResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;
  const tokenUrl = new URL("/api/kinde-token", baseUrl).toString();

  console.log("Fetching Kinde token from:", tokenUrl);

  const response = await fetch(tokenUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
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
    throw new Error(`Invalid token response: ${JSON.stringify(data)}`);
  }
  return data;
}
async function refreshKindeToken(refreshToken: string): Promise<TokenResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;
  const tokenUrl = new URL("/api/kinde-token", baseUrl).toString();

  console.log("Refreshing Kinde token");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.status}`);
  }

  const data = await response.json();
  if (!data.access_token || !data.refresh_token) {
    throw new Error(`Invalid refresh token response: ${JSON.stringify(data)}`);
  }
  return data;
}

async function deleteUserFromKinde(
  kindeUserId: string,
  tokenResponse: TokenResponse,
  isDeleteProfile: boolean = false
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_KINDE_ISSUER_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_KINDE_ISSUER_URL is not set");
  }

  const url = new URL(`${baseUrl}/api/v1/user`);
  url.searchParams.append("id", kindeUserId);
  if (isDeleteProfile) {
    url.searchParams.append("is_delete_profile", "true");
  }

  console.log("Deleting user from Kinde. URL:", url.toString());

  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${tokenResponse.access_token}`,
    },
  });

  console.log("Kinde delete response status:", response.status);

  const responseText = await response.text();
  console.log("Kinde delete response body:", responseText);

  if (response.status === 401 || response.status === 403) {
    console.log("Token may be invalid or expired, attempting to refresh");
    const newTokenResponse = await refreshKindeToken(
      tokenResponse.refresh_token
    );
    return deleteUserFromKinde(kindeUserId, newTokenResponse, isDeleteProfile);
  }

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
}

async function deleteUserFromDatabase(userId: string): Promise<void> {
  const userPets = await prisma.pet.findMany({ where: { userId } });

  await prisma.$transaction([
    // Delete all medical records
    prisma.medicalHistory.deleteMany({
      where: { petId: { in: userPets.map((pet) => pet.id) } },
    }),
    // Delete all vaccinations
    prisma.vaccination.deleteMany({
      where: { petId: { in: userPets.map((pet) => pet.id) } },
    }),
    // Delete user's visit history
    prisma.visitHistory.deleteMany({ where: { userId } }),
    // Delete appointments
    prisma.appointment.deleteMany({ where: { userId } }),
    // Delete billing records
    prisma.billing.deleteMany({ where: { userId } }),
    // Delete reminders
    prisma.reminder.deleteMany({ where: { userId } }),
    // Delete pets
    prisma.pet.deleteMany({ where: { userId } }),
    // Delete user roles - Added this line to fix the error
    prisma.userRole.deleteMany({ where: { userId } }),
    // Finally delete the user
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
        const tokenResponse = await getKindeToken();
        await deleteUserFromKinde(user.kindeId, tokenResponse, isDeleteProfile);
        console.log("User successfully deleted from Kinde");
      } catch (error: unknown) {
        console.error("Error deleting user from Kinde:", error);
        if (error instanceof Error) {
          console.error("Kinde deletion error details:", error.message);
        } else if (isKindeApiError(error)) {
          console.error("Kinde API error:", error.errors);
        }

        // If the error is due to invalid credentials or token, we'll return an error response
        if (
          isKindeApiError(error) &&
          error.errors.some(
            (e) =>
              e.code === "INVALID_CREDENTIALS" || e.code === "TOKEN_INVALID"
          )
        ) {
          return NextResponse.json(
            { error: "Authentication failed with Kinde. Please try again." },
            { status: 401 }
          );
        }
        // For other errors, we'll log them but continue with local deletion
        console.log("Continuing with local deletion despite Kinde error");
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
