"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Baby, Dog, Shield, PawPrint } from 'lucide-react';

const VetPlans = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const plans = [
    {
      title: "Plan Cachorrito",
      icon: Baby,
      age: "0-1 año",
      highlight: "¡Tu nuevo mejor amigo merece el mejor comienzo! 🐾",
      services: [
        "1 Consulta gratis",
        "1 Vacuna Puppy/DHPPI",
        "1 Vacuna DHPPI",
        "1 Vacuna DHPPI.L",
        "1 Vacuna de Bordetella",
        "1 Vacuna de Rabia",
        "3 Desparasitaciones"
      ],
      price: "1,950",
      savings: "360",
      accent: "text-pink-500",
      bgAccent: "from-pink-50 to-pink-100"
    },
    {
      title: "Plan Adulto Feliz",
      icon: Dog,
      age: "1-6.9 años",
      highlight: "¡Mantén a tu peludo saludable y juguetón! 🎾",
      services: [
        "2 Consultas",
        "1 Vacuna Séxtuple",
        "1 Vacuna Rabia",
        "1 Bordetella",
        "6 Desparasitaciones (bimestral)",
        "1 Hemograma perfil básico"
      ],
      price: "2,940",
      savings: "520",
      accent: "text-green-500",
      bgAccent: "from-green-50 to-green-100"
    },
    {
      title: "Plan Edad Dorada",
      icon: Heart,
      age: "+7 años",
      highlight: "¡Porque los abuelitos peludos merecen todo nuestro amor! 💜",
      services: [
        "3 Consultas gratis",
        "1 Vacuna Séxtuple",
        "1 Vacuna Rabia",
        "1 Vacuna Bordetella",
        "6 Desparasitaciones (bimestral)",
        "1 Perfil de Salud Geriátrico",
        "1 Hemograma",
        "1 Examen general de orina"
      ],
      price: "5,000",
      savings: "Consultar",
      accent: "text-purple-500",
      bgAccent: "from-purple-50 to-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-16 px-4 md:py-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
            Vet Family Planes 2025
          </h1>
          <p className="text-lg text-gray-600">
            ¡Porque tu mascota es parte de nuestra familia! 🏥🐾
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className={`h-full bg-gradient-to-b ${plan.bgAccent} border-none flex flex-col
                ${hoveredCard === index ? 'shadow-xl' : 'shadow'} transition-shadow duration-300`}>
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <plan.icon className={`w-12 h-12 ${plan.accent}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-center">{plan.title}</CardTitle>
                  <CardDescription className="text-center text-gray-600">{plan.age}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-base mb-6 text-center">{plan.highlight}</p>
                  <p className="text-3xl font-semibold text-center mb-6">${plan.price}</p>
                  <ul className="space-y-2.5">
                    {plan.services.map((service, idx) => (
                      <li key={idx} className="flex items-start">
                        <PawPrint className="w-4 h-4 mr-2 shrink-0 text-indigo-500 mt-1" />
                        <span className="text-sm text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="flex flex-col items-center pt-6 mt-auto">
                  <p className="text-sm text-gray-600 mb-4">
                    Ahorro: ${plan.savings}
                  </p>
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                    Enviar mensaje
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16 space-y-2 text-gray-600"
        >
          <p className="text-sm">Todos los planes requieren pago en una sola exhibición 💰</p>
          <p className="text-sm">¡Agenda tu cita hoy mismo y aprovecha estos increíbles beneficios! 📞</p>
          <p className="text-xs">Consulta términos y condiciones aplicables</p>
        </motion.div>
      </div>
    </div>
  );
};

export default VetPlans;