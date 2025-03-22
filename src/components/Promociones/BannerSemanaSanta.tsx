"use client";
import { Home } from "lucide-react";
import React from "react";
import { CustomButton } from "../Clientes/AppointmentDialog";

const BannerSemanaSanta: React.FC = () => {
  return (
    <div className="mb-8 p-4 bg-yellow-100 rounded-lg border-2 border-yellow-300 shadow-md">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center mb-3">
          <Home className="w-6 h-6 md:w-7 md:h-7 text-orange-500 mr-2" />
          <h3 className="text-xl md:text-2xl font-bold text-orange-600">
            ¡Especial de Semana Santa! Hotel para tu mascota
          </h3>
        </div>
        <p className="mb-4 text-base text-orange-800">
          Mientras disfrutas de tus vacaciones, tu mejor amigo también merece
          unas vacaciones de lujo. ¡10% de descuento en estancias de 8+ días
          pagando en efectivo!
        </p>
        <div className="w-48 md:w-auto">
          <CustomButton
            href="/hotel-mascotas"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg"
          >
            Reserva Ahora
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default BannerSemanaSanta;