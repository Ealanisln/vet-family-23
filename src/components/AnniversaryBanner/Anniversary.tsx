"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

const AnniversaryBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <>
      {/* Spacer div to push content down */}
      <div className="h-8" />
      
      {/* Banner */}
      <div className="absolute top-[84px] left-0 right-0 bg-purple-600 text-white z-40 px-1">
        <div className="w-full flex items-center justify-center py-2 px-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎉</span>
            <Link 
              href="/blog/tombola-de-2-aniversario-vet-family"
              className="hover:text-gray-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <p className="text-center text-sm sm:text-base font-medium">
                  ¡TÓMBOLA DE ANIVERSARIO! 🎁 Participa del 7 al 28 de febrero y gana increíbles premios
                </p>
              </div>
            </Link>
            <span className="text-xl">🎈</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors"
            aria-label="Cerrar banner"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AnniversaryBanner;