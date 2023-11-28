"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface datatype {
  imgSrc: string;
  heading: string;
  paragraph: string;
  link: string;
}

const Medios: datatype[] = [
  {
    imgSrc: "/assets/location/phone.svg",
    heading: "Teléfono clinica",
    paragraph: "477-332-7152. Nuestros horarios son de 9 a 9 pm de Lunes a Viernes.",
    link: "tel:477-332-7152",
  },
  {
    imgSrc: "/assets/location/whats.svg",
    heading: "Whatsapp",
    paragraph:
      "477-260-57-43. Contacta con nosotros a través de Whatsapp para obtener información adicional.",
    link: "https://wa.link/u5njd1",
  },
  {
    imgSrc: "/assets/location/facebook.svg",
    heading: "Facebook",
    paragraph:
      "Síguenos en Facebook para mantenerte al día con nuestras últimas novedades y eventos.",
    link: "https://www.facebook.com/people/Family-Vet-23/100067098365828/",
  },
  {
    imgSrc: "/assets/location/instagram.svg",
    heading: "Instagram",
    paragraph:
      "Explora nuestro mundo en Instagram y descubre momentos encantadores con nuestras mascotas.",
    link: "https://www.instagram.com/vet.family.23/",
  },
  {
    imgSrc: "/assets/location/email.svg",
    heading: "Correo electrónico",
    paragraph:
      "Contáctanos por correo electrónico para programar una cita en nuestro servicio de estética canina.",
    link: "mailto:vet.family.23@gmail.com",
  },
  {
    imgSrc: "/assets/location/maps.svg",
    heading: "Dirección",
    paragraph:
      "Visítanos calle Poetas No. 144. Col. Panorama, León, Guanajuato",
    link: "https://maps.app.goo.gl/XiLPjx4ZuchBSnMs6",
  },
];

const Links = () => {
  return (
    <div className="bg-babyblue" id="servicios">
      <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h3 className="text-4xl sm:text-5xl font-semibold text-black text-center my-10">
          Información de contacto
        </h3>
        <h5 className="text-black opacity-60 text-lg font-normal text-center">
          Estaremos aquí para atenderte a través de estos diferentes medios: 
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-4 lg:gap-x-8 mt-10">
          {Medios.map((item, i) => (
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
              <Link
                href={item.link}
                className="text-electricblue text-xl font-medium flex gap-2 pt-10 pb-2"
              >
              Click aquí:
                <Image
                  src="/assets/people/arrow-right.svg"
                  alt="arrow-right"
                  width={24}
                  height={24}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Links;
