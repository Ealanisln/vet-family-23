// app/api/user/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

interface KindeUserData {
  profile: {
    given_name: string;
    family_name: string;
  };
  identities: Array<{
    type: string;
    details: {
      email?: string;
      phone?: string;
    };
  }>;
  roles?: string[];
  send_invite?: boolean;
  internalId?: string;
}

interface KindePayload {
  profile: {
    given_name: string;
    family_name: string;
  };
  identities: Array<{
    type: string;
    details: {
      email?: string;
      phone?: string;
    };
  }>;
}

const prisma = new PrismaClient();

function generateUserHash(user: any) {
  return createHash("md5").update(JSON.stringify(user)).digest("hex");
}

async function getKindeToken() {
  const baseUrl =
    process.env.KINDE_SITE_URL ||
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

    console.log("Response status:", response.status);

    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (!response.ok) {
      console.error(
        "Failed to fetch Kinde token:",
        response.status,
        responseText
      );
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

async function createOrUpdateUser(user: any) {
  console.log("Starting createOrUpdateUser with user data:", JSON.stringify(user, null, 2));

  const userData = {
    kindeId: user.id as string,
    email: user.email as string | null,
    phone: user.phone as string | null,
    firstName: user.given_name as string | null,
    lastName: user.family_name as string | null,
    name: user.given_name && user.family_name 
      ? `${user.given_name} ${user.family_name}` as string 
      : null,
    roles: user.roles as string[] | [],
    internalId: user.internalId as string | null,
  };

  console.log("Prepared user data for database:", JSON.stringify(userData, null, 2));

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const dbUser = await prisma.user.upsert({
        where: { kindeId: userData.kindeId },
        update: {
          email: userData.email,
          phone: userData.phone,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name,
          roles: userData.roles,
          internalId: userData.internalId,
        },
        create: {
          ...userData,
          visits: 0,
          nextVisitFree: false,
        },
      });

      console.log("User operation completed. Returned user data:", JSON.stringify(dbUser, null, 2));

      // Immediate verification within the same transaction
      const verifiedUser = await prisma.user.findUnique({
        where: { kindeId: userData.kindeId },
      });

      console.log("Verified user data from database:", JSON.stringify(verifiedUser, null, 2));

      if (JSON.stringify(dbUser) !== JSON.stringify(verifiedUser)) {
        console.warn("Warning: Discrepancy between upserted user and database record");
        console.log("Differences:", JSON.stringify(diffObjects(dbUser, verifiedUser), null, 2));
      }

      return { dbUser, verifiedUser };
    });

    return result.dbUser;
  } catch (dbError) {
    console.error("Error in createOrUpdateUser:", dbError);
    throw dbError;
  }
}

// Helper function to find differences between objects
function diffObjects(obj1: any, obj2: any) {
  const diff: any = {};
  Object.keys(obj1).forEach((key) => {
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      diff[key] = { obj1: obj1[key], obj2: obj2[key] };
    }
  });
  return diff;
}

function formatPhoneNumber(phone: string): string {
  // Eliminar todos los caracteres no numéricos
  const digits = phone.replace(/\D/g, "");

  // Asumimos que los números son de México (código de país +52)
  // Si el número no comienza con 52, lo añadimos
  if (!digits.startsWith("52")) {
    return `+52${digits}`;
  }

  // Si ya comienza con 52, solo añadimos el '+'
  return `+${digits}`;
}

async function registerWithKinde(userData: KindeUserData, token: string) {
  const kindePayload: KindePayload = {
    profile: {
      given_name: userData.profile.given_name,
      family_name: userData.profile.family_name,
    },
    identities: [
      {
        type: userData.identities[0].details.email ? "email" : "phone",
        details: {
          ...(userData.identities[0].details.email && {
            email: userData.identities[0].details.email,
          }),
          ...(userData.identities[0].details.phone && {
            phone: formatPhoneNumber(userData.identities[0].details.phone),
          }),
        },
      },
    ],
  };

  console.log(
    "Sending payload to Kinde:",
    JSON.stringify(kindePayload, null, 2)
  );

  const registerResponse = await fetch(
    `${process.env.NEXT_PUBLIC_KINDE_ISSUER_URL}/api/v1/user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(kindePayload),
    }
  );

  if (!registerResponse.ok) {
    const errorData = await registerResponse.json();
    console.error("Kinde registration error:", errorData);
    throw new Error(
      `Failed to register user with Kinde: ${JSON.stringify(errorData)}`
    );
  }

  return registerResponse.json();
}

export async function POST(req: NextRequest) {
  console.log("Starting user registration process");
  try {
    const userData: KindeUserData = await req.json();
    console.log("Received user data:", JSON.stringify(userData, null, 2));

    const email = userData.identities[0]?.details?.email;
    const phone = userData.identities[0]?.details?.phone;

    if (!email && !phone) {
      console.error("Missing email and phone");
      return NextResponse.json(
        { error: "Either email or phone must be provided" },
        { status: 400 }
      );
    }

    let token;
    try {
      token = await getKindeToken();
      console.log("Successfully obtained Kinde token");
    } catch (tokenError) {
      console.error("Error getting Kinde token:", tokenError);
      return NextResponse.json(
        { error: "Failed to authenticate with Kinde" },
        { status: 500 }
      );
    }

    if (!token) {
      console.error("No token received from getKindeToken");
      return NextResponse.json(
        { error: "Failed to get Kinde access token" },
        { status: 500 }
      );
    }

    let registeredUser;
    let dbUser;

    try {
      registeredUser = await registerWithKinde(userData, token);
      console.log(
        "User registered with Kinde:",
        JSON.stringify(registeredUser, null, 2)
      );

      dbUser = await createOrUpdateUser({
        id: registeredUser.id,
        email: email,
        phone: phone ? formatPhoneNumber(phone) : undefined,
        given_name: userData.profile.given_name,
        family_name: userData.profile.family_name,
        roles: userData.roles || [],
        internalId: userData.internalId,
      });
      console.log(
        "User saved/updated in database:",
        JSON.stringify(dbUser, null, 2)
      );
    } catch (error) {
      console.error("Error during user registration or database save:", error);
      return NextResponse.json(
        { error: "Failed to register user" },
        { status: 500 }
      );
    }

    if (userData.send_invite && email) {
      try {
        const inviteResponse = await sendKindeInvite(registeredUser.id, token);
        console.log("Kinde invite response:", inviteResponse);
      } catch (inviteError) {
        console.error("Error sending invitation:", inviteError);
        // Consider if you want to return an error response here or just log it
      }
    }

    console.log("User registration process completed successfully");
    return NextResponse.json({ kindeUser: registeredUser, dbUser: dbUser });
  } catch (error) {
    console.error("Unexpected error during user registration:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log("Prisma client disconnected");
  }
}

async function sendKindeInvite(userId: string, token: string) {
  const inviteResponse = await fetch(
    `${process.env.NEXT_PUBLIC_KINDE_ISSUER_URL}/api/v1/users/${userId}/invite`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!inviteResponse.ok) {
    throw new Error(`Failed to send invitation: ${inviteResponse.statusText}`);
  }

  return inviteResponse.json();
}
