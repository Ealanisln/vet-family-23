// components/Clientes/ReservaCita.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaPhone } from "react-icons/fa";

const DialogoReservaMejorado = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center">
          Reservar una Cita
          <span className="bg-slate-600 hover:bg-slate-700 text-white rounded-full ml-2 p-2">
            <FaPhone className="text-sm" />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[75%] lg:max-w-[90%] ">
        <DialogHeader>
          <DialogTitle>Reservar una Cita</DialogTitle>
          <DialogDescription>
            Elige un horario adecuado para tu cita.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-[70vh] min-h-[400px]">
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3UnNtdbGuwqDc9-InHC8YY2i2OjO9IHwYSdH79vz1TSPfWWe-fSDP5Gk1idbTbnttIJ-rqGGyP?gv=true"
            width="100%"
            height="100%"
            className="border-0"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogoReservaMejorado;