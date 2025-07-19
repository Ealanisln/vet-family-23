// src/app/(main)/page.tsx
import { Metadata } from 'next';
import Reviews from "../../components/Reviews/index";
import Servicios from "../../components/Servicios/index";
import Business from "../../components/Business/index";
import HomeDelivery from "../../components/HomeDelivery/index";
import Contact from "../../components/Contact";
import GaleriaFotos from "@/components/GaleriaFotos/GaleriaFotos";
import FloatingWhatsApp from "@/components/FloatingWhatsapp/FloatingWhatsapp";
import VetFamilySchema from "@/components/SEO/VetFamilySchema";
// import { AlertBanner } from "@/components/AlertBanner";
import VetFamilyHero from "@/components/Banner/Banner";
// import AnniversaryBanner from '@/components/AnniversaryBanner/Anniversary';

export const metadata: Metadata = {
  title: "Vet Family | Clínica Veterinaria Integral en León, Guanajuato",
  description: "Clínica veterinaria en León con servicios integrales: consultas médicas, vacunación, cirugías, estética canina, hotel para mascotas y asesoría nutricional. Atención profesional 24/7 con tecnología de vanguardia para el cuidado completo de tus mascotas.",
  keywords: "veterinaria león, clínica veterinaria 24/7, servicios veterinarios integrales, consultas veterinarias, vacunación mascotas, desparasitación, limpieza dental mascotas, estética canina, hotel para mascotas, cirugía veterinaria, asesoría nutricional mascotas, emergencias veterinarias, Guanajuato",
  alternates: {
    canonical: "https://www.vetforfamily.com",
    languages: {
      'es-MX': 'https://www.vetforfamily.com',
    },
  },
  openGraph: {
    type: 'website',
    title: "Vet Family - Clínica Veterinaria Integral 24/7 en León",
    description: "Clínica veterinaria en León con servicios integrales: consultas médicas, vacunación, cirugías, estética canina, hotel para mascotas y asesoría nutricional. Atención profesional 24/7 con tecnología de vanguardia para el cuidado completo de tus mascotas.",
    url: "https://www.vetforfamily.com",
    siteName: "Vet Family",
    images: [
      {
        url: "https://www.vetforfamily.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vet Family - Clínica Veterinaria Integral"
      }
    ],
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Vet Family - Clínica Veterinaria Integral en León",
    description: "Clínica veterinaria en León con servicios integrales: consultas médicas, vacunación, cirugías, estética canina, hotel para mascotas y asesoría nutricional. Atención profesional 24/7 con tecnología de vanguardia para el cuidado completo de tus mascotas.",
    images: ["https://www.vetforfamily.com/og-image.png"],
    site: "@vetfamily",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'MX-GUA',
    'geo.placename': 'León',
    'geo.position': '21.1167;-101.6833',
    'ICBM': '21.1167, -101.6833',
  },
}

export default async function Home() {
  return (
    <>
      <VetFamilySchema />
      {/* <AnniversaryBanner />  */}
      <FloatingWhatsApp />
      <VetFamilyHero />
      {/* <AlertBanner /> */}
      <Reviews />
      <Servicios />
      <GaleriaFotos />
      <Business />
      <HomeDelivery />
      <Contact />
      {/* <Location /> */}
    </>
  );
}