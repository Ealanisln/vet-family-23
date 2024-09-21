import { NextResponse } from "next/server";
import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// api/user/fetch-by-id
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const { id } = await req.json();

    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    
    if (user) {
      const userObject = {
        ...user,
        _id: user._id.toString()
      };
      return NextResponse.json(userObject);
    } else {
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error("Error in POST /api/user/fetch-by-id:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}