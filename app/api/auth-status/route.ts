import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    let user = null;
    let authStatus = false;

    try {
      user = await getUser();
      console.log("User fetched successfully:", user);
    } catch (userError) {
      console.error("Error fetching user:", userError instanceof Error ? userError.message : String(userError));
    }
    
    try {
      authStatus = await isAuthenticated();
      console.log("Auth status fetched successfully:", authStatus);
    } catch (authError) {
      console.error("Error checking auth status:", authError instanceof Error ? authError.message : String(authError));
    }

    return NextResponse.json({ user, isAuthenticated: authStatus });
  } catch (error) {
    console.error("Error in auth-status API route:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}