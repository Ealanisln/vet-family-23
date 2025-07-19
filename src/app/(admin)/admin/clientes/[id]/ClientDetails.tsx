"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  EditIcon,
  PawPrintIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Gift,
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
import { useState, useCallback, useEffect, useRef } from "react";
import PetForm from "@/components/Admin/ui/PetForm";
import { PetTableSkeleton } from "@/components/ui/pet-table-skeleton";

interface Pet {
  id: string | number;
  name: string;
  species: string;
  isDeceased: boolean;
  internalId?: string;
  breed?: string;
  dateOfBirth?: Date;
  gender?: string;
  weight?: number;
  microchipNumber?: string;
  isNeutered?: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  visits: number;
  nextVisitFree: boolean;
  pets: Pet[];
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

export default function ClientDetails({ user }: { user: User }) {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>(user.pets || []);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const isRefreshingRef = useRef(false);

  const refreshPets = useCallback(async () => {
    if (isRefreshingRef.current) return; // Evitar múltiples llamadas simultáneas
    
    try {
      isRefreshingRef.current = true;
      setIsLoadingPets(true);
      // Fetch updated user data to get the latest pets
      const response = await fetch(`/api/clients/${user.id}/pets`, {
        cache: 'no-store', // Forzar una nueva consulta
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (response.ok) {
        const updatedPets = await response.json();
        setPets(updatedPets);
        console.log(`Refreshed pets for user ${user.id}:`, updatedPets);
      } else {
        console.error('Failed to refresh pets:', response.status, response.statusText);
        // Fallback to router.refresh if API call fails
        router.refresh();
      }
    } catch (error) {
      console.error("Error refreshing pets:", error);
      // Fallback to router.refresh if API call fails
      router.refresh();
    } finally {
      isRefreshingRef.current = false;
      setIsLoadingPets(false);
    }
  }, [user.id, router]);

  // Auto-refresh pets when component mounts only
  useEffect(() => {
    // Pequeño delay para permitir que la base de datos se actualice después de la redirección
    const timeoutId = setTimeout(() => {
      refreshPets();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const formatPetForForm = (pet: Pet) => {
    // Manejar dateOfBirth que puede venir como string del API
    let dateOfBirthString = "";
    if (pet.dateOfBirth) {
      try {
        // Si dateOfBirth es un string, convertirlo a Date primero
        const date = typeof pet.dateOfBirth === 'string' 
          ? new Date(pet.dateOfBirth) 
          : pet.dateOfBirth;
        
        // Verificar que la fecha sea válida
        if (date instanceof Date && !isNaN(date.getTime())) {
          dateOfBirthString = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error formatting dateOfBirth:', error);
        dateOfBirthString = "";
      }
    }

    return {
      id: pet.id?.toString(),
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      dateOfBirth: dateOfBirthString,
      gender: pet.gender || "",
      weight: pet.weight?.toString() || "",
      microchipNumber: pet.microchipNumber || "",
      internalId: pet.internalId || "",
      isNeutered: pet.isNeutered || false,
      isDeceased: pet.isDeceased || false,
      medicalHistory: "",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              Detalles del Cliente
            </h1>
            <p className="text-gray-600 mt-2">Información completa y historial de mascotas</p>
          </div>
        </div>

        {/* Personal Information Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex justify-between items-center text-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Información Personal
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/clientes/${user.id}/edit`)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <EditIcon className="mr-2 h-4 w-4" /> Editar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                  <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Phone className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-lg font-semibold text-gray-900">{formatPhoneNumber(user.phone)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dirección</p>
                  <p className="text-lg font-semibold text-gray-900">{user.address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Visit Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Total de Visitas</p>
                  <p className="text-2xl font-bold text-blue-900">{user.visits}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-200 rounded-lg">
                  <Gift className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Próxima Visita Gratis</p>
                  <Badge 
                    variant={user.nextVisitFree ? "default" : "secondary"}
                    className={`text-sm ${user.nextVisitFree ? "bg-green-600 hover:bg-green-700" : ""}`}
                  >
                    {user.nextVisitFree ? "Sí" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pets Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex justify-between items-center text-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <PawPrintIcon className="h-5 w-5 text-green-600" />
                </div>
                Mascotas Registradas
                <Badge variant="outline" className="ml-2">
                  {pets.length}
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  router.push(`/admin/clientes/${user.id}/mascota/agregar`)
                }
                className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Agregar Mascota
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPets ? (
              <PetTableSkeleton rows={3} />
            ) : pets.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="font-semibold">Nombre</TableHead>
                      <TableHead className="font-semibold">Especie</TableHead>
                      <TableHead className="font-semibold">ID Interno</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pets.map((pet: Pet, index) => (
                      <TableRow key={pet.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <TableCell>
                          <div className="p-2 bg-blue-100 rounded-lg w-fit">
                            <PawPrintIcon className="h-4 w-4 text-blue-600" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/clientes/${user.id}/mascota/${pet.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 flex items-center gap-2"
                          >
                            {pet.name}
                            {pet.isDeceased && (
                              <Badge variant="destructive" className="text-xs">
                                Finado
                              </Badge>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {pet.species}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{pet.internalId || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {pet.isNeutered && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Esterilizado
                              </Badge>
                            )}
                            {!pet.isDeceased && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                Activo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <PetForm
                            isEditing={true}
                            initialPet={formatPetForForm(pet)}
                            userId={user.id}
                            onPetUpdated={refreshPets}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <PawPrintIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay mascotas registradas
                </h3>
                <p className="text-gray-600 mb-6">
                  Este cliente aún no tiene mascotas asociadas a su perfil.
                </p>
                <Button
                  onClick={() =>
                    router.push(`/admin/clientes/${user.id}/mascota/agregar`)
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlusIcon className="mr-2 h-4 w-4" /> Agregar Primera Mascota
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
