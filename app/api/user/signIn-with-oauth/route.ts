import { NextResponse } from "next/server";
import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// api/user/signIn-with-oauth
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const { account, profile } = await req.json();
    // console.log({ account, profile });

    const existingUser = await usersCollection.findOne({ email: profile.email });
    // console.log({existingUser});

    if (existingUser) {
      const updatedUser = await usersCollection.findOneAndUpdate(
        { _id: existingUser._id },
        {
          $set: {
            emailVerified: new Date(),
            image: profile.picture
          }
        },
        { returnDocument: 'after' }
      );

      if (!updatedUser) {
        console.error("Failed to update existing user");
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
      }

      return NextResponse.json(updatedUser);
    }

    const newUser = {
      name: profile.name,
      email: profile.email,
      image: profile.picture,
      provider: account.provider,
      emailVerified: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    const insertedUser = await usersCollection.findOne({ _id: result.insertedId });

    if (!insertedUser) {
      console.error("Failed to insert new user");
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    return NextResponse.json(insertedUser);
  } catch (error) {
    console.error("Error in POST /api/user/signIn-with-oauth:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}