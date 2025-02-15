import Head from "next/head";

const VetSEO = () => {
  const seoData = {
    title: "Vet Family | Clínica Veterinaria Integral en León, Guanajuato",
    description: "Clínica veterinaria en León con servicios integrales: consultas médicas, vacunación, cirugías, estética canina, hotel para mascotas y asesoría nutricional. Atención profesional 24/7 con tecnología de vanguardia para el cuidado completo de tus mascotas.",
    keywords: "veterinaria león, clínica veterinaria 24/7, servicios veterinarios integrales, consultas veterinarias, vacunación mascotas, desparasitación, limpieza dental mascotas, estética canina, hotel para mascotas, cirugía veterinaria, asesoría nutricional mascotas, emergencias veterinarias, Guanajuato",
    canonicalUrl: "https://www.vetforfamily.com",
    socialMedia: {
      facebook: "https://facebook.com/vet.family.23",
      instagram: "https://instagram.com/vet.family.23",
      whatsapp: "+52 477-332-7152",
    },
    alternateLanguages: [
      {
        hrefLang: "es-MX",
        href: "https://www.vetforfamily.com",
      },
    ],
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "VeterinaryCare",
    "@id": "https://www.vetforfamily.com/#organization",
    name: "Vet Family",
    description: seoData.description,
    url: seoData.canonicalUrl,
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
      seoData.socialMedia.facebook,
      seoData.socialMedia.instagram,
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
    <Head>
      {/* Meta tags básicos optimizados */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />

      {/* Canonical y Alternate Languages */}
      <link rel="canonical" href={seoData.canonicalUrl} />
      {seoData.alternateLanguages.map((lang) => (
        <link
          key={lang.hrefLang}
          rel="alternate"
          hrefLang={lang.hrefLang}
          href={lang.href}
        />
      ))}

      {/* Open Graph tags mejorados */}
      <meta property="og:type" content="business.business" />
      <meta property="og:title" content="Vet Family - Clínica Veterinaria Integral 24/7 en León" />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:url" content={seoData.canonicalUrl} />
      <meta property="og:site_name" content="Vet Family" />
      <meta property="og:image" content="https://www.vetforfamily.com/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="es_MX" />
      <meta property="business:contact_data:street_address" content="Calle Poetas, 144" />
      <meta property="business:contact_data:locality" content="León" />
      <meta property="business:contact_data:region" content="Guanajuato" />
      <meta property="business:contact_data:postal_code" content="37160" />
      <meta property="business:contact_data:country_name" content="México" />

      {/* Twitter Card tags optimizados */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Vet Family - Clínica Veterinaria Integral en León" />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content="https://www.vetforfamily.com/og-image.png" />
      <meta name="twitter:site" content="@vetfamily" />

      {/* Meta tags adicionales y específicos */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Spanish" />
      <meta name="geo.region" content="MX-GUA" />
      <meta name="geo.placename" content="León" />
      <meta name="geo.position" content="21.1167;-101.6833" />
      <meta name="ICBM" content="21.1167, -101.6833" />
      
      {/* Schema.org markup optimizado */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </Head>
  );
};

export default VetSEO;