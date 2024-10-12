import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaPhone } from "react-icons/fa";

interface ButtonProps {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const CustomButton: React.FC<ButtonProps> = ({
  href,
  children,
  onClick,
  icon,
}) => {
  const buttonClass =
    "text-white text-lg font-medium py-4 px-8 rounded-full transition duration-300 ease-in-out bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 flex items-center justify-center";

  const content = (
    <>
      {children}
      {icon && <span className="ml-1.5">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <button className={buttonClass}>{content}</button>
      </Link>
    );
  } else {
    return (
      <button className={buttonClass} onClick={onClick}>
        {content}
      </button>
    );
  }
};

const AppointmentDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <CustomButton icon={<FaPhone size={16} />}>
          Agenda una cita
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[75%] lg:max-w-[90%]">
        <DialogHeader>
          <DialogTitle>Reservar una Cita</DialogTitle>
          <DialogDescription>
            Elige un horario adecuado para tu cita.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-[70vh] min-h-[400px]">
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3UnNtdbGuwqDc9-InHC8YY2i2OjO9IHwYSdH79vz1TSPfWWe-fSDP5Gk1idbTbnttIJ-rqGGyP?gv=true"
            width="100%"
            height="100%"
            className="border-0"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Banner = () => {
  return (
    <div className="bg-header">
      <div className="mx-auto max-w-7xl pt-20 sm:pb-24 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="col-span-7 flex flex-col justify-evenly relative">
            <Image
              src="/assets/banner/star.svg"
              alt="star-image"
              width={95}
              height={97}
              className="absolute top-[-74px] right-[51px]"
            />
            <h1 className="text-midnightblue text-3xl md:text-5xl text-center lg:text-start font-semibold lh-133 pt-5">
              Bienvenido a Vet For Family
            </h1>
            <h3 className="text-black opacity-75 text-lg font-normal text-center lg:text-start pt-8">
              Porque entendemos que tu mascota no es solo un animal, sino parte
              de tu familia. Por ello ofrecemos el mejor servicio para tu mejor
              amigo. Nuestro compromiso es proporcionar atención de alta calidad
              y amorosa para garantizar la salud y felicidad de tus peludos.
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 pt-8 mx-auto lg:mx-0">
              <CustomButton href="/promociones">Promociones</CustomButton>
              <AppointmentDialog />
            </div>
          </div>
          <div className="col-span-5 flex justify-center xl:-mb-24 xl:-mr-32 pt-10 lg:pt-0">
            <picture>
              <source srcSet="/assets/banner/julio.webp" type="image/webp" />
              <source srcSet="/assets/banner/julio.png" type="image/png" />
              <Image
                src="/assets/banner/pride.png"
                alt="hero"
                width={900}
                height={805}
                className="rounded-lg"
                quality={75}
                placeholder="blur"
                blurDataURL="/assets/banner/pride-blur.webp"
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 900px"
              />
            </picture>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
