"use client";

import Image from "next/image";
import AppointmentDialog, { CustomButton } from "../Clientes/AppointmentDialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

export default function VetFamilyHero() {
  const images = [
    {
      src: "/assets/banner/julio.png",
      alt: "Promociones de Julio",
    },
    {
      src: "/assets/banner/vacaciones.png",
      alt: "Promociones de Vacaciones",
    },
  ];

  return (
    <section
      className="relative w-full"
      style={{
        background:
          "linear-gradient(120.3deg, #91D8D9 31.56%, rgba(255, 255, 255, 0) 94.83%)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 xl:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12 md:pb-16 lg:pb-24">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-center max-w-7xl mx-auto">
          {/* Text content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8">
            <div className="relative">
              {/* Decorative star */}
              <div className="hidden lg:block absolute top-[-74px] right-[51px]">
                <Image
                  src="/assets/banner/star.svg"
                  alt="star-image"
                  width={95}
                  height={97}
                />
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-midnightblue text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-center lg:text-start font-semibold leading-tight relative z-10 max-w-4xl">
                  Bienvenido a Vet For Family
                </h1>

                <p className="text-black/75 text-base sm:text-lg lg:text-xl leading-relaxed text-center lg:text-start max-w-2xl lg:max-w-3xl mx-auto lg:mx-0 relative z-10">
                  Expertos en medicina, especialistas en amor. Tu mascota es única. En Vet Family transformamos la atención veterinaria en una experiencia extraordinaria. Con medicina y tecnología de vanguardia cuidamos de la salud y felicidad de quien más quieres. 🐶🐈
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-6 sm:pt-8 mx-auto lg:mx-0">
              <CustomButton href="/promociones">Promociones</CustomButton>
              <AppointmentDialog />
            </div>
          </div>

          {/* Image carousel */}
          <div className="lg:col-span-5 relative">
            <Carousel className="w-full max-w-xl sm:max-w-2xl mx-auto lg:max-w-none">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[4/3] lg:aspect-[3/4] xl:aspect-[4/3] w-full overflow-hidden rounded-xl">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover object-center"
                        priority={index === 0}
                        quality={75}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute -left-4 -right-4 top-1/2 -translate-y-1/2 flex justify-between">
                <CarouselPrevious className="relative" />
                <CarouselNext className="relative" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}