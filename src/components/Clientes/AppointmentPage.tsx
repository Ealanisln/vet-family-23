import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarProps {
  className?: string;
}

const AppointmentCalendar: React.FC<CalendarProps> = ({ className }) => {
  return (
    <div className="w-full mx-auto p-2 sm:p-4 md:p-6 max-w-[95%] sm:max-w-[90%] md:max-w-6xl">
      <Card className={cn(
        "shadow-lg bg-white",
        "transition-all duration-300",
        className
      )}>
        <CardHeader className="space-y-2 sm:space-y-3">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold text-center">
            Agenda tu Cita
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-center">
            Selecciona el día y hora que mejor te convenga para tu consulta veterinaria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "w-full bg-white rounded-lg overflow-hidden",
            "h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]",
            "transition-all duration-300"
          )}>
            <iframe
              src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3UnNtdbGuwqDc9-InHC8YY2i2OjO9IHwYSdH79vz1TSPfWWe-fSDP5Gk1idbTbnttIJ-rqGGyP?gv=true"
              className={cn(
                "w-full h-full border-0 rounded-lg",
                "scale-[0.99] sm:scale-100", // Ligero ajuste de escala en móvil
                "transition-transform duration-300"
              )}
              title="Calendario de Citas"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentCalendar;