import "./globals.css";

export const metadata = {
  title: "Bienvenido a Family Vet 23",
  description: "Cuidando a tus mascotas, amándolas como tú lo haces.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
