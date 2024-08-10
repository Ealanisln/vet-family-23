import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function AlertBanner() {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
      <div className="flex items-center">
        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-4" />
        <div className="flex-1">
          <p className="font-bold">
            Alerta: Nuevos requisitos para mascotas que ingresan a los Estados
            Unidos.
          </p>
          <p className="text-sm">
            Importante información para viajeros con mascotas
          </p>
        </div>
        <Link
          href="/blog/microchip-obligatorio-para-todos-los-perros-que-ingresen-a-los-estados-unidos"
          className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
        >
          Más info click aquí.
        </Link>
      </div>
    </div>
  );
}
