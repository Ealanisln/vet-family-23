"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  Users,
  PawPrint,
  FileText,
  AlertCircle,
  LogOut,
  PlusCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AddMedicalRecordDialog } from "@/app/(admin)/admin/AddMedicalRecordDialog";

interface NavItemProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, onClick }) => {
  const content = (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 cursor-pointer"
      onClick={onClick}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? <Link href={href}>{content}</Link> : content}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};

export const DesktopSidebar: React.FC = () => {
  const [isAddMedicalRecordOpen, setIsAddMedicalRecordOpen] = useState(false);

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
          <NavItem
            href="/admin/clientes"
            icon={<Users className="h-5 w-5" />}
            label="Propietarios"
          />
          <NavItem
            href="/admin/mascotas"
            icon={<PawPrint className="h-5 w-5" />}
            label="Mascotas"
          />
          <NavItem
            icon={<PlusCircle className="h-5 w-5" />}
            label="Agregar Historial Médico"
            onClick={() => setIsAddMedicalRecordOpen(true)}
          />

          <NavItem
            href="mailto:emmanuel@alanis.dev"
            icon={<AlertCircle className="h-5 w-5" />}
            label="Reportar un problema"
          />
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <NavItem
            href="#"
            icon={<LogOut className="h-5 w-5" />}
            label="Cerrar sesión"
          />
        </nav>
      </aside>
      <AddMedicalRecordDialog
        open={isAddMedicalRecordOpen}
        onOpenChange={setIsAddMedicalRecordOpen}
      />
    </TooltipProvider>
  );
};
