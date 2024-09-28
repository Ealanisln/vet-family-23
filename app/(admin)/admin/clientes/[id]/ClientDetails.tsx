// app/admin/clientes/[id]/ClientDetails.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon, EditIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
                <p>{user.phone || "N/A"}</p>
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
                  router.push(`/admin/clientes/${user.id}/mascotas/agregar`)
                }
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Agregar Mascota
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.pets.length > 0 ? (
              <ul className="list-disc pl-5">
                {user.pets.map((pet: any) => (
                  <li key={pet.id}>
                    <Link href={`/admin/clientes/${user.id}/mascotas/${pet.id}`} className="text-blue-600 hover:underline">
                      {pet.name} ({pet.species})
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No hay mascotas registradas
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Próximas Citas
              <Button size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" /> Agendar Cita
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.appointments.length > 0 ? (
              <ul className="list-disc pl-5">
                {user.appointments.map((appointment: any) => (
                  <li key={appointment.id}>
                    {new Date(appointment.dateTime).toLocaleString()} -{" "}
                    {appointment.reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No hay citas próximas</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
