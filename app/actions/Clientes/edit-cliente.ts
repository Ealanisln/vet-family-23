// app/actions/Clientes/edit-cliente.ts
"use server";

import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Cliente from "@/models/Cliente";
import { ICliente } from "@/types/";

export async function editCliente(clienteId: string, updatedData: Partial<ICliente>) {
  const isLoggedIn = cookies().get("isLoggedIn")?.value === "true";
  if (!isLoggedIn) {
    throw new Error("No autorizado");
  }

  try {
    await dbConnect();
    const updatedCliente = await Cliente.findByIdAndUpdate(
      clienteId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedCliente) {
      throw new Error("Cliente no encontrado");
    }

    return { success: true, data: updatedCliente.toObject() };
  } catch (error) {
    console.error("Error al editar cliente:", error);
    throw new Error("Error al editar cliente");
  }
}