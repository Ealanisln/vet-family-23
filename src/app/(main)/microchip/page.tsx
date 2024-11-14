import React from "react";
import Image from "next/image";
import Link from "next/link";

const Microchip = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="relative h-64">
          <Image
            src="/assets/microchip/header.png"
            alt="Microchip de identificación animal"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white text-center">
              Microchip de Identificación Animal
            </h1>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ¿Qué es un Microchip de Identificación Animal?
          </h2>
          <p className="text-gray-600 mb-6">
            Un microchip de identificación animal es un pequeño dispositivo
            electrónico implantado bajo la piel de un animal, generalmente en la
            región del cuello. Este chip, que tiene el tamaño de un grano de
            arroz, contiene un número de identificación único que puede ser
            leído por un escáner especial.
          </p>
          <p className="text-gray-600 mb-6">
            El microchip no tiene batería ni partes móviles; funciona mediante
            un sistema de radiofrecuencia pasiva. Cuando un escáner emite una
            señal, el microchip responde con su número de identificación,
            permitiendo a los profesionales de la salud animal o a los servicios
            de control de animales recuperar información crucial sobre el
            propietario del animal y sus datos de contacto.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Beneficios del Microchip de Identificación
          </h2>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li className="mb-2">
              <span className="font-semibold">
                Recuperación de Mascotas Perdidas:
              </span>{" "}
              Facilita el retorno al hogar de mascotas perdidas.
            </li>
            <li className="mb-2">
              <span className="font-semibold">Prevención de Robo:</span> Actúa
              como identificación permanente y única.
            </li>
            <li className="mb-2">
              <span className="font-semibold">Acceso a Servicios:</span>{" "}
              Requerido por algunos servicios de salud y refugios.
            </li>
            <li>
              <span className="font-semibold">
                Actualización de Información:
              </span>{" "}
              Permite mantener los datos de contacto actualizados.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Proceso de Implantación
          </h2>
          <p className="text-gray-600 mb-6">
            La implantación del microchip es un procedimiento sencillo y rápido
            que se realiza generalmente en una clínica veterinaria. Se utiliza
            una aguja especial para introducir el microchip bajo la piel del
            animal, lo que generalmente solo causa una mínima molestia.
          </p>

          <div
            className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded"
            role="alert"
          >
            <p className="font-bold">Recuerda</p>
            <p>
              El microchip de identificación animal es una herramienta esencial
              para la seguridad y bienestar de las mascotas, proporcionando una
              forma segura y permanente de identificar y recuperar a los
              animales perdidos.
            </p>
          </div>
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Características del Microchip</h2>
            <div className="grid grid-cols-3 gap-8">
              {/* Característica 1 */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <Image
                    src="/assets/microchip/1.png"
                    alt="Tamaño del microchip"
                    width={128}
                    height={128}
                    objectFit="cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Tamaño Diminuto</h3>
                <p className="text-sm text-gray-600 text-center">Del tamaño de un grano de arroz, casi imperceptible para tu mascota.</p>
              </div>

              {/* Característica 2 */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <Image
                    src="/assets/microchip/2.png"
                    alt="Durabilidad del microchip"
                    width={128}
                    height={128}
                    objectFit="cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Duradero</h3>
                <p className="text-sm text-gray-600 text-center">Diseñado para durar toda la vida de tu mascota sin necesidad de mantenimiento.</p>
              </div>

              {/* Característica 3 */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <Image
                    src="/assets/microchip/3.png"
                    alt="Seguridad del microchip"
                    width={128}
                    height={128}
                    objectFit="cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Seguro</h3>
                <p className="text-sm text-gray-600 text-center">Tecnología probada y segura, sin efectos secundarios para tu mascota.</p>
              </div>
            </div>
          </section>
          <div className="text-center mt-10">
            <Link href="https://wa.link/u5njd1" passHref>
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                Solicita tu cita para el chip de tu mascota ahora!
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Microchip;
