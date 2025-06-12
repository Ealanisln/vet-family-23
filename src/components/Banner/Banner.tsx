"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { CalendarDays, Stethoscope, Heart, Sparkles } from "lucide-react";
import AppointmentDialog, { CustomButton } from "../Clientes/AppointmentDialog";

interface BannerImage {
  src: string;
  alt: string;
}

const images: BannerImage[] = [
  {
    src: "/assets/banner/march-25.png",
    alt: "Vet Family",
  },
  {
    src: "/assets/banner/marca-gto.png",
    alt: "Marca Guanajuato",
  }
];

export default function VetHero() {
  return (
    <section className="w-full min-h-screen flex items-center py-4 md:py-12 overflow-hidden relative">
      {/* Modern gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50"
        style={{
          background: "linear-gradient(135deg, #f0fdfa 0%, #e6fffa 25%, #ccfbf1 50%, #99f6e4 75%, #5eead4 100%)"
        }}
      />
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(20,184,166,0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.08),transparent)] pointer-events-none" />
      
      {/* Pride Month rainbow accent - Made bigger */}
      <div className="absolute top-0 left-0 w-full h-3 md:h-4 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-cyan-400 via-blue-400 via-purple-400 to-pink-400 opacity-80 shadow-lg" />
      
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col space-y-6 py-4">
          {/* Image Section - Mobile */}
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 rounded-3xl blur-2xl transform scale-105" />
              
              <Carousel className="w-full relative z-10">
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-square w-full overflow-hidden rounded-3xl shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                        <Image
                          src={image.src || "/placeholder.svg"}
                          alt={image.alt}
                          fill
                          className="object-cover object-center hover:scale-105 transition-transform duration-700"
                          priority={index === 0}
                          quality={75}
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute -left-4 -right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <CarouselPrevious className="relative bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 shadow-lg pointer-events-auto" />
                  <CarouselNext className="relative bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 shadow-lg pointer-events-auto" />
                </div>
              </Carousel>
            </div>
          </div>

          {/* Content Section - Mobile */}
          <div className="flex flex-col space-y-6 text-center">
            {/* Pride Month badge - Made bigger */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200/70 rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-sm md:text-base font-semibold text-purple-700">
                  Celebrando la diversidad - Mes del Orgullo 🏳️‍🌈
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-teal-700 to-cyan-700">
                Salud y felicidad para tu mejor amigo.
              </h1>
              <p className="text-base text-gray-700 leading-relaxed px-4">
                Porque ellos no son solo mascotas, son familia. En Vet Family,
                cuidamos de tu ser querido con el mismo amor y dedicación que tú
                le brindas cada día.
              </p>
            </div>

            {/* Buttons - Mobile - Reordered */}
            <div className="flex flex-col gap-4 px-4">
              <CustomButton
                href="/promociones"
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 rounded-xl border-0 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Promociones</span>
              </CustomButton>
              
              <CustomButton
                href="/hotel-mascotas"
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 rounded-xl border-0 flex items-center justify-center"
              >
                Hotel Canino
              </CustomButton>

              {/* Moved to bottom */}
              <div className="w-full flex justify-center">
                <AppointmentDialog />
              </div>
            </div>

            {/* Info cards - Mobile */}
            <div className="grid grid-cols-1 gap-3 px-4">
              <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:bg-white/80 transition-all duration-300 group">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Atención de lunes a sábado
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:bg-white/80 transition-all duration-300 group">
                <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Experiencia veterinaria a tu servicio
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:bg-white/80 transition-all duration-300 group">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Amor y profesionalismo en un solo lugar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px] items-center min-h-[calc(100vh-8rem)]">
          
          {/* Content Section - Desktop */}
          <div className="flex flex-col justify-center space-y-8">
            
            {/* Pride Month badge - Made bigger */}
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200/70 rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <span className="text-base lg:text-lg font-bold text-purple-700">
                  Celebrando la diversidad - Mes del Orgullo 🏳️‍🌈
                </span>
              </div>
            </div>

            <div className="space-y-6 text-left">
              <h1 className="text-5xl xl:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-teal-700 to-cyan-700">
                Salud y felicidad para tu mejor amigo.
              </h1>
              <p className="max-w-[600px] text-lg xl:text-xl text-gray-700 leading-relaxed">
                Porque ellos no son solo mascotas, son familia. En Vet Family,
                cuidamos de tu ser querido con el mismo amor y dedicación que tú
                le brindas cada día.
              </p>
            </div>

            {/* Buttons - Desktop - Reordered */}
            <div className="flex flex-col gap-4 items-start">
              <CustomButton
                href="/promociones"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 rounded-xl border-0 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Promociones</span>
              </CustomButton>
              
              <CustomButton
                href="/hotel-mascotas"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 rounded-xl border-0 flex items-center justify-center"
              >
                Hotel Canino
              </CustomButton>

              {/* Moved to bottom */}
              <AppointmentDialog />
            </div>

            {/* Info cards - Desktop */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-4 p-5 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:bg-white/80 transition-all duration-300 group">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-semibold text-gray-800">
                  Atención de lunes a sábado
                </span>
              </div>
              
              <div className="flex items-center space-x-4 p-5 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:bg-white/80 transition-all duration-300 group">
                <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-semibold text-gray-800">
                  Experiencia veterinaria a tu servicio
                </span>
              </div>
              
              <div className="flex items-center space-x-4 p-5 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:bg-white/80 transition-all duration-300 group">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-semibold text-gray-800">
                  Amor y profesionalismo en un solo lugar
                </span>
              </div>
            </div>
          </div>

          {/* Image Section - Desktop */}
          <div className="relative h-full w-full flex items-center">
            <div className="relative w-full">
              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 rounded-3xl blur-2xl transform scale-105" />
              
              <Carousel className="w-full mx-auto relative z-10">
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-[3/4] xl:aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                        <Image
                          src={image.src || "/placeholder.svg"}
                          alt={image.alt}
                          fill
                          className="object-cover object-center hover:scale-105 transition-transform duration-700"
                          priority={index === 0}
                          quality={75}
                          sizes="(max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute -left-6 -right-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <CarouselPrevious className="relative bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 shadow-lg pointer-events-auto" />
                  <CarouselNext className="relative bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 shadow-lg pointer-events-auto" />
                </div>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
