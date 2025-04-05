// components/Promociones/index.tsx

import React from "react";
import { promocionesData, Promocion, DatosPromociones } from "./data";
import Image from "next/image";

interface PromocionDelDiaProps {
  promocion: Promocion;
  size?: 'normal' | 'large';
}

const PromocionDelDia: React.FC<PromocionDelDiaProps> = ({ promocion, size = 'normal' }) => (
  <div className={`bg-card rounded-lg shadow-lg overflow-hidden ${size === 'large' ? 'max-w-[600px] mx-auto' : ''}`}>
    <div className={`relative w-full aspect-square ${size === 'large' ? 'max-w-[600px]' : ''}`}>
      <Image
        src={promocion.imagen}
        alt={promocion.titulo}
        fill
        className="object-cover"
      />
    </div>
    <div className="p-4">
      {promocion.dia && <h2 className={`font-bold ${size === 'large' ? 'text-3xl' : 'text-2xl'}`}>{promocion.dia}</h2>}
      <h3 className={`font-semibold ${size === 'large' ? 'text-2xl' : 'text-xl'}`}>{promocion.titulo}</h3>
      <p className="text-muted-foreground">{promocion.descripcion}</p>
      {promocion.descuento && (
        <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium">
          {promocion.descuento}% de descuento
        </span>
      )}
      {promocion.precio && (
        <span className="text-primary font-semibold text-lg">
          Precio: ${promocion.precio}
        </span>
      )}
      {promocion.restricciones && (
        <p className="text-sm text-muted-foreground mt-2">
          * {promocion.restricciones}
        </p>
      )}
    </div>
  </div>
);

const Component: React.FC = () => {
  const {
    titulo,
    descripcion,
    promociones,
    promocionEspecial,
    contacto,
  }: DatosPromociones = promocionesData;

  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">{titulo}</h1>
          <p className="text-muted-foreground max-w-[700px] mx-auto">
            {descripcion}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promociones.map((promo: Promocion) => (
            <PromocionDelDia key={promo.id} promocion={promo} />
          ))}
        </div>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Promoción Especial</h2>
          <PromocionDelDia promocion={promocionEspecial} size="large" />
        </div>
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Contáctanos</h2>
          <p>Tel: {contacto.telefono.join(" / ")}</p>
          <p>WhatsApp: {contacto.whatsapp.join(" / ")}</p>
          <p>{contacto.direccion}</p>
          <p>Facebook & Instagram: {contacto.redes.facebook}</p>
          <p>Sitio web: {contacto.sitioWeb}</p>
        </div>
      </main>
    </div>
  );
};

export default Component;