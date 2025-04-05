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
  Package,
  Pill,
  SyringeIcon,
  Users,
  ShieldCheck,
  CircleDollarSign,
  LayoutDashboard,
  History,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { MedicalRecordDialog } from "./AddMedicalRecordDialog";

interface MenuOptionProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  onClick?: () => void;
}

interface SectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

interface AdminDashboardProps {
  username: string;
  isAdmin: boolean;
}

// Componente MenuOption mejorado
const MenuOption: React.FC<MenuOptionProps> = ({
  href,
  icon: Icon,
  title,
  description,
  className,
  onClick,
}) => {
  const cardContent = (
    <Card className="group relative overflow-hidden h-full hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-white to-blue-50 border-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#47b3b6]/5 to-[#47b3b6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="flex flex-col items-center justify-center p-8 h-full min-h-[200px] relative z-10">
        <div className="rounded-2xl bg-gradient-to-br from-[#47b3b6]/10 to-[#47b3b6]/20 p-4 mb-6 transform group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-8 h-8 text-[#47b3b6] group-hover:text-[#3a9296] transition-colors duration-500" />
        </div>
        <h3 className="text-xl font-semibold text-center bg-gradient-to-r from-[#47b3b6] to-[#3a9296] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground text-center mt-4 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "block w-full transition-all duration-300 cursor-pointer",
          className
        )}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={cn("block w-full transition-all duration-300", className)}
    >
      {cardContent}
    </Link>
  );
};

const Section: React.FC<SectionProps> = ({ icon: Icon, title, children }) => (
  <AccordionItem value={title.toLowerCase()} className="border-none">
    <AccordionTrigger className="group hover:no-underline rounded-xl px-6 py-4 text-xl font-bold bg-gradient-to-r from-[#47b3b6]/5 to-[#47b3b6]/10 hover:from-[#47b3b6]/10 hover:to-[#47b3b6]/20 transition-all duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#47b3b6]/10 group-hover:bg-[#47b3b6]/20 transition-colors duration-500">
          <Icon className="w-6 h-6 text-[#47b3b6]" />
        </div>
        <span className="bg-gradient-to-r from-[#47b3b6] to-[#3a9296] bg-clip-text text-transparent">
          {title}
        </span>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {children}
      </div>
    </AccordionContent>
  </AccordionItem>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  username,
}) => {
  const [openMedicalRecord, setOpenMedicalRecord] = useState(false);

  const clientOptions: MenuOptionProps[] = [
    {
      title: "Clientes",
      icon: Users,
      href: "/admin/clientes",
      description: "Gestionar usuarios y propietarios",
    },
    {
      title: "Nuevo Cliente",
      icon: UserPlus,
      href: "/admin/clientes/nuevo-cliente",
      description: "Registrar nuevo usuario",
    },
    {
      title: "Mascotas",
      icon: PawPrint,
      href: "/admin/mascotas",
      description: "Gestionar registro de mascotas",
    },
  ];

  const inventoryOptions: MenuOptionProps[] = [
    {
      title: "Inventario",
      icon: Package,
      href: "/admin/inventario",
      description: "Ver todos los productos",
    },
    {
      title: "Medicamentos",
      icon: Pill,
      href: "/admin/inventario/medicamentos",
      description: "Gestionar medicamentos",
    },
    {
      title: "Vacunas",
      icon: SyringeIcon,
      href: "/admin/inventario/vacunas",
      description: "Control de vacunas",
    },
  ];

  const posOptions: MenuOptionProps[] = [
    {
      title: "Panel POS",
      icon: LayoutDashboard,
      href: "/admin/pos",
      description: "Vista general del punto de venta",
    },
    {
      title: "Nueva Venta",
      icon: CircleDollarSign,
      href: "/admin/pos/ventas/nueva",
      description: "Registrar una nueva venta",
    },
    {
      title: "Historial",
      icon: History,
      href: "/admin/pos/ventas",
      description: "Ver historial de ventas",
    },
  ];

  const userManagementOptions: MenuOptionProps[] = [
    {
      title: "Gestión de Usuarios",
      icon: Users,
      href: "/admin/usuarios",
      description: "Administrar usuarios del sistema",
    },
    {
      title: "Roles y Permisos",
      icon: ShieldCheck,
      href: "/admin/usuarios/roles",
      description: "Gestionar roles y permisos",
    },
  ];

  const quickActions: MenuOptionProps[] = [
    {
      title: "Nueva Consulta",
      icon: FileText,
      href: "#",
      description: "Registrar consulta médica",
      onClick: () => setOpenMedicalRecord(true),
    },
    {
      title: "Soporte",
      icon: AlertCircle,
      href: "mailto:emmanuel@alanis.dev?subject=Reporte%20de%20Problema%20-%20Panel%20de%20Administración",
      description: "Contactar soporte técnico",
    },
    {
      title: "Cerrar Sesión",
      icon: UserX,
      href: "/api/auth/logout",
      description: "Salir del sistema",
      className: "lg:col-span-1",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#47b3b6]/10 via-white to-[#47b3b6]/10">
      <div className="relative w-full h-[300px] mb-12 bg-[#47b3b6]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#47b3b6] to-[#47b3b6]/90" />
        <picture>
          <source srcSet="/assets/admin/banner.webp" type="image/webp" />
          <Image
            src="/assets/admin/banner.png"
            alt="Veterinary clinic"
            fill
            priority
            className="object-cover opacity-20 mix-blend-overlay"
            sizes="100vw"
          />
        </picture>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl md:text-4xl font-light text-center text-white/90 tracking-wide drop-shadow-lg">
              Vet Family
            </h2>
            <div className="w-24 h-0.5 mx-auto bg-white/50 rounded-full shadow-lg" />
            <h1 className="text-4xl md:text-5xl font-bold text-center text-white drop-shadow-lg bg-clip-text">
              Panel de Administración
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/30 shadow-xl hover:from-white/25 hover:to-white/15 transition-all duration-300">
            <div className="p-2 bg-white/20 rounded-full">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-white/80 font-light">
                Bienvenido
              </span>
              <span className="text-lg text-white font-medium">{username}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <Accordion type="single" collapsible className="w-full space-y-6">
          <Section title="Gestión de Clientes" icon={Users}>
            {clientOptions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </Section>

          <Section title="Punto de Venta" icon={CircleDollarSign}>
            {posOptions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </Section>

          <Section title="Inventario" icon={Package}>
            {inventoryOptions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </Section>

          <Section title="Administración de Usuarios" icon={ShieldCheck}>
            {userManagementOptions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {quickActions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </div>
        </Accordion>
      </div>

      <MedicalRecordDialog 
        open={openMedicalRecord}
        onOpenChange={setOpenMedicalRecord}
        triggerButton={
          <button type="button" className="hidden" />
        }
      />
    </div>
  );
};

export default AdminDashboard;