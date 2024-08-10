import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import { Cliente } from "../../../../../models/Cliente";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const cliente = await Cliente.findById(params.id);
    if (!cliente) {
      return NextResponse.json(
        { success: false, error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    cliente.visitas += 1;
    cliente.ultimaVisita = new Date();

    if (cliente.visitas % 6 === 0) {
      cliente.proximaVisitaGratis = true;
    } else if (cliente.proximaVisitaGratis) {
      cliente.proximaVisitaGratis = false;
    }

    await cliente.save();

    return NextResponse.json({ success: true, data: cliente });
  } catch (error) {
    console.error("Error al registrar visita:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar visita" },
      { status: 500 }
    );
  }
}
