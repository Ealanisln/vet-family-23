"use client";

import * as React from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CldImage } from "next-cloudinary";

export function CarouselSpacing() {
  const imagePaths = Array.from({ length: 5 }).map(
    (_, index) =>
      `vet-for-family/area-maternidad/vet-family-maternidad-${index + 1}`
  );

  return (
    <div className="" id="caroussel">
      <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h3 className="text-3xl sm:text-4xl font-semibold text-black text-center my-10">
         Estamos estrenando nueva area de maternidad
        </h3>
        <h5 className="text-black opacity-60 text-lg font-normal text-center">
        Luna 🐶 ¡Explorando nuestra Nueva Área de Maternidad! 🎉🎉🎉 ¡Donde el cuidado es 24/7! 🌙✨
        </h5>
        <Carousel className="pt-8">
          <CarouselContent className="-ml-1">
            {imagePaths.map((path, index) => (
              <CarouselItem
                key={index}
                className="pl-1 md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1">
                  <Card className="bg-white rounded-2xl p-2 featureShadow">
                    <CardContent className="flex aspect-square items-center justify-center p-4">
                        <CldImage
                          width="500"
                          height="400"
                          crop="fill"
                          src={path}
                          sizes="100vw"
                          alt={`Nueva area de maternidad ${index + 1}`}
                        />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
