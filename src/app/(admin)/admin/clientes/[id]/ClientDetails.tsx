"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  PlusIcon,
  EditIcon,
  PawPrintIcon,
  SyringeIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Pet {
  id: string | number;
  name: string;
  species: string;
  isDeceased: boolean;
  internalId?: string;
}

const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return "N/A";
  // Eliminar todos los caracteres no numéricos
  const digits = phone.replace(/\D/g, "");
  // Tomar los últimos 10 dígitos
  const last10Digits = digits.slice(-10);
  // Formatear como (XXX) XXX-XXXX
  return last10Digits.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
};

export default function ClientDetails({ user }: { user: any }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <h1 className="text-2xl font-bold mb-4">Detalles del Cliente</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Información Personal
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/clientes/${user.id}/edit`)}
              >
                <EditIcon className="mr-2 h-4 w-4" /> Editar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Nombre:</p>
                <p>
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="font-semibold">Teléfono:</p>
                <p>{formatPhoneNumber(user.phone)}</p>
              </div>
              <div>
                <p className="font-semibold">Dirección:</p>
                <p>{user.address || "N/A"}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Visitas: {user.visits}</p>
              <div className="font-semibold flex items-center">
                <span className="mr-2">Próxima visita gratis:</span>
                <Badge variant="secondary">
                  {user.nextVisitFree ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Mascotas
              <Button
                size="sm"
                onClick={() =>
                  router.push(`/admin/clientes/${user.id}/mascota/agregar`)
                }
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Agregar Mascota
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>ID Interno</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.pets.length > 0 ? (
                  user.pets.map((pet: Pet) => (
                    <TableRow key={pet.id}>
                      <TableCell>
                        <PawPrintIcon className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/clientes/${user.id}/mascota/${pet.id}`}
                          className="font-medium text-black hover:underline"
                        >
                          {pet.name}
                          {pet.isDeceased ? " (Finado)" : ""}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pet.species}</Badge>
                      </TableCell>
                      <TableCell>{pet.internalId || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No hay mascotas registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
