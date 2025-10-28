"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  PawPrint,
  AlertCircle,
  PlusCircle,
  Dog,
  Package,
  Pill,
  Syringe,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { NavMain } from "@/components/Admin/Sidebar/nav-main";
import { NavUser } from "@/components/Admin/Sidebar/nav-user";
import { TeamSwitcher } from "@/components/Admin/Sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

import { MedicalRecordDialog } from "@/app/(admin)/admin/AddMedicalRecordDialog";
import LogoutButton from "@/components/Admin/LogoutButton";

const data = {
  teams: [
    {
      name: "Vet Family",
      logo: Dog,
      plan: "Administrador",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
      items: [
        {
          title: "Panel Principal",
          url: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Clientes",
      url: "/admin/clientes",
      icon: Users,
      items: [
        {
          title: "Ver todos",
          url: "/admin/clientes",
          icon: Users,
        },
        {
          title: "Mascotas",
          url: "/admin/mascotas",
          icon: PawPrint,
        },
      ],
    },
    {
      title: "Inventario",
      url: "/admin/inventario",
      icon: Package,
      items: [
        {
          title: "Productos",
          url: "/admin/inventario",
          icon: Package,
        },
        {
          title: "Medicamentos",
          url: "/admin/inventario/medicamentos",
          icon: Pill,
        },
        {
          title: "Vacunas",
          url: "/admin/inventario/vacunas",
          icon: Syringe,
        },
      ],
    },
    {
      title: "Usuarios",
      url: "/admin/usuarios",
      icon: ShieldCheck,
      items: [
        {
          title: "Gestión de Usuarios",
          url: "/admin/usuarios",
          icon: Users,
        },
      ],
    },
  ],
};

const AddMedicalRecordButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>((props, ref) => (
  <SidebarMenuButton
    ref={ref}
    tooltip="Agregar Historial Médico"
    className="group-data-[collapsible=icon]:justify-center hover:bg-[#47b3b6]/10 hover:text-[#47b3b6] transition-colors duration-200"
    {...props}
  >
    <PlusCircle className="h-4 w-4" />
    <span className="group-data-[collapsible=icon]:hidden">
      Agregar Historial Médico
    </span>
  </SidebarMenuButton>
));
AddMedicalRecordButton.displayName = "AddMedicalRecordButton";

const NewClientButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>((props, ref) => (
  <SidebarMenuButton
    ref={ref}
    asChild
    tooltip="Nuevo Cliente"
    className="group-data-[collapsible=icon]:justify-center bg-[#47b3b6]/10 hover:bg-[#47b3b6]/20 text-[#47b3b6] hover:text-[#3a9296] font-medium transition-colors duration-200"
  >
    <Link href="/admin/clientes/nuevo-cliente">
      <UserPlus className="h-4 w-4" />
      <span className="group-data-[collapsible=icon]:hidden">
        Nuevo Cliente
      </span>
    </Link>
  </SidebarMenuButton>
));
NewClientButton.displayName = "NewClientButton";

const NewPetButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>((props, ref) => (
  <SidebarMenuButton
    ref={ref}
    asChild
    tooltip="Nueva Mascota"
    className="group-data-[collapsible=icon]:justify-center bg-[#47b3b6]/10 hover:bg-[#47b3b6]/20 text-[#47b3b6] hover:text-[#3a9296] font-medium transition-colors duration-200"
  >
    <Link href="/admin/mascotas/nueva">
      <PawPrint className="h-4 w-4" />
      <span className="group-data-[collapsible=icon]:hidden">
        Nueva Mascota
      </span>
    </Link>
  </SidebarMenuButton>
));
NewPetButton.displayName = "NewPetButton";

export function AppSidebar({ 
  user, 
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r bg-gradient-to-b from-white to-blue-50 border-r-[#47b3b6]/20" 
      {...props}
    >
      <SidebarHeader className="border-b border-[#47b3b6]/20">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="py-4">
        {/* Removemos las props que causaban el error */}
        <NavMain items={data.navMain} />
        <style jsx global>{`
          /* Estilos globales para los elementos del NavMain */
          .sidebar-menu-button {
            @apply hover:bg-[#47b3b6]/10 hover:text-[#47b3b6] transition-colors duration-200;
          }
          .sidebar-menu-button[data-active="true"] {
            @apply bg-[#47b3b6]/15 text-[#47b3b6] font-medium;
          }
          .sidebar-menu {
            @apply space-y-1;
          }
        `}</style>
        <SidebarMenu className="mt-6 px-2">
          <SidebarMenuItem>
            <NewClientButton />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <NewPetButton />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <MedicalRecordDialog
              triggerButton={
                <AddMedicalRecordButton className="hover:bg-[#47b3b6]/10 hover:text-[#47b3b6] transition-colors duration-200" />
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-[#47b3b6]/20">
        <SidebarMenu className="px-2">

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Reportar un problema"
              className="group-data-[collapsible=icon]:justify-center hover:bg-[#47b3b6]/10 hover:text-[#47b3b6] transition-colors duration-200"
            >
              <Link href="mailto:emmanuel@alanis.dev">
                <AlertCircle className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Reportar un problema
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Usamos datos reales del usuario o fallback */}
        <NavUser user={user || {
          name: "Admin",
          email: "admin@example.com", 
          avatar: "/avatars/admin.jpg"
        }} />
      </SidebarFooter>
      <SidebarRail className="bg-[#47b3b6]/5" />
    </Sidebar>
  );
}