import HotelMascotasComponent from "@/components/HotelMascotas/HotelMascotasComponent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotel para Mascotas en León - Servicio de Hospedaje | Vet Family",
  description: "Hospedaje de lujo para perros y gatos con atención veterinaria 24/7. Disfruta de tus vacaciones con tranquilidad. 15% de descuento en estancias durante Semana Santa 2025.",
  keywords: "hotel mascotas, hospedaje perros, guardería canina León, pensión mascotas, cuidado mascotas vacaciones, Semana Santa 2025",
  openGraph: {
    title: "Hotel para Mascotas en León | Vet Family",
    description: "Hospedaje de lujo para mascotas con alimentación premium, paseos diarios y servicio veterinario. Promoción especial: 15% OFF en Semana Santa 2025.",
    images: [
      {
        url: "/assets/hotel/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hotel para Mascotas Vet Family",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotel para Mascotas en León | Vet Family",
    description: "Hospedaje de lujo para tu mascota mientras disfrutas de tus vacaciones. 15% de descuento en Semana Santa 2025.",
    images: ["/assets/hotel/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://vetfamily.mx/hotel-mascotas",
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [
    {
      name: "Vet Family",
      url: "https://vetfamily.mx",
    },
  ],
  creator: "Vet Family",
  publisher: "Vet Family",
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  category: "Mascotas",
};

export default function HotelMascotasPage() {
  return <HotelMascotasComponent />;
}