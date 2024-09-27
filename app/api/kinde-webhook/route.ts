import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";

// The Kinde issuer URL should already be in your `.env` file
// from when you initially set up Kinde. This will fetch your
// public JSON web keys file
const client = jwksClient({
  jwksUri: `${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`,
});

export async function POST(req: Request) {
  try {
    // Get the token from the request
    const token = await req.text();

    // Decode the token
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      throw new Error("Failed to decode token");
    }
    const { header } = decodedToken as { header: { kid: string } };
    const { kid } = header;

    // Verify the token
    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    const event = jwt.verify(token, signingKey);

    // Handle various events
    if (typeof event === "object" && event !== null && "type" in event) {
      switch (event.type) {
        case "user.updated":
          // Handle user updated event
          console.log("User updated:", event.data);
          break;
        case "user.created":
          // Handle user created event
          console.log("User created:", event.data);
          break;
        case "user.authenticated":
          // Handle user authenticated event
          console.log("User authenticated:", event.data);
          // You could also add logic here to update user session, etc.
          break;
        default:
          // Handle other unrecognized events
          console.log("Unhandled event type:", event.type);
          break;
      }
    }

  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
  }
  return NextResponse.json({ status: 200, statusText: "success" });
}
