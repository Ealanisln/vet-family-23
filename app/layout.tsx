import { Suspense } from "react";
import "./globals.css";
import { FacebookPixelEvents } from "@/components/Facebook/FacebookPixel";
import { Toaster } from "@/components/ui/toaster";
import { GoogleTagManager } from "@next/third-parties/google";

export const metadata = {
  title: "Bienvenido a Family Vet 23",
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
        <GoogleTagManager gtmId="GTM-WRS82MQB" />
        <Toaster />
        <Suspense fallback={null}>
          <FacebookPixelEvents />
        </Suspense>
      </body>
    </html>
  );
}
