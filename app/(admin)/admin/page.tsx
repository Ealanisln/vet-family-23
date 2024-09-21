import { FileText, UserPlus, PawPrint, UserCog, PenTool, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function Component() {
  const username = "Usuario"; // This can be fetched or set dynamically using server-side methods
  const options = [
    { title: "Alta de Propietarios", icon: UserPlus },
    { title: "Alta de Mascotas", icon: PawPrint },
    { title: "Actualización de Datos de Propietarios", icon: UserCog },
    { title: "Actualización de Datos de Mascotas", icon: PenTool },
    { title: "Reportar un Problema", icon: AlertTriangle },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
          <Image
            src="/assets/admin/banner.png"
            alt="Veterinary clinic"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">Panel de administración</h1>
          <h2 className="text-xl text-muted-foreground">Bienvenido: {username}</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <option.icon className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-lg font-semibold text-center">{option.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
