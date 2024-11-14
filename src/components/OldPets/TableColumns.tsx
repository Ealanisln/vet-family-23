// components/PetsTable/TableColumns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type Pet = {
  id: number;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  petName: string;
  species: string;
  gender: string;
  breed: string;
  birthDate: string;
  age: string;
  weight: string;
  isNeutered: string;
  condition: string;
  consultReason: string;
};

export const createColumns = (): ColumnDef<Pet>[] => [
  {
    accessorKey: "ownerName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Dueño
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "petName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Mascota
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "species",
    header: "Especie",
  },
  {
    accessorKey: "breed",
    header: "Raza",
  },
  {
    accessorKey: "age",
    header: "Edad",
  },
  {
    accessorKey: "weight",
    header: "Peso",
  },
  {
    accessorKey: "isNeutered",
    header: "Esterilizado",
  },
  {
    accessorKey: "condition",
    header: "Condición",
  },
  {
    accessorKey: "consultReason",
    header: "Motivo Consulta",
  },
];