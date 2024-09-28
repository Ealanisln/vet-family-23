import React from "react";
import Link from "next/link";
import {
  Home,
  Users,
  PawPrint,
  FileText,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};

export const DesktopSidebar: React.FC = () => {
  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/admin/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Home className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Dashboard</span>
          </Link>
          <NavItem href="/admin/clientes" icon={<Users className="h-5 w-5" />} label="Propietarios" />
          <NavItem href="/admin/mascotas" icon={<PawPrint className="h-5 w-5" />} label="Mascotas" />
          <NavItem href="/admin/nueva-consulta" icon={<FileText className="h-5 w-5" />} label="Nueva consulta" />
          <NavItem href="/admin/reportar-problema" icon={<AlertCircle className="h-5 w-5" />} label="Reportar un problema" />
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <NavItem href="#" icon={<LogOut className="h-5 w-5" />} label="Cerrar sesión" />
        </nav>
      </aside>
    </TooltipProvider>
  );
};