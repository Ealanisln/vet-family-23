"use server";

import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Cliente from "@/models/Cliente";
import mongoose from "mongoose";

function convertToPlainObject(doc: any) {
  const plainObject = doc.toObject ? doc.toObject() : { ...doc };

  // Convertimos _id a string
  if (plainObject._id) {
    plainObject._id = plainObject._id.toString();
  }

  // Convertimos fechas a ISO string si existen
  ["ultimaVisita"].forEach((field) => {
    if (plainObject[field]) {
      if (plainObject[field] instanceof Date) {
        plainObject[field] = plainObject[field].toISOString();
      } else {
        console.warn(
          `El campo ${field} no es una instancia de Date:`,
          plainObject[field]
        );
      }
    } else {
      console.warn(`El campo ${field} no existe en el documento:`, doc);
    }
  });

  return plainObject;
}

export async function getClienteById(id: string) {
  const isLoggedIn = cookies().get("isLoggedIn")?.value === "true";
  if (!isLoggedIn) {
    throw new Error("No autorizado");
  }

  try {
    await dbConnect();
    
    // Ensure the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID de cliente inválido");
    }

    const cliente = await Cliente.findById(id);
    
    if (!cliente) {
      throw new Error("Cliente no encontrado");
    }

    // Convert the document to a plain object
    const clientePlano = convertToPlainObject(cliente);
    
    return { success: true, data: clientePlano };
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    throw new Error("Error al obtener cliente");
  }
}