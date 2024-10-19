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

async function createOrUpdateUser(user: any, maxRetries = 5) {
  console.log(
    "Starting createOrUpdateUser with user data:",
    JSON.stringify(user, null, 2)
  );

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        const dbUser = await prisma.user.upsert({
          where: { kindeId: user.id },
          update: {
            email: user.email,
            phone: user.phone,
            firstName: user.given_name,
            lastName: user.family_name,
            name: `${user.given_name} ${user.family_name}`.trim(),
            roles: user.roles || ["user"],
          },
          create: {
            kindeId: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.given_name,
            lastName: user.family_name,
            name: `${user.given_name} ${user.family_name}`.trim(),
            roles: user.roles || ["user"],
            visits: 0,
            nextVisitFree: false,
          },
        });

        console.log(
          `Attempt ${attempt}: User operation completed. Returned user data:`,
          JSON.stringify(dbUser, null, 2)
        );

        // Immediate verification
        const verifiedUser = await prisma.user.findUnique({
          where: { kindeId: user.id },
        });
        console.log(
          `Attempt ${attempt}: Verified user data from database:`,
          JSON.stringify(verifiedUser, null, 2)
        );

        if (
          !verifiedUser ||
          verifiedUser.firstName !== user.given_name ||
          verifiedUser.lastName !== user.family_name
        ) {
          throw new Error("User data not saved correctly");
        }

        return verifiedUser;
      });

      // Final verification (without delay)
      const finalVerifiedUser = await prisma.user.findUnique({
        where: { kindeId: user.id },
      });
      console.log(
        `Attempt ${attempt}: Final verified user data:`,
        JSON.stringify(finalVerifiedUser, null, 2)
      );

      if (
        !finalVerifiedUser ||
        finalVerifiedUser.firstName !== user.given_name ||
        finalVerifiedUser.lastName !== user.family_name
      ) {
        throw new Error("User data not consistent after final verification");
      }

      return finalVerifiedUser;
    } catch (dbError) {
      console.error(
        `Attempt ${attempt}: Error in createOrUpdateUser:`,
        dbError
      );
      if (attempt === maxRetries) {
        throw dbError;
      }
      // No delay between retries
    }
  }
  throw new Error("Failed to create or update user after max retries");
}

export async function POST(req: NextRequest) {
  console.log("Starting user registration process");

  try {
    const userData: KindeUserData = await req.json();
    console.log("Received user data:", JSON.stringify(userData, null, 2));

    const email = userData.identities[0]?.details?.email;
    const phone = userData.identities[0]?.details?.phone;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Either email or phone must be provided" },
        { status: 400 }
      );
    }

    let token = await getKindeToken();

    let registeredUser = await registerWithKinde(userData, token);
    console.log(
      "User registered with Kinde:",
      JSON.stringify(registeredUser, null, 2)
    );

    const userDataForDb = {
      id: registeredUser.id,
      email: email,
      phone: phone ? formatPhoneNumber(phone) : undefined,
      given_name: userData.profile.given_name,
      family_name: userData.profile.family_name,
      roles: userData.roles || ["user"],
    };

    const dbUser = await createOrUpdateUser(userDataForDb);
    console.log(
      "User successfully saved/updated in database:",
      JSON.stringify(dbUser, null, 2)
    );

    if (userData.send_invite && email) {
      try {
        const inviteResponse = await sendKindeInvite(registeredUser.id, token);
        console.log("Kinde invite response:", inviteResponse);
      } catch (inviteError) {
        console.error("Error sending invitation:", inviteError);
      }
    }

    console.log("User registration process completed successfully");
    return NextResponse.json({ kindeUser: registeredUser, dbUser: dbUser });
  } catch (error) {
    console.error("Error during user registration:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits.startsWith("52")) {
    return `+52${digits}`;
  }
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
