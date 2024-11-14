"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";

export function AlertBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center py-3 space-x-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          
          <div className="flex-1 space-y-0.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Image
                src="/assets/banner/us-flag.svg"
                alt="US Flag"
                width={24}
                height={16}
                className="object-contain"
              />
              <p className="font-medium text-sm text-yellow-800">
                Chips para mascotas: Nuevos requisitos para mascotas que ingresan a los Estados Unidos.
              </p>
            </div>
            <p className="text-xs text-yellow-600">
              Importante información para viajeros con mascotas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/blog/microchip-obligatorio-para-todos-los-perros-que-ingresen-a-los-estados-unidos"
              className="flex items-center bg-yellow-500 text-white px-3 py-1.5 rounded-md hover:bg-yellow-600 transition-colors whitespace-nowrap text-xs font-medium"
            >
              Más info
            </Link>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-yellow-100 rounded-full transition-colors"
              aria-label="Cerrar alerta"
            >
              <X className="h-4 w-4 text-yellow-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}