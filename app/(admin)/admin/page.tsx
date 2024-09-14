import { UserPlus, PawPrint, UserCog, PenTool, Calendar, FileText, Bell, Users, Syringe, Stethoscope, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Component() {
  const username = "Administrador"; // This can be fetched or set dynamically using server-side methods
  const options = [
    { title: "Gestión de Clientes", icon: Users, href: "/admin/clientes" },
    { title: "Gestión de Mascotas", icon: PawPrint, href: "/admin/mascotas" },
    { title: "Historial Médico", icon: Stethoscope, href: "/admin/historial-medico" },
    { title: "Vacunaciones", icon: Syringe, href: "/admin/vacunaciones" },
    { title: "Citas", icon: Calendar, href: "/admin/citas" },
    { title: "Facturación", icon: DollarSign, href: "/admin/facturacion" },
    { title: "Recordatorios", icon: Bell, href: "/admin/recordatorios" },
    { title: "Personal", icon: UserCog, href: "/admin/personal" },
    { title: "Reportes", icon: FileText, href: "/admin/reportes" },
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {options.map((option, index) => (
          <Link href={option.href} key={index} className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <option.icon className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold text-center">{option.title}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}