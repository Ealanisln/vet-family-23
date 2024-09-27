import { FileText, UserPlus, PawPrint, UserCog, PenTool, AlertTriangle, XIcon, LucideMessageCircleX, MessageCircleXIcon, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Component() {
  const { getUser, getRoles, isAuthenticated } = getKindeServerSession();
  const user = await getUser();
  const roles = await getRoles();

  const isAdmin = roles?.some((role) => role.key === "admin");

  if (!isAdmin) {
    redirect("/usuario");
  }

  const username = user.given_name;
  const options = [
    { title: "Alta de Propietarios", icon: UserPlus, href: "/admin/nuevo-cliente" },
    { title: "Alta de Mascotas", icon: PawPrint, href: "/admin/nueva-mascota" },
    { title: "Actualización de Datos de Propietarios", icon: UserCog, href: "/admin/owners/update" },
    { title: "Actualización de Datos de Mascotas", icon: PenTool, href: "/admin/pets/update" },
    { title: "Reportar un Problema", icon: AlertTriangle, href: "/admin/report-problem" },
    { title: "Cerrar sesión", icon: UserX, href: "/api/auth/logout" },
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