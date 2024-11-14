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
      <div className="container px-6 xl:px-8 pt-20 pb-12 md:pb-16 lg:pb-24">
        <div className="grid gap-12 lg:grid-cols-12 items-center max-w-7xl mx-auto">
          {/* Text content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
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

              <div className="space-y-6">
                <h1 className="text-midnightblue text-3xl md:text-5xl text-center lg:text-start font-semibold leading-tight relative z-10">
                  Bienvenido a Vet For Family
                </h1>

                <p className="text-black/75 text-lg leading-relaxed text-center lg:text-start max-w-3xl relative z-10">
                  Donde tu familia peluda recibe el cuidado que merece. Cuidando
                  corazones peludos, combinamos experiencia veterinaria y amor
                  incondicional para mantener a tus mascotas saludables y
                  felices. En Vet Family, no solo tratamos pacientes, creamos
                  lazos para toda la vida.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center lg:justify-start">
              <CustomButton href="/promociones">Promociones</CustomButton>
              <AppointmentDialog />
            </div>
          </div>

          {/* Image carousel */}
          <div className="lg:col-span-5 relative">
            <Carousel className="w-full max-w-2xl mx-auto lg:max-w-none">
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
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 900px"
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