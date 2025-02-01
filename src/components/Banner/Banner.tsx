import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { CalendarDays, Stethoscope, Heart } from "lucide-react";
import AppointmentDialog, { CustomButton } from "../Clientes/AppointmentDialog";

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

export default function VetHero() {
  return (
    <section
      className="w-full py-20 md:py-28 lg:py-36 xl:py-44 overflow-x-hidden"
      style={{
        background:
          "linear-gradient(120.3deg, #91D8D9 31.56%, rgba(255, 255, 255, 0) 94.83%)",
      }}
    >
      <div className="container px-4 md:px-6 h-full mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px] h-full">
          <div className="flex flex-col justify-between h-full space-y-8">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                Salud y felicidad para tu mejor amigo.
              </h1>
              <p className="max-w-[600px] text-lg text-gray-600 md:text-xl py-2">
                Porque ellos no son solo mascotas, son familia. En Vet Family,
                cuidamos de tu ser querido con el mismo amor y dedicación que tú
                le brindas cada día.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <CustomButton href="/promociones">Promociones</CustomButton>
              <AppointmentDialog />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-8">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <span className="text-base font-semibold text-gray-700">
                  Atención de lunes a sábado
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <span className="text-base font-semibold text-gray-700">
                  Experiencia veterinaria a tu servicio
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-base font-semibold text-gray-700">
                  Amor y profesionalismo en un solo lugar
                </span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 relative h-full w-full">
          <Carousel className="w-full mx-auto">
          <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[4/3] lg:aspect-[3/4] xl:aspect-[4/3] w-full overflow-hidden rounded-xl">
                      <Image
                        src={image.src || "/placeholder.svg"}
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
