// components/SEO/VetSEO.jsx
import Head from "next/head";

const VetSEO = () => {
  const seoData = {
    title: "Vet Family | Clínica Veterinaria en León, Guanajuato",
    description:
      "Servicios veterinarios de alta calidad en León: consultas médicas, vacunación, cirugías, estética canina y hotel para mascotas. Atención profesional y dedicada para el bienestar de tu mascota.",
    keywords:
      "veterinaria león, clínica veterinaria, servicios veterinarios, consultas médicas, vacunación mascotas, desparasitación, limpieza dental mascotas, estética canina, hotel para mascotas, cirugía veterinaria, Guanajuato",
    canonicalUrl: "https://vetforfamily.com",
    socialMedia: {
      facebook: "https://facebook.com/vet.family.23",
      instagram: "https://instagram.com/vet.family.23",
    },
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Veterinary",
    name: "Vet Family",
    description: seoData.description,
    url: seoData.canonicalUrl,
    telephone: ["+52 477-332-7152", "+52 477-260-5743"],
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
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "10:00",
      closes: "19:00",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios Veterinarios",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Consultas Médicas",
          description:
            "Consultas médicas personalizadas con veterinarios calificados",
        },
        {
          "@type": "OfferCatalog",
          name: "Vacunación",
          description: "Planes de vacunación personalizados",
        },
        {
          "@type": "OfferCatalog",
          name: "Cirugías",
          description:
            "Procedimientos quirúrgicos con tecnología de vanguardia",
        },
        {
          "@type": "OfferCatalog",
          name: "Estética Canina",
          description: "Servicios profesionales de estética y grooming",
        },
        {
          "@type": "OfferCatalog",
          name: "Hotel para Mascotas",
          description: "Alojamiento seguro y cómodo para perros y gatos",
        },
      ],
    },
  };

  return (
    <Head>
      {/* Meta tags básicos */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={seoData.canonicalUrl} />

      {/* Open Graph tags */}
      <meta property="og:type" content="website" />
      <meta
        property="og:title"
        content="Vet Family - Tu Clínica Veterinaria de Confianza en León"
      />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:url" content={seoData.canonicalUrl} />
      <meta property="og:site_name" content="Vet Family" />
      <meta
        property="og:image"
        content={`${seoData.canonicalUrl}/og-image.png`}
      />
      <meta property="og:locale" content="es_MX" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="Vet Family - Clínica Veterinaria en León"
      />
      <meta name="twitter:description" content={seoData.description} />
      <meta
        name="twitter:image"
        content={`${seoData.canonicalUrl}/og-image.png`}
      />

      {/* Meta tags adicionales */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Spanish" />
      <meta name="geo.region" content="MX-GUA" />
      <meta name="geo.placename" content="León" />
      <meta name="geo.position" content="21.1167;-101.6833" />

      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </Head>
  );
};

export default VetSEO;
