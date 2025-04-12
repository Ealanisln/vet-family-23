import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppointmentDialog from "@/components/Clientes/AppointmentDialog";

interface PromocionCardProps {
  dia: string;
  titulo: string;
  descripcion: string;
  descuento?: number;
  precio?: number;
  restricciones?: string;
  imagen: string;
}

const PromocionCard: React.FC<PromocionCardProps> = ({
  dia,
  titulo,
  descripcion,
  descuento,
  precio,
  restricciones,
  imagen,
}) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="p-4">
      <CardTitle className="text-lg font-bold">
        {dia}: {titulo}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="relative w-full aspect-square mb-2">
        <Image
          src={imagen}
          alt={titulo}
          fill
          className="rounded-lg object-contain"
        />
      </div>
      <p className="text-sm">{descripcion}</p>
      {descuento && (
        <p className="text-lg font-semibold text-purple-600">
          {descuento}% OFF
        </p>
      )}
      {precio && (
        <p className="text-lg font-semibold text-purple-600">Desde ${precio}</p>
      )}
      {restricciones && (
        <p className="text-xs text-gray-500 mt-1">{restricciones}</p>
      )}
    </CardContent>
  </Card>
);

const PromocionesFinde: React.FC = () => {
  const promociones: PromocionCardProps[] = [
    {
      dia: "Jueves",
      titulo: "Vacunas",
      descripcion: "5% de descuento en vacunas",
      descuento: 5,
      imagen:
        "https://res.cloudinary.com/dvf2zo2ee/image/upload/v1723926743/vet-for-family/promociones/jueves_uf32gi.png",
    },
    {
      dia: "Viernes",
      titulo: "Estéticas Caninas",
      descripcion: "Promoción especial",
      precio: 220,
      restricciones: "Aplican restricciones",
      imagen:
        "https://res.cloudinary.com/dvf2zo2ee/image/upload/v1723926743/vet-for-family/promociones/viernes_zrihm5.png",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-100 to-green-100">
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          Promociones Exclusivas
        </h1>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {promociones.map((promo, index) => (
            <PromocionCard key={index} {...promo} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold mb-4 text-purple-700">
            ¿Listo para aprovechar nuestras promociones?
          </h2>
          <div className="flex justify-center">
            <AppointmentDialog />
          </div>
        </div>

        <div className="mt-8 text-center text-md">
          <h2 className="text-lg font-bold mb-2 text-purple-700">
            Contáctanos
          </h2>
          <p>Tel: 477-332-7152 / 477-260-5743</p>
          <p>WhatsApp: 477-332-7152 / 477-260-5743</p>
          <p>
            Dirección: Calle Poetas No. 144. Col. Panorama. León, Guanajuato
          </p>
          <p>Facebook & Instagram: @VetFamily</p>
        </div>
      </main>
    </div>
  );
};

export default PromocionesFinde;
