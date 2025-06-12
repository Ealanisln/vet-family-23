import Image from "next/image";
import { Clock, Shield, Award, Heart } from "lucide-react";

interface datatype {
  imgSrc: string;
  heading: string;
  paragraph: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

const Aboutdata: datatype[] = [
  {
    imgSrc: "/assets/features/consultation.svg",
    heading: "Consultas Médicas",
    paragraph:
      "Diagnósticos precisos con historial médico digital completo y seguimiento de tratamientos especializados para cada mascota.",
    features: ["Historial médico digital", "Diagnóstico especializado", "Seguimiento de tratamientos"],
    badge: "Más solicitado"
  },
  {
    imgSrc: "/assets/features/vaccine.svg",
    heading: "Plan de Vacunación",
    paragraph:
      "Protocolos de vacunación DHPPI, Séxtuple, Rabia y Bordetella con sistema automatizado de recordatorios y seguimiento digital.",
    features: ["Vacunas DHPPI/Séxtuple/Rabia", "Recordatorios automáticos", "Seguimiento por etapas"],
    popular: true
  },
  {
    imgSrc: "/assets/features/deworming.svg",
    heading: "Desparasitación",
    paragraph:
      "Programa integral de desparasitación interna y externa con antiparasitarios de última generación y control veterinario especializado.",
    features: ["Desparasitación interna/externa", "Antiparasitarios premium", "Control especializado"]
  },
  {
    imgSrc: "/assets/features/dental.svg",
    heading: "Limpieza Dental",
    paragraph:
      "Procedimientos odontológicos completos con anestésicos seguros, antisépticos cicatrizantes y técnicas de pulido profesional.",
    features: ["Anestésicos seguros", "Antisépticos cicatrizantes", "Técnicas profesionales"]
  },
  {
    imgSrc: "/assets/features/grooming.svg",
    heading: "Estética Canina",
    paragraph:
      "Spa veterinario con champús medicados dermatológicos, corticosteroides tópicos y tratamientos especializados por raza.",
    features: ["Champús medicados", "Tratamientos dermatológicos", "Especialización por raza"],
    badge: "Spa premium"
  },
  {
    imgSrc: "/assets/features/nutrition.svg",
    heading: "Asesoría Nutricional",
    paragraph:
      "Planes nutricionales personalizados con estimulantes del apetito, suplementos especializados y seguimiento gastroenterológico.",
    features: ["Planes personalizados", "Suplementos especializados", "Seguimiento gastroenterológico"]
  },
  {
    imgSrc: "/assets/features/surgery.svg",
    heading: "Cirugías",
    paragraph:
      "Quirófano equipado con anestésicos-sedativos avanzados, material quirúrgico estéril y tecnología de imagenología digital.",
    features: ["Anestésicos-sedativos avanzados", "Material quirúrgico estéril", "Imagenología digital"],
    badge: "Tecnología avanzada"
  },
  {
    imgSrc: "/assets/features/pet-hotel.svg",
    heading: "Hotel para Mascotas",
    paragraph:
      "Hospitalización veterinaria con monitoreo cardiológico, tratamientos respiratorios y cuidado especializado 24/7.",
    features: ["Monitoreo cardiológico", "Tratamientos respiratorios", "Cuidado especializado 24/7"],
    badge: "5 estrellas"
  },
];

const Servicios = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden" id="servicios">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-slate-50" />
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(20,184,166,0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(6,182,212,0.08),transparent)] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          {/* Trust indicators */}
          <div className="flex justify-center gap-6 flex-wrap mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-full shadow-lg">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">Certificados</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-full shadow-lg">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-gray-700">Horarios flexibles</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-full shadow-lg">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Garantía total</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-teal-700 to-cyan-700">
              Nuestros servicios
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mx-auto" />
          </div>
          
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            Comprometidos con el bienestar de tus mascotas, ofrecemos una gama
            completa de servicios veterinarios premium para mantenerlas
            saludables y felices toda su vida.
          </p>

          {/* Call to action */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-100 to-cyan-100 border border-teal-200/50 rounded-2xl backdrop-blur-sm">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-base font-semibold text-gray-800">Más de 500 mascotas felices nos respaldan</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {Aboutdata.map((item, i) => (
            <div 
              key={i} 
              className={`relative group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 hover:bg-white/90 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ${
                item.popular ? 'ring-2 ring-teal-400 ring-opacity-50' : ''
              }`}
            >
              {/* Popular badge */}
              {item.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    MÁS POPULAR
                  </div>
                </div>
              )}

              {/* Service badge */}
              {item.badge && !item.popular && (
                <div className="absolute -top-3 right-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {item.badge.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Icon with modern background */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-200/40 to-cyan-200/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={item.imgSrc}
                    alt={item.heading}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-teal-700 transition-colors duration-300">
                  {item.heading}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.paragraph}
                </p>

                {/* Features list */}
                <div className="space-y-2">
                  {item.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                      <span className="text-xs text-gray-600 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-16 space-y-6">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-white/70 to-teal-50/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg">
            <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-gray-800">¿No encuentras lo que buscas?</p>
              <p className="text-sm text-gray-600">Contáctanos para servicios personalizados</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Servicios;
