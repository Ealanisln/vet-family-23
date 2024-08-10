import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { Cliente } from "../../../models/Cliente";

export async function GET(request: NextRequest) {
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";
  if (!isLoggedIn) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    const clientes = await Cliente.find({});
    return NextResponse.json({ success: true, data: clientes });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const cliente = await Cliente.create(body);
    return NextResponse.json({ success: true, data: cliente }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
