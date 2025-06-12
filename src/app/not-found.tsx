import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const Custom404: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-teal-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.1),transparent)] pointer-events-none" />
      
      <Card className="w-full max-w-lg backdrop-blur-sm bg-white/80 border-white/60 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-teal-50/30 pointer-events-none" />
        
        <CardContent className="flex flex-col items-center space-y-8 py-12 px-8 relative z-10">
          {/* Main illustration */}
          <div className="w-full h-56 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-200/40 to-cyan-200/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src="/assets/notfound/not-found.png"
                alt="Error 404 - Animales"
                fill
                className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>

          {/* Text content with modern typography */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 tracking-tight">
                404
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mx-auto" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">
                Página no encontrada
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-sm">
                Lo sentimos, la página que buscas no existe o ha sido movida.
              </p>
            </div>
          </div>

          {/* Modern CTA button */}
          <Link
            href="/"
            className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-teal-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-teal-500/25 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <svg 
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </span>
          </Link>

          {/* Subtle help text */}
          <p className="text-gray-500 text-sm text-center">
            ¿Necesitas ayuda? Contacta con nuestro equipo de soporte
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Custom404;
