import Image from "next/image";

interface datatype {
  imgSrc: string;
  heading: string;
  paragraph: string;
}

const Aboutdata: datatype[] = [
  {
    imgSrc: "/assets/features/consultation.svg",
    heading: "Consultas Médicas",
    paragraph:
      "Nuestros veterinarios altamente calificados brindan consultas médicas personalizadas para garantizar la salud óptima de tu mascota.",
  },
  {
    imgSrc: "/assets/features/vaccine.svg",
    heading: "Plan de Vacunación",
    paragraph:
      "Diseñamos planes de vacunación adaptados a las necesidades específicas de tu mascota para prevenir enfermedades y promover su bienestar.",
  },
  {
    imgSrc: "/assets/features/deworming.svg",
    heading: "Desparasitación",
    paragraph:
      "Mantenemos a tu mascota libre de parásitos con programas de desparasitación efectivos y seguros para su salud general.",
  },
  {
    imgSrc: "/assets/features/dental.svg",
    heading: "Limpieza Dental",
    paragraph:
      "Ofrecemos servicios de limpieza dental para garantizar una salud bucal óptima y prevenir problemas dentales en tu mascota.",
  },
  {
    imgSrc: "/assets/features/grooming.svg",
    heading: "Estética Canina",
    paragraph:
      "Nuestros estilistas caninos expertos brindan servicios de estética para que tu mascota luzca y se sienta en su mejor forma.",
  },
  {
    imgSrc: "/assets/features/nutrition.svg",
    heading: "Asesoría Nutricional",
    paragraph:
      "Contamos con asesores nutricionales para proporcionar una dieta equilibrada y adaptada a las necesidades específicas de tu mascota.",
  },
  {
    imgSrc: "/assets/features/surgery.svg",
    heading: "Cirugías",
    paragraph:
      "Realizamos procedimientos quirúrgicos con tecnología de vanguardia y atención especializada para el bienestar integral de tu mascota.",
  },
  {
    imgSrc: "/assets/features/pet-hotel.svg",
    heading: "Hotel para Gatos y Perros",
    paragraph:
      "Ofrecemos un alojamiento cómodo y seguro para tus mascotas, garantizando que se sientan cuidadas y felices mientras estás ausente.",
  },
];

const Servicios = () => {
  return (
    <div className="bg-babyblue" id="servicios">
      <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h3 className="text-4xl sm:text-5xl font-semibold text-black text-center my-10">
          Nuestros servicios:
        </h3>
        <h5 className="text-black opacity-60 text-lg font-normal text-center">
          Comprometidos con el bienestar de tus mascotas, ofrecemos una gama
          completa de servicios veterinarios de alta calidad para mantenerlas
          saludables y felices.
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-4 lg:gap-x-8 mt-10">
          {Aboutdata.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 featureShadow">
              <Image
                src={item.imgSrc}
                alt={item.imgSrc}
                width={55}
                height={55}
                className="mb-2"
              />
              <h3 className="text-2xl font-semibold text-black mt-5">
                {item.heading}
              </h3>
              <h4 className="text-lg font-normal text-black opacity-50 my-2">
                {item.paragraph}
              </h4>
              {/* <Link href={'/'} className="text-electricblue text-xl font-medium flex gap-2 pt-10 pb-2">
                                Learn more <Image src="/assets/people/arrow-right.svg" alt="arrow-right" width={24} height={24} />
                            </Link> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Servicios;
