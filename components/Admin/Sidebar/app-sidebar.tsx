"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  Users,
  PawPrint,
  AlertCircle,
  LogOut,
  PlusCircle,
  Settings2,
  FileText,
  Dog
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

const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Vet Family",
      logo: Dog,
      plan: "Administrador",
    },
  ],
  navMain: [
    {
      title: "Propietarios",
      url: "/admin/clientes",
      icon: Users,
      items: [
        {
          title: "Ver todos",
          url: "/admin/clientes",
        },
        {
          title: "Agregar nuevo",
          url: "/admin/clientes/nuevo-cliente",
        },
      ],
    },
    {
      title: "Mascotas",
      url: "/admin/mascotas",
      icon: PawPrint,
      items: [
        {
          title: "Ver todas",
          url: "/admin/mascotas",
        },
        // {
        //   title: "Agregar nueva",
        //   url: "/admin/mascotas/nueva",
        // },
      ],
    },
    // {
    //   title: "Historial Médico",
    //   url: "#",
    //   icon: FileText,
    //   items: [
    //     {
    //       title: "Ver historiales",
    //       url: "/admin/historiales",
    //     },
    //   ],
    // },
    // {
    //   title: "Configuración",
    //   url: "/admin/configuracion",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "/admin/configuracion/general",
    //     },
    //     {
    //       title: "Perfil",
    //       url: "/admin/configuracion/perfil",
    //     },
    //   ],
    // },
  ],
};

const AddMedicalRecordButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>((props, ref) => (
  <SidebarMenuButton
    ref={ref}
    tooltip="Agregar Historial Médico"
    className="group-data-[collapsible=icon]:justify-center"
    {...props}
  >
    <PlusCircle className="h-4 w-4" />
    <span className="group-data-[collapsible=icon]:hidden">
      Agregar Historial Médico
    </span>
  </SidebarMenuButton>
));
AddMedicalRecordButton.displayName = "AddMedicalRecordButton";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="border-r bg-background" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarMenu>
          <SidebarMenuItem>
            <MedicalRecordDialog
              triggerButton={<AddMedicalRecordButton />}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Reportar un problema"
              className="group-data-[collapsible=icon]:justify-center"
            >
              <Link href="mailto:emmanuel@alanis.dev">
                <AlertCircle className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Reportar un problema
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}