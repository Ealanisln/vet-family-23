"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, MapPin, Clock, Heart } from "lucide-react";

const HomeDelivery = () => {
  const features = [
    {
      icon: <Home className="w-5 h-5" />,
      title: "Comodidad total",
      description: "Sin estrés para tu mascota"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "A tu domicilio",
      description: "Llegamos donde estés"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Flexibilidad",
      description: "Horarios adaptados a ti"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Atención personalizada",
      description: "Cuidado profesional"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.15),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.1),transparent)]"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Image Section */}
          <motion.div 
            className="col-span-6 flex justify-center lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 rounded-3xl blur-2xl transform scale-105" />
              
              <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/50 bg-white/70 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10" />
                <Image
                  src="/assets/homedelivery/home.png"
                  alt="Servicio veterinario a domicilio"
                  width={600}
                  height={600}
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  quality={75}
                />
              </div>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div 
            className="col-span-6 flex flex-col justify-center lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Header Badge */}
            <motion.div
              className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-teal-100/80 backdrop-blur-sm rounded-full border border-teal-200/50 w-fit"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Home className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Servicio a Domicilio</span>
            </motion.div>

            <motion.h2 
              className="text-4xl sm:text-5xl font-bold text-center lg:text-start mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-teal-700 to-cyan-700">
                Atención Veterinaria en la Puerta de tu Hogar
              </span>
            </motion.h2>

            <motion.p 
              className="text-gray-700 text-lg font-normal text-center lg:text-start leading-relaxed mb-8 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Nuestro servicio a domicilio ofrece la atención experta que tus
              mascotas merecen, brindando comodidad y tranquilidad directamente a
              tu puerta. Sin estrés, sin viajes, solo cuidado profesional.
            </motion.p>

            {/* Features Grid */}
            <motion.div 
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h4>
                    <p className="text-gray-600 text-xs">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="flex justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link
                href="https://wa.link/n193eh"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-500/25 transform hover:scale-105"
              >
                <span>Solicítalo ahora</span>
                <div className="p-1 bg-white/20 rounded-lg group-hover:translate-x-1 transition-transform duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              className="mt-8 p-6 bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl border border-teal-100/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.020v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"/>
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Servicios disponibles</h4>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Consultas generales, vacunación, desparasitación, curaciones y cuidados básicos. 
                <span className="text-teal-600 font-medium"> Disponible de lunes a sábado</span> en León, Guanajuato.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeDelivery;
