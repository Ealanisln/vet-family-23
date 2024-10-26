"use client";

import React, { useState } from "react";
import {
  FileText,
  User,
  PawPrint,
  AlertCircle,
  UserX,
  LucideIcon,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { MedicalRecordDialog } from "./AddMedicalRecordDialog";

interface MenuOptionProps {
  href: string;
  icon: LucideIcon;
  title: string;
}

const MenuOption: React.FC<MenuOptionProps> = ({ href, icon: Icon, title }) => (
  <Link href={href} className="block">
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <Icon className="w-12 h-12 mb-4 text-primary" />
        <h3 className="text-lg font-semibold text-center">{title}</h3>
      </CardContent>
    </Card>
  </Link>
);

interface AdminDashboardProps {
  username: string;
  isAdmin: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  username,
  isAdmin,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const options: MenuOptionProps[] = [
    { title: "Propietarios", icon: User, href: "/admin/clientes" },
    { title: "Nuevo Propietario", icon: UserPlus, href: "/admin/clientes/nuevo-cliente" },
    { title: "Mascotas", icon: PawPrint, href: "/admin/mascotas" },
    {
      title: "Reportar un Problema",
      icon: AlertCircle,
      href: "mailto:emmanuel@alanis.dev?subject=Reporte%20de%20Problema%20-%20Panel%20de%20Administración",
    },
  ];

  const logoutOption: MenuOptionProps = {
    title: "Cerrar sesión",
    icon: UserX,
    href: "/api/auth/logout",
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-[300px]">
        <picture>
          <source srcSet="/assets/admin/banner.webp" type="image/webp" />
          <Image
            src="/assets/admin/banner.png"
            alt="Veterinary clinic"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </picture>
      </div>
      
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">
            Panel de administración
          </h1>
          <h2 className="text-xl text-muted-foreground">
            Bienvenido: {username}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {options.map((option, index) => (
            <MenuOption key={index} {...option} />
          ))}
          <MedicalRecordDialog
            triggerButton={
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <FileText className="w-12 h-12 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold text-center">
                    Nueva consulta
                  </h3>
                </CardContent>
              </Card>
            }
          />
          <MenuOption {...logoutOption} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;