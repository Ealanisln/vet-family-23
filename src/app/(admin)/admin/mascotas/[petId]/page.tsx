// app/(admin)/admin/mascotas/[petId]/page.tsx

import { prisma } from "@/lib/prismaDB";
import { notFound } from "next/navigation";
import { VaccinationContainer } from "@/components/Vaccination/VaccinationContainer";
import { DewormingContainer } from "@/components/Deworming/DewormingContainer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PetDetailsPage({
  params,
}: {
  params: { petId: string };
}) {
  const pet = await prisma.pet.findUnique({
    where: { id: params.petId },
    include: {
      user: true,
      vaccinations: true,
      deworming: true,
    },
  });

  if (!pet) {
    notFound();
  }

  const age = format(new Date(pet.dateOfBirth), "dd 'de' MMMM 'de' yyyy", {
    locale: es,
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-6 sm:py-10">
        <div className="mb-6">
          <Link href="/admin/mascotas">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Mascota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="mt-1">{pet.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Especie</p>
                  <p className="mt-1">{pet.species}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Raza</p>
                  <p className="mt-1">{pet.breed}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Fecha de Nacimiento
                  </p>
                  <p className="mt-1">{age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Género</p>
                  <p className="mt-1">{pet.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Peso</p>
                  <p className="mt-1">{pet.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Número de Microchip
                  </p>
                  <p className="mt-1">{pet.microchipNumber || "No registrado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <div className="mt-1">
                    <Badge
                      variant={pet.isDeceased ? "destructive" : "default"}
                      className="rounded-full"
                    >
                      {pet.isDeceased ? "Fallecido" : "Activo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Propietario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="mt-1">
                    {pet.user.firstName} {pet.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1">{pet.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1">{pet.user.phone || "No registrado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dirección</p>
                  <p className="mt-1">{pet.user.address || "No registrada"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <VaccinationContainer
            petId={pet.id}
            petSpecies={pet.species}
            vaccinations={pet.vaccinations}
          />

          <DewormingContainer
            petId={pet.id}
            petSpecies={pet.species}
            dewormings={pet.deworming}
          />
        </div>
      </div>
    </div>
  );
}