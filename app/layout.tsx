import { Suspense } from "react";
import "./globals.css";
import { FacebookPixelEvents } from "@/components/Facebook/FacebookPixel";
import { GoogleAnalytics } from "@next/third-parties/google";
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
          <FacebookPixelEvents />
        </Suspense>
      </body>
      <GoogleAnalytics gaId="G-PXSVH1SGKW" />
    </html>
  );
}
