'use client';

const VetFamilySchema = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "VeterinaryCare",
    "@id": "https://www.vetforfamily.com/#organization",
    name: "Vet Family",
    description: "Clínica veterinaria en León con servicios integrales: consultas médicas, vacunación, cirugías, estética canina, hotel para mascotas y asesoría nutricional. Atención profesional 24/7 con tecnología de vanguardia para el cuidado completo de tus mascotas.",
    url: "https://www.vetforfamily.com",
    telephone: ["+52 477-332-7152", "+52 477-260-5743"],
    image: "https://www.vetforfamily.com/logo.png",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Poetas, 144",
      addressLocality: "León",
      addressRegion: "Guanajuato",
      addressCountry: "MX",
      postalCode: "37160",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "21.1167",
      longitude: "-101.6833",
    },
    sameAs: [
      "https://facebook.com/vet.family.23",
      "https://instagram.com/vet.family.23",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "14:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios Veterinarios Integrales",
      itemListElement: [
        {
          "@type": "VeterinaryService",
          name: "Consultas Médicas Veterinarias",
          description: "Consultas médicas personalizadas con veterinarios certificados disponibles 24/7",
          availableAtOrFrom: {
            "@type": "VeterinaryCare",
            name: "Vet Family"
          },
          serviceType: "Atención Veterinaria"
        },
        {
          "@type": "VeterinaryService",
          name: "Vacunación y Desparasitación",
          description: "Planes personalizados de vacunación y control de parásitos para perros y gatos",
          serviceType: "Medicina Preventiva"
        },
        {
          "@type": "VeterinaryService",
          name: "Cirugías Veterinarias",
          description: "Procedimientos quirúrgicos con tecnología de vanguardia y equipo especializado",
          serviceType: "Cirugía Veterinaria"
        },
        {
          "@type": "VeterinaryService",
          name: "Estética y Limpieza Dental",
          description: "Servicios profesionales de estética canina y cuidado dental para mascotas",
          serviceType: "Cuidado y Belleza"
        },
        {
          "@type": "VeterinaryService",
          name: "Hotel y Asesoría Nutricional",
          description: "Alojamiento seguro para mascotas y planes nutricionales personalizados",
          serviceType: "Servicios Complementarios"
        }
      ]
    },
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "4.8",
        bestRating: "5"
      },
      author: {
        "@type": "Organization",
        name: "Google Reviews"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default VetFamilySchema; 