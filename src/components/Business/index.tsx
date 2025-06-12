"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Hotel, Shield, Heart, Clock, Star, PawPrint } from "lucide-react";

const Business = () => {
  const services = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Seguridad 24/7",
      description: "Supervisión constante"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Cuidado personalizado",
      description: "Atención individual"
    },
    {
      icon: <PawPrint className="w-5 h-5" />,
      title: "Ejercicio diario",
      description: "Actividades y juegos"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Horarios flexibles",
      description: "Estadías adaptables"
    }
  ];

  const benefits = [
    "Instalaciones completamente equipadas",
    "Personal veterinario especializado",
    "Alimentación balanceada personalizada",
    "Área de juegos segura y amplia",
    "Cámaras de monitoreo 24/7",
    "Servicio de transporte disponible"
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
          
          {/* Content Section */}
          <motion.div 
            className="col-span-6 flex flex-col justify-center"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Header Badge */}
            <motion.div
              className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-teal-100/80 backdrop-blur-sm rounded-full border border-teal-200/50 w-fit"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Hotel className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Hotel para Mascotas</span>
            </motion.div>

            <motion.h2 
              className="text-4xl sm:text-5xl font-bold text-center lg:text-start mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-teal-700 to-cyan-700">
                Tu Mascota, Nuestro Huésped de Honor
              </span>
            </motion.h2>

            <motion.p 
              className="text-gray-700 text-lg font-normal text-center lg:text-start leading-relaxed mb-8 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Brindamos un alojamiento seguro y amoroso para perros y gatos, donde cada peludo 
              huésped es tratado con cuidado excepcional y atención personalizada. Un hogar 
              temporal lleno de amor y profesionalismo.
            </motion.p>

            {/* Services Grid */}
            <motion.div 
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    {service.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{service.title}</h4>
                    <p className="text-gray-600 text-xs">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Benefits List */}
            <motion.div
              className="bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl border border-teal-100/50 p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Servicios incluidos</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
                  >
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="flex justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-teal-100/80 to-cyan-100/80 backdrop-blur-sm rounded-xl border border-teal-200/50 text-teal-700">
                <Hotel className="w-5 h-5" />
                <span className="text-sm font-medium">Disponible próximamente</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Image Section */}
          <motion.div 
            className="col-span-6 flex justify-center mt-10 lg:mt-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 rounded-3xl blur-2xl transform scale-105" />
              
              <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/50 bg-white/70 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10" />
                <Image
                  src="/assets/business/hotel.png"
                  alt="Hotel para mascotas - Instalaciones seguras y cómodas"
                  width={1000}
                  height={805}
                  className="object-cover hover:scale-105 transition-transform duration-700 w-full h-auto"
                  quality={75}
                />
                
                {/* Floating Elements */}
                <motion.div
                  className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-6 h-6 text-red-500" />
                </motion.div>
                
                <motion.div
                  className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">5.0</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Features Section */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Máxima Seguridad",
              description: "Instalaciones completamente seguras con monitoreo 24/7 para la tranquilidad de tu mascota.",
              gradient: "from-blue-500 to-blue-600"
            },
            {
              icon: <Heart className="w-8 h-8" />,
              title: "Amor y Cuidado",
              description: "Personal capacitado que trata a cada mascota con el amor y respeto que merece.",
              gradient: "from-pink-500 to-pink-600"
            },
            {
              icon: <PawPrint className="w-8 h-8" />,
              title: "Experiencia Única",
              description: "Cada estadía es diseñada para que tu mascota se sienta como en casa y disfrute al máximo.",
              gradient: "from-emerald-500 to-emerald-600"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Business;
