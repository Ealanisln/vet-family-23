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
      email: string;
      phone?: string;
    };
  }>;
}

interface KindePayload {
  profile: {
    given_name: string;
    family_name: string;
  };
  identities: Array<{
    type: string;
    details: {
      email: string;
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
  const userHash = generateUserHash(user);

  try {
    const dbUser = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { kindeId: user.id },
      });

      if (!existingUser || generateUserHash(existingUser) !== userHash) {
        return tx.user.upsert({
          where: { kindeId: user.id },
          update: {
            email: user.email || undefined,
            phone: user.phone || undefined,
            firstName: user.given_name || undefined,
            lastName: user.family_name || undefined,
            name:
              user.given_name && user.family_name
                ? `${user.given_name} ${user.family_name}`
                : user.given_name || user.family_name || undefined,
            roles: user.roles || [],
          },
          create: {
            kindeId: user.id,
            email: user.email || null,
            phone: user.phone || null,
            firstName: user.given_name || null,
            lastName: user.family_name || null,
            name:
              user.given_name && user.family_name
                ? `${user.given_name} ${user.family_name}`
                : user.given_name || user.family_name || null,
            roles: user.roles || [],
            visits: 0,
            nextVisitFree: false,
          },
        });
      }

      return existingUser;
    });

    console.log("User operation completed:", dbUser);
    return dbUser;
  } catch (dbError) {
    console.error("Error in createOrUpdateUser:", dbError);
    throw dbError;
  }
}

async function registerWithKinde(userData: KindeUserData, token: string) {
  const kindePayload: KindePayload = {
    profile: {
      given_name: userData.profile.given_name,
      family_name: userData.profile.family_name,
    },
    identities: [
      {
        type: "email",
        details: {
          email: userData.identities[0].details.email,
        },
      },
    ],
  };

  // If phone is provided, add it to the identity details
  if (userData.identities[0].details.phone) {
    kindePayload.identities[0].details.phone =
      userData.identities[0].details.phone;
  }

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

async function createLocalUser(userData: any) {
  const localKindeId = `local_${createHash("md5").update(userData.identities[0].details.phone).digest("hex")}`;

  return prisma.user.create({
    data: {
      kindeId: localKindeId,
      email: userData.identities[0].details.email || null,
      phone: userData.identities[0].details.phone,
      firstName: userData.profile.given_name,
      lastName: userData.profile.family_name,
      name: `${userData.profile.given_name} ${userData.profile.family_name}`,
      roles: userData.roles || [],
      visits: 0,
      nextVisitFree: false,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();
    console.log("Received user data:", JSON.stringify(userData, null, 2));

    const email = userData.identities[0]?.details?.email;
    const phone = userData.identities[0]?.details?.phone;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Either email or phone must be provided" },
        { status: 400 }
      );
    }

    let registeredUser;
    let dbUser;

    if (email) {
      // Si hay email, registramos en Kinde y luego en la base de datos local
      let token;
      try {
        token = await getKindeToken();
      } catch (tokenError) {
        console.error("Error getting Kinde token:", tokenError);
        return NextResponse.json(
          { error: "Failed to authenticate with Kinde" },
          { status: 500 }
        );
      }

      if (!token) {
        return NextResponse.json(
          { error: "Failed to get Kinde access token" },
          { status: 500 }
        );
      }

      try {
        registeredUser = await registerWithKinde(userData, token);
        dbUser = await createOrUpdateUser({
          id: registeredUser.id,
          email: email,
          phone: phone,
          given_name: userData.profile.given_name,
          family_name: userData.profile.family_name,
          roles: userData.roles || [],
        });
      } catch (error) {
        console.error("Error registering user with Kinde:", error);
        return NextResponse.json(
          { error: "Failed to register user with Kinde" },
          { status: 500 }
        );
      }

      // Enviar invitación si es necesario
      if (userData.send_invite) {
        try {
          const inviteResponse = await fetch(
            `${process.env.NEXT_PUBLIC_KINDE_ISSUER_URL}/api/v1/users/${registeredUser.id}/invite`,
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
            console.warn("Failed to send invitation to user");
          }
        } catch (inviteError) {
          console.error("Error sending invitation:", inviteError);
        }
      }
    } else {
      // Si solo hay teléfono, registramos solo en la base de datos local
      try {
        dbUser = await createLocalUser(userData);
      } catch (error) {
        console.error("Error creating local user:", error);
        return NextResponse.json(
          { error: "Failed to create local user" },
          { status: 500 }
        );
      }
    }

    // Ensure we're returning the dbUser in the response
    return NextResponse.json({ kindeUser: registeredUser, dbUser: dbUser });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
