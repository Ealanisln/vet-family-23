import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    const user = await getUser();
    const authStatus = await isAuthenticated();

    console.log("User:", user);
    console.log("Is Authenticated:", authStatus);

    return NextResponse.json({ user, isAuthenticated: authStatus });
  } catch (error) {
    console.error("Error in auth-status API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}