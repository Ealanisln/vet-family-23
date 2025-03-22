// src/components/HotelMascotas/HotelMascotasComponent.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  Calendar,
  Phone,
  MessageCircle,
  Bath,
  AlertCircle,
  PawPrint,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import sendEmail from "@/app/actions/email";
import HotelGallerySection from "./HotelGallerySection";

export default function HotelMascotasComponent() {
  // Estados para el formulario
  const [formState, setFormState] = useState({
    name: "",
    petName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    sextuple: "",
    bordetella: "",
    despInterna: "",
    despExterna: "",
    notes: "",
  });

  // Estado para el proceso de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Función para manejar cambios en los inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    // Mapeo de IDs del formulario a propiedades del estado
    const fieldMapping: Record<string, string> = {
      name: "name",
      "pet-name": "petName",
      email: "email",
      phone: "phone",
      "check-in": "checkIn",
      "check-out": "checkOut",
      sextuple: "sextuple",
      bordetella: "bordetella",
      "desp-interna": "despInterna",
      "desp-externa": "despExterna",
      notes: "notes",
    };

    const stateField = fieldMapping[id];
    if (stateField) {
      setFormState((prev) => ({
        ...prev,
        [stateField]: value,
      }));
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult({});

    try {
      const response = await sendEmail(formState);
      setSubmitResult({
        success: true,
        message: response,
      });

      // Si fue exitoso, limpia el formulario
      if (submitResult.success) {
        setFormState({
          name: "",
          petName: "",
          email: "",
          phone: "",
          checkIn: "",
          checkOut: "",
          sextuple: "",
          bordetella: "",
          despInterna: "",
          despExterna: "",
          notes: "",
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message:
          "Ha ocurrido un error al enviar el formulario. Por favor intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Información de contacto
  const contactInfo = {
    phone: "+52 477-332-7152",
    whatsapp: "+52 477-260-57-43",
  };

  // Características del hotel
  const features = [
    {
      icon: <Home className="w-10 h-10 text-[#5dade2]" />,
      title: "Habitaciones cómodas",
      description:
        "Espacios amplios y seguros diseñados para el máximo confort de tu mascota.",
    },
    {
      icon: <Calendar className="w-10 h-10 text-[#5dade2]" />,
      title: "Actividades diarias",
      description:
        "Juegos y ejercicios programados para mantener a tu mascota activa y feliz.",
    },
    {
      icon: <Bath className="w-10 h-10 text-[#5dade2]" />,
      title: "Servicio de spa",
      description:
        "Baños, cepillado y cuidados estéticos para que tu mascota regrese radiante.",
    },
    {
      icon: <PawPrint className="w-10 h-10 text-orange-500" />,
      title: "Paseos regulares",
      description:
        "Salidas programadas con nuestro personal para ejercicio y recreación.",
    },
    {
      icon: <AlertCircle className="w-10 h-10 text-yellow-500" />,
      title: "Atención veterinaria",
      description:
        "Supervisión médica constante para cualquier emergencia o necesidad.",
    },
  ];

  // Testimonios de clientes
  const testimonials = [
    {
      name: "Laura Méndez",
      pet: "Max",
      comment:
        "Mi perrito regresó feliz y relajado. El personal fue increíblemente atento y me enviaban fotos todos los días.",
    },
    {
      name: "Carlos Vega",
      pet: "Luna",
      comment:
        "Excelente servicio. Mi Luna es muy especial con su comida y medicamentos, y siguieron todas las instrucciones al pie de la letra.",
    },
    {
      name: "Sofía Álvarez",
      pet: "Rocky",
      comment:
        "Primera vez que dejo a mi Rocky y estaba muy nerviosa, pero el equipo me hizo sentir tranquila. ¡Definitivamente volveremos!",
    },
  ];

  return (
    <main className="pb-16">
      {/* Hero section con promoción de Semana Santa */}
      <section className="relative py-20 overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hotel/hero-bg.jpg"
            alt="Hotel para mascotas"
            fill
            className="object-cover opacity-60"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#5dade2]/90 to-[#5dade2]/70" />
        </div>

        {/* Contenido */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-white">
            <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-semibold mb-6">
              Especial Semana Santa 2025
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Hotel para Mascotas
            </h1>
            <p className="text-xl mb-8">
              Mientras disfrutas de tus vacaciones, tu mejor amigo se merece
              unas vacaciones de lujo en nuestras instalaciones especialmente
              diseñadas para su comodidad y seguridad.
            </p>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg border border-white/30 mb-8">
              <p className="font-bold text-2xl">
                ¡10% de descuento en estancias de 8+ días durante Semana Santa!
              </p>
              <p className="text-sm">
                Promoción válida del 24 de marzo al 7 de abril de 2025
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  document
                    .getElementById("reserva")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Reserva Ahora
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white hover:bg-white/20"
                onClick={() => {
                  document
                    .getElementById("gallery")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Conoce Nuestras Instalaciones
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de características */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Todo lo que tu mascota necesita
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestro hotel para mascotas ofrece todas las comodidades para que
              tu compañero fiel se sienta como en casa mientras no estás.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galería de imágenes */}
      <section id="gallery">
        <HotelGallerySection />
      </section>

      {/* Testimonios */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Miles de mascotas felices y dueños satisfechos con nuestro
              servicio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="pt-6 py-4">
                  <div className="flex items-center mb-4">
                    <PawPrint className="w-8 h-8 text-orange-500 mr-3" />
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">
                        y {testimonial.pet}
                      </p>
                    </div>
                  </div>
                  <p className="italic text-gray-600">
                    &ldquo;{testimonial.comment}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Resolvemos tus dudas sobre nuestro servicio de hotel para
              mascotas.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Tabs defaultValue="requisitos">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="requisitos">Requisitos</TabsTrigger>
                <TabsTrigger value="servicios">Servicios</TabsTrigger>
                <TabsTrigger value="horarios">Horarios y Reservas</TabsTrigger>
              </TabsList>

              <TabsContent
                value="requisitos"
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      ¿Qué vacunas debe tener mi mascota?
                    </h3>
                    <p className="text-gray-600">
                      Todas las mascotas deben tener sus vacunas actualizadas,
                      incluyendo rabia, parvovirus, moquillo y bordetella (tos
                      de las perreras). Te pediremos el carnet de vacunación al
                      momento del check-in.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      ¿Aceptan mascotas con necesidades especiales?
                    </h3>
                    <p className="text-gray-600">
                      Sí, aceptamos mascotas con necesidades especiales. Es
                      importante que nos informes de cualquier condición médica,
                      alergias o medicamentos que tu mascota pueda necesitar
                      durante su estancia.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      ¿Qué debo traer para la estancia de mi mascota?
                    </h3>
                    <p className="text-gray-600">
                      Te recomendamos traer su comida habitual, juguetes
                      favoritos, manta o cama (opcional), medicamentos si los
                      necesita, y cualquier instrucción especial por escrito.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="servicios"
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      ¿Incluyen paseos diarios?
                    </h3>
                    <p className="text-gray-600">
                      Sí, todos nuestros paquetes incluyen paseos diarios. La
                      frecuencia y duración varía según el paquete seleccionado.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      ¿Ofrecen servicio de grooming/estética?
                    </h3>
                    <p className="text-gray-600">
                      Sí, ofrecemos servicios de baño, corte de uñas, limpieza
                      de oídos y estética completa con costo adicional. El
                      paquete VIP incluye una sesión básica de spa.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      ¿Cómo sabré cómo está mi mascota durante su estancia?
                    </h3>
                    <p className="text-gray-600">
                      Enviamos actualizaciones diarias con fotos vía WhatsApp
                      para que estés tranquilo. Los paquetes Premium y VIP
                      incluyen reportes más detallados.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="horarios"
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      ¿Cuáles son los horarios de check-in y check-out?
                    </h3>
                    <p className="text-gray-600">
                      El check-in es de 9:00 am a 5:00 pm y el check-out de 9:00
                      am a 12:00 pm. Podemos acomodar horarios especiales con
                      previo aviso.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      ¿Con cuánta anticipación debo reservar?
                    </h3>
                    <p className="text-gray-600">
                      Recomendamos reservar con al menos una semana de
                      anticipación, especialmente durante temporadas altas como
                      vacaciones. Para Semana Santa, sugerimos hacerlo con un
                      mes de antelación.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      ¿Qué pasa si necesito recoger a mi mascota antes de lo
                      previsto?
                    </h3>
                    <p className="text-gray-600">
                      No hay problema. Te pedimos que nos avises con al menos 24
                      horas de anticipación para preparar todo. Se aplicará un
                      cobro por los días reservados según nuestra política.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      {/* Sección de contacto y reserva */}
      <section id="reserva" className="py-16 bg-[#5dade2] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">¿Listo para reservar?</h2>
              <p className="text-xl mb-8">
                Contáctanos hoy mismo para asegurar un lugar para tu mascota en
                nuestro hotel durante esta Semana Santa.
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-6 h-6 mr-3" />
                  <div>
                    <p className="font-medium">Llámanos al:</p>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-xl font-bold hover:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <MessageCircle className="w-6 h-6 mr-3" />
                  <div>
                    <p className="font-medium">WhatsApp:</p>
                    <a
                      href={`https://wa.me/${contactInfo.whatsapp.replace(/\+|\s|-/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold hover:underline"
                    >
                      {contactInfo.whatsapp}
                    </a>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-8 bg-white text-[#5dade2] hover:bg-gray-100"
              >
                Reservar Ahora
              </Button>
            </div>

            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-6">Formulario de Reserva</h3>

              {/* Mensaje de estado de envío */}
              {submitResult.success === true && (
                <div className="bg-green-500/20 border border-green-500/30 p-4 mb-6 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  <p>
                    {submitResult.message ||
                      "¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto."}
                  </p>
                </div>
              )}

              {submitResult.success === false && (
                <div className="bg-red-500/20 border border-red-500/30 p-4 mb-6 rounded-lg flex items-center">
                  <XCircle className="w-5 h-5 mr-2 text-red-500" />
                  <p>
                    {submitResult.message ||
                      "Ha ocurrido un error. Por favor intenta nuevamente."}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block mb-2">
                      Nombre del dueño
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white placeholder-white/70"
                      placeholder="Tu nombre"
                      value={formState.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pet-name" className="block mb-2">
                      Nombre de tu mascota
                    </label>
                    <input
                      type="text"
                      id="pet-name"
                      className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white placeholder-white/70"
                      placeholder="Nombre de tu mascota"
                      value={formState.petName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="tu@email.com"
                    value={formState.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="Tu número de teléfono"
                    value={formState.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="check-in" className="block mb-2">
                      Fecha de entrada
                    </label>
                    <input
                      type="date"
                      id="check-in"
                      className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white"
                      value={formState.checkIn}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="check-out" className="block mb-2">
                      Fecha de salida
                    </label>
                    <input
                      type="date"
                      id="check-out"
                      className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white"
                      value={formState.checkOut}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="vaccination" className="block mb-2">
                    Última fecha de vacunación{" "}
                    <span className="text-xs font-normal opacity-80">
                      (opcional)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sextuple" className="block mb-2 text-sm">
                        Vacuna Séxtuple{" "}
                        <span className="text-xs opacity-80">(opcional)</span>
                      </label>
                      <input
                        type="date"
                        id="sextuple"
                        className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white"
                        value={formState.sextuple}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bordetella"
                        className="block mb-2 text-sm"
                      >
                        Vacuna Bordetella{" "}
                        <span className="text-xs opacity-80">(opcional)</span>
                      </label>
                      <input
                        type="date"
                        id="bordetella"
                        className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white"
                        value={formState.bordetella}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">
                    Desparasitación{" "}
                    <span className="text-xs font-normal opacity-80">
                      (opcional)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="desp-interna"
                        className="block mb-2 text-sm"
                      >
                        Interna (Fecha){" "}
                        <span className="text-xs opacity-80">(opcional)</span>
                      </label>
                      <input
                        type="date"
                        id="desp-interna"
                        className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white"
                        value={formState.despInterna}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="desp-externa"
                        className="block mb-2 text-sm"
                      >
                        Externa (Fecha){" "}
                        <span className="text-xs opacity-80">(opcional)</span>
                      </label>
                      <input
                        type="date"
                        id="desp-externa"
                        className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white"
                        value={formState.despExterna}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block mb-2">
                    Notas adicionales{" "}
                    <span className="text-xs font-normal opacity-80">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    className="w-full px-4 py-2 rounded border bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="Detalles sobre tu mascota, necesidades especiales, etc."
                    value={formState.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 mt-2 flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Solicitud"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
