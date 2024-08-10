"use server";

import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import {Cliente} from "@/models/Cliente";

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

export async function getClientes() {
  const isLoggedIn = cookies().get("isLoggedIn")?.value === "true";
  if (!isLoggedIn) {
    throw new Error("No autorizado");
  }

  try {
    await dbConnect();
    const clientes = await Cliente.find({});
    // Usamos map para convertir cada documento a un objeto plano
    const clientesPlanos = clientes.map(convertToPlainObject);
    return { success: true, data: clientesPlanos };
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw new Error("Error al obtener clientes");
  }
}
