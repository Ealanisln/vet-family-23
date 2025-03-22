// src/components/HotelPhotosGallery/HotelPhotosGallery.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Camera, AlertTriangle } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Image from "next/image";

interface CloudinaryImage {
  id: string;
  alt: string;
}

export default function HotelPhotosGallery() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Updated images with the correct IDs from your Cloudinary account
  const hotelImages: CloudinaryImage[] = [
    { id: "vet-for-family/hotel-perros/ypjcihekt71zkgbyqjbv", alt: "Hotel para mascotas 1" },
    { id: "vet-for-family/hotel-perros/xarz3gjafbuup1ijf7rv", alt: "Hotel para mascotas 2" },
    { id: "vet-for-family/hotel-perros/coxltd3zrmmmtpdpbanz", alt: "Hotel para mascotas 3" },
    { id: "vet-for-family/hotel-perros/qysuxb1boualpping3jx", alt: "Hotel para mascotas 4" },
    { id: "vet-for-family/hotel-perros/ngybnwskevi9qvi0qbhn", alt: "Hotel para mascotas 5" },
    { id: "vet-for-family/hotel-perros/d7acmb93aynh8quqqx7t", alt: "Hotel para mascotas 6" },
    { id: "vet-for-family/hotel-perros/nyxuyigy1xtyyfjerq5z", alt: "Hotel para mascotas 7" },
    { id: "vet-for-family/hotel-perros/gh2efzghqmhvyycma2xy", alt: "Hotel para mascotas 8" },
    { id: "vet-for-family/hotel-perros/b31ghpvl3voewifop3rd", alt: "Hotel para mascotas 9" },
    { id: "vet-for-family/hotel-perros/jolgg3hfsob32gwh664s", alt: "Hotel para mascotas 10" }
  ];

  const cloudName = "dvf2zo2ee";

  // Function to create a Cloudinary URL with proper format
  const getCloudinaryUrl = (publicId: string) => {
    // Using format to ensure compatibility
    const transformations = "f_auto,q_auto";
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
  };

  useEffect(() => {
    // Simulate data loading for consistent UI behavior
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 mb-4 mx-auto animate-bounce text-[#5dade2]" />
          <p className="text-lg text-gray-600">Cargando galería...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mb-4 mx-auto text-orange-500" />
          <p className="text-lg text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h3 className="text-3xl font-bold text-center mb-4">Galería del Hotel</h3>
        <p className="text-gray-600 text-center max-w-3xl mx-auto">
          Explora los espacios donde tu mascota disfrutará durante su estancia con nosotros.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {hotelImages.map((image, index) => (
          <div 
            key={image.id} 
            className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
            onClick={() => setLightboxIndex(index)}
          >
            <div className="relative w-full h-full">
              <Image
                src={getCloudinaryUrl(image.id)}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority={index < 4} // Prioritize loading for the first 4 images
                onError={() => {
                  console.error(`Error loading image: ${image.id}`);
                  setError(`Error loading some images. Please try again later.`);
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
          </div>
        ))}
      </motion.div>

      {lightboxIndex >= 0 && (
        <Lightbox
          slides={hotelImages.map(image => ({ 
            src: getCloudinaryUrl(image.id),
            alt: image.alt
          }))}
          open={true}
          index={lightboxIndex}
          close={() => setLightboxIndex(-1)}
        />
      )}
    </div>
  );
}