// src/components/HotelGallerySection/HotelGallerySection.tsx

import { Suspense } from "react";
import { Camera } from "lucide-react";
import HotelPhotosGallery from "./HotelPhotosGallery";

export default function HotelGallerySection() {
  return (
    <div className="py-16 bg-[#5dade2]/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nuestras Instalaciones</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conoce los espacios donde tu mascota disfrutará de su estancia.
          </p>
        </div>
        
        <Suspense fallback={
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 mb-4 mx-auto animate-bounce text-[#5dade2]" />
              <p className="text-lg text-gray-600">Cargando galería...</p>
            </div>
          </div>
        }>
          <HotelPhotosGallery />
        </Suspense>
      </div>
    </div>
  );
}