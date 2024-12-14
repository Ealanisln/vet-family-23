import { Suspense } from "react";
import "./globals.css";
import { FacebookPixelEvents } from "@/components/Facebook/FacebookPixel";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://www.vetforfamily.com"
  ),
  title: "Vet Family | Clínica Veterinaria de Confianza",
  description:
    "Clínica veterinaria especializada en el cuidado integral de mascotas. Ofrecemos servicios de consultas médicas, vacunación, cirugías, estética canina y hotel para mascotas. ¡Tu mascota merece lo mejor!",
  keywords:
    "veterinaria, clínica veterinaria, servicios veterinarios, vacunación mascotas, cirugía veterinaria, hotel para mascotas, estética canina, cuidado animal",
  openGraph: {
    title: "Vet Family | Clínica Veterinaria de Confianza",
    description:
      "Cuidamos y amamos a tus mascotas como tú. Servicios veterinarios completos: consultas, vacunación, cirugías, hotel y más.",
    type: "website",
    locale: "es_ES",
    siteName: "Vet Family",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vet Family - Clínica Veterinaria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vet Family | Clínica Veterinaria de Confianza",
    description:
      "Cuidamos y amamos a tus mascotas como tú. Servicios veterinarios completos en un ambiente acogedor.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://www.vetforfamily.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  verification: {
    google: "G-PXSVH1SGKW",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  authors: [{ name: "Vet Family" }],
  category: "Servicios Veterinarios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <KindeProvider>
          {children}
          <Toaster />
          <Suspense fallback={null}>
            <FacebookPixelEvents />
          </Suspense>
          <GoogleAnalytics gaId="G-PXSVH1SGKW" />
        </KindeProvider>
      </body>
    </html>
  );
}
