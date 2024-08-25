import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function AlertBanner() {
  return (
    <div
      className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mt-8 md:mt-0
    "
    >
      <div className="flex items-center">
        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-4" />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <Image
              src="/assets/banner/us-flag.svg"
              alt="US Flag"
              width={30}
              height={20}
              className="mb-2 sm:mb-0"
            />
            <p className="font-bold text-left sm:text-left sm:ml-2">
              Chips para mascotas: Nuevos requisitos para mascotas que ingresan a los Estados
              Unidos.
            </p>
          </div>
          <p className="text-sm text-left sm:text-left">
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
