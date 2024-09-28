import React from "react";
import Link from "next/link";
import {
  Home,
  Users,
  PawPrint,
  FileText,
  AlertCircle,
  LogOut,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
    >
      {icon}
      {label}
    </Link>
  );
};

export const MobileNavigation: React.FC = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/admin/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Home className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Dashboard</span>
          </Link>
          <NavItem href="/admin/clientes" icon={<Users className="h-5 w-5" />} label="Propietarios" />
          <NavItem href="/admin/mascotas" icon={<PawPrint className="h-5 w-5" />} label="Mascotas" />
          <NavItem href="/admin/nueva-consulta" icon={<FileText className="h-5 w-5" />} label="Nueva consulta" />
          <NavItem href="/admin/reportar-problema" icon={<AlertCircle className="h-5 w-5" />} label="Reportar un problema" />
          <NavItem href="#" icon={<LogOut className="h-5 w-5" />} label="Cerrar sesión" />
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;