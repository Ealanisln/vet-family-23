import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { validateEmail, validatePhoneNumber, createErrorResponse, logError } from "@/lib/error-handling";

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

// const prisma = new PrismaClient(); // Replaced with import from lib

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

// Helper function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function createOrUpdateUser(
  user: {
    id: string;
    email?: string | null;
    phone?: string | null;
    given_name: string;
    family_name: string;
    roles?: string[];
  },
  maxRetries = 3 // Reduced from 5 to 3
) {
  console.log(
    "Starting createOrUpdateUser with user data:",
    JSON.stringify(user, null, 2)
  );

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Simplified transaction - removed redundant verification
      const dbUser = await prisma.user.upsert({
        where: { kindeId: user.id },
        update: {
          email: user.email,
          phone: user.phone,
          firstName: user.given_name,
          lastName: user.family_name,
          name: `${user.given_name} ${user.family_name}`.trim(),
          UserRole: {
            deleteMany: {}, // Remove existing roles
            create: (user.roles || ["user"]).map((role: string) => ({
              id: crypto.randomUUID(),
              Role: {
                connectOrCreate: {
                  where: { key: role },
                  create: { id: crypto.randomUUID(), key: role, name: role },
                },
              },
            })),
          },
        },
        create: {
          id: user.id,
          kindeId: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.given_name,
          lastName: user.family_name,
          name: `${user.given_name} ${user.family_name}`.trim(),
          visits: 0,
          nextVisitFree: false,
          updatedAt: new Date(),
          UserRole: {
            create: (user.roles || ["user"]).map((role: string) => ({
              id: crypto.randomUUID(),
              Role: {
                connectOrCreate: {
                  where: { key: role },
                  create: { id: crypto.randomUUID(), key: role, name: role },
                },
              },
            })),
          },
        },
        include: {
          UserRole: {
            include: {
              Role: true,
            },
          },
        },
      });

      console.log(
        `Attempt ${attempt}: User operation completed successfully`
      );
      
      return dbUser;

    } catch (dbError) {
      console.error(
        `Attempt ${attempt}: Error in createOrUpdateUser:`,
        dbError
      );
      
      if (attempt === maxRetries) {
        throw dbError;
      }
      
      // Exponential backoff: 100ms, 200ms, 400ms
      const delayMs = Math.pow(2, attempt) * 100;
      console.log(`Retrying in ${delayMs}ms...`);
      await delay(delayMs);
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
      const errorResponse = createErrorResponse("Se debe proporcionar correo electrónico o teléfono");
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate email format if provided
    if (email && !validateEmail(email)) {
      const errorResponse = createErrorResponse("El formato del correo electrónico no es válido");
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate phone format if provided
    if (phone && !validatePhoneNumber(phone)) {
      const errorResponse = createErrorResponse("El formato del número de teléfono no es válido");
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 🚀 NEW: Pre-check for existing users to prevent unnecessary Kinde API calls
    const formattedPhone = phone ? formatPhoneNumber(phone) : null;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email: email }] : []),
          ...(formattedPhone ? [{ phone: formattedPhone }] : []),
        ],
      },
      select: { id: true, email: true, phone: true },
    });

    if (existingUser) {
      console.warn("Duplicate user detected in local database:", {
        email: existingUser.email,
        phone: existingUser.phone,
      });
      return NextResponse.json(
        { error: "Ya existe un usuario con este correo electrónico o teléfono." },
        { status: 409 } // Conflict
      );
    }

    let token = await getKindeToken();

    let registeredUser;
    try {
      registeredUser = await registerWithKinde(userData, token);
      console.log(
        "User registered with Kinde:",
        JSON.stringify(registeredUser, null, 2)
      );
    } catch (kindeError) {
      // Check if it's the specific duplicate user error
      if (kindeError instanceof Error && kindeError.message.includes("USER_ALREADY_EXISTS")) {
        console.warn("Attempted to register an existing user:", userData.identities);
        return NextResponse.json(
          { error: "Ya existe un usuario con este correo electrónico o teléfono." },
          { status: 409 } // Conflict
        );
      }
      // Re-throw other Kinde errors
      throw kindeError;
    }

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
    logError(error, "user-registration");
    // Check if it's the duplicate user error we threw earlier
    if (error instanceof Error && error.message === "User with this email or phone already exists.") {
      return NextResponse.json({ error: "Ya existe un usuario con este correo electrónico o teléfono." }, { status: 409 });
    }
    // Check if it's a Kinde registration error that wasn't the duplicate
    if (error instanceof Error && error.message.startsWith("Failed to register user with Kinde:")) {
      return NextResponse.json(
        { error: "Error al registrar el usuario con el proveedor de autenticación.", details: error.message },
        { status: 500 }
      );
    }
    // Handle other generic errors
    return NextResponse.json(
      {
        error: "Ocurrió un error inesperado durante el registro.",
        details: error instanceof Error ? error.message : String(error),
      },
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
  const kindeDomain = process.env.KINDE_ISSUER_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const apiUrl = `https://${kindeDomain}/api/v1/user`;

  const payload: KindePayload = {
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
    JSON.stringify(payload, null, 2)
  );

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Kinde registration error response:", errorData);
    // Throw the specific error code if available
    if (errorData.errors && errorData.errors[0]?.code === 'USER_ALREADY_EXISTS') {
       throw new Error('USER_ALREADY_EXISTS: ' + errorData.errors[0]?.message);
    }
    throw new Error(
      `Failed to register user with Kinde: ${JSON.stringify(errorData)}`
    );
  }

  const result = await response.json();
  return result;
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