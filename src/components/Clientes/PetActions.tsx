import * as React from "react";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TablePet {
  id: string;
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  isDeceased: boolean;
}

interface PetActionsProps {
  pet: TablePet;
}

export default function PetActions({ pet }: PetActionsProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/admin/mascotas/${pet.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => router.push(`/admin/mascotas/${pet.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar mascota
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}