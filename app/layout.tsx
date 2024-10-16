import { Suspense } from "react";
import "./globals.css";
import { FacebookPixelEvents } from "@/components/Facebook/FacebookPixel";
import dynamic from "next/dynamic";
import GoogleAnalytics from "@/components/GoogleAnalytics/";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Bienvenido a Vet Family",
  description: "Cuidando a tus mascotas, amándolas como tú lo haces.",
  icons: {
    icon: "/icon.svg", // /public path
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
        <Suspense fallback={null}>
          <GoogleAnalytics GA_MEASUREMENT_ID="G-PXSVH1SGKW" />
          <FacebookPixelEvents />
        </Suspense>
      </body>
    </html>
  );
}
