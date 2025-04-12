import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const Custom404: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg overflow-hidden">
        <CardContent className="flex flex-col items-center space-y-6 py-8">
          <div className="w-full h-48 relative">
            <Image
              src="/assets/notfound/not-found.png"
              alt="Error 404 - Animales"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="w-24 h-24 relative">
            <Image
              src="/assets/logo/logo.svg"
              alt="Vet Family"
              fill
              className="object-contain"
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-6xl font-bold text-gray-800">error 404</h1>
            <p className="text-gray-600">Página no encontrada</p>
          </div>

          <Link
            href="/"
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Volver al inicio
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Custom404;
