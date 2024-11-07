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
  FolderClock,
  Package,
  Syringe,
  AlertTriangle,
  History,
  Calendar,
  PackageCheck,
  CircleDollarSign,
  ScrollText,
  Users,
  ClipboardList,
  Bell,
  UserCog,
  SyringeIcon,
  Pill,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MenuOptionProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  onClick?: () => void;
}

const MenuOption: React.FC<MenuOptionProps> = ({ 
  href, 
  icon: Icon, 
  title, 
  description,
  className,
  onClick,
}) => (
  <Link 
    href={href} 
    className={cn(
      "block transition-all duration-300",
      className
    )}
    onClick={onClick}
  >
    <Card className="h-full hover:shadow-lg hover:scale-102 transition-all duration-300 bg-white/50 backdrop-blur-sm border-muted/20">
      <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[180px]">
        <div className="rounded-full bg-[#47b3b6]/10 p-4 mb-4">
          <Icon className="w-6 h-6 text-[#47b3b6]" />
        </div>
        <h3 className="text-lg font-semibold text-center text-[#47b3b6]">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  </Link>
);

interface SectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon: Icon, title, children }) => (
  <AccordionItem value={title.toLowerCase()} className="border-none">
    <AccordionTrigger className="hover:no-underline rounded-lg px-4 py-2 text-lg font-bold bg-[#47b3b6]/10 text-[#47b3b6] hover:bg-[#47b3b6]/20">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {children}
      </div>
    </AccordionContent>
  </AccordionItem>
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

  const clientOptions: MenuOptionProps[] = [
    { 
      title: "Clientes",
      icon: Users,
      href: "/admin/clientes",
      description: "Gestionar usuarios y propietarios"
    },
    { 
      title: "Nuevo Cliente",
      icon: UserPlus,
      href: "/admin/clientes/nuevo",
      description: "Registrar nuevo usuario"
    },
    { 
      title: "Mascotas",
      icon: PawPrint,
      href: "/admin/mascotas",
      description: "Gestionar registro de mascotas"
    },
    { 
      title: "Historial Médico",
      icon: ClipboardList,
      href: "/admin/historial-medico",
      description: "Ver historiales clínicos"
    },
  ];

  const inventoryOptions: MenuOptionProps[] = [
    {
      title: "Inventario",
      icon: Package,
      href: "/admin/inventario",
      description: "Ver todos los productos"
    },
    {
      title: "Medicamentos",
      icon: Pill,
      href: "/admin/inventario/medicamentos",
      description: "Gestionar medicamentos"
    },
    {
      title: "Vacunas",
      icon: SyringeIcon,
      href: "/admin/inventario/vacunas",
      description: "Control de vacunas"
    },
    {
      title: "Movimientos",
      icon: History,
      href: "/admin/inventario/movimientos",
      description: "Registro de movimientos"
    },
  ];

  const appointmentOptions: MenuOptionProps[] = [
    {
      title: "Citas",
      icon: Calendar,
      href: "/admin/citas",
      description: "Gestionar agenda"
    },
    {
      title: "Vacunación",
      icon: SyringeIcon,
      href: "/admin/vacunacion",
      description: "Calendario de vacunación"
    },
    // {
    //   title: "Recordatorios",
    //   icon: Bell,
    //   href: "/admin/recordatorios",
    //   description: "Gestionar recordatorios"
    // },
    {
      title: "Facturación",
      icon: CircleDollarSign,
      href: "/admin/facturacion",
      description: "Gestionar pagos y cobros"
    },
  ];

  const administrationOptions: MenuOptionProps[] = [
    // {
    //   title: "Personal",
    //   icon: UserCog,
    //   href: "/admin/personal",
    //   description: "Gestionar staff"
    // },
    // {
    //   title: "Reportes",
    //   icon: ScrollText,
    //   href: "/admin/reportes",
    //   description: "Generar reportes"
    // },
    {
      title: "Archivo",
      icon: FolderClock,
      href: "/admin/archivo",
      description: "Archivo histórico"
    },
    {
      title: "Stock Bajo",
      icon: AlertTriangle,
      href: "/admin/inventario/bajo-stock",
      description: "Productos por reordenar"
    },
  ];

  const quickActions: MenuOptionProps[] = [
    {
      title: "Nueva Consulta",
      icon: FileText,
      href: "#",
      description: "Registrar consulta médica",
      onClick: () => setIsDialogOpen(true)
    },
    {
      title: "Soporte",
      icon: AlertCircle,
      href: "mailto:emmanuel@alanis.dev?subject=Reporte%20de%20Problema%20-%20Panel%20de%20Administración",
      description: "Contactar soporte técnico"
    },
    {
      title: "Cerrar Sesión",
      icon: UserX,
      href: "/api/auth/logout",
      description: "Salir del sistema"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="relative w-full h-[200px] mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#47b3b6]/20 to-transparent" />
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
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-[#47b3b6] bg-gradient-to-r from-[#47b3b6] to-[#47b3b6]/60 bg-clip-text text-transparent">
            Panel de administración
          </h1>
          <h2 className="text-xl text-muted-foreground">
            Bienvenido: {username}
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <Section title="Gestión de Clientes" icon={Users}>
            {clientOptions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </Section>

          <Section title="Inventario" icon={Package}>
            {inventoryOptions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </Section>

          {/* <Section title="Citas y Agenda" icon={Calendar}>
            {appointmentOptions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </Section> */}

          <Section title="Administración" icon={UserCog}>
            {administrationOptions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {quickActions.map((option, index) => (
              <MenuOption key={index} {...option} />
            ))}
          </div>
        </Accordion>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Consulta Médica</DialogTitle>
          </DialogHeader>
          {/* Aquí puedes agregar el contenido de tu formulario */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;