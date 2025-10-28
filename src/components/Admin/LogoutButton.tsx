"use client";

import { LogOut } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export default function LogoutButton() {
  const handleLogout = () => {
    // FIX: Usar window.location para evitar problemas de RSC/CORS
    window.location.href = "/api/auth/logout";
  };
  
  return (
    <SidebarMenuButton
      onClick={handleLogout}
      tooltip="Cerrar Sesión"
      className="group-data-[collapsible=icon]:justify-center hover:bg-red-100 hover:text-red-600 transition-colors duration-200 cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      <span className="group-data-[collapsible=icon]:hidden">
        Cerrar Sesión
      </span>
    </SidebarMenuButton>
  );
}
