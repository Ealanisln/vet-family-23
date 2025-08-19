// src/app/(admin)/admin/mascotas/nueva/page.tsx

"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import UnifiedPetForm, { PetFormData } from '@/components/ui/UnifiedPetForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { addPet } from '@/app/actions/add-edit-pet';
import { searchUsers } from '@/app/actions/search-users';

interface User {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}

// Using PetFormData from UnifiedPetForm instead of custom interface

const SUBMIT_TIMEOUT = 30000;

const NuevaMascotaPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Buscar usuarios cuando el input cambie
  React.useEffect(() => {
    const handleSearch = () => {
      if (debouncedSearch.length >= 3) {
        startTransition(async () => {
          try {
            const results = await searchUsers(debouncedSearch);
            setUsers(results);
          } catch (error) {
            console.error('Error searching users:', error);
            toast({
              title: 'Error',
              description: 'No se pudo completar la búsqueda de usuarios',
              variant: 'destructive',
            });
            setUsers([]);
          }
        });
      } else {
        setUsers([]);
      }
    };

    handleSearch();
  }, [debouncedSearch]);

  const handleSubmit = async (petData: PetFormData) => {
    if (isSubmitting || !selectedUserId) return;

    setIsSubmitting(true);
    const timeout = setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Tiempo de espera agotado',
        description: 'La operación ha tardado demasiado. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    }, SUBMIT_TIMEOUT);

    try {
      // Convert PetFormData to the format expected by addPet action
      const petPayload = {
        ...petData,
        dateOfBirth: petData.dateOfBirth instanceof Date 
          ? petData.dateOfBirth 
          : new Date(petData.dateOfBirth),
        weight: typeof petData.weight === 'string' 
          ? parseFloat(petData.weight) 
          : petData.weight,
      };

      const result = await addPet(selectedUserId, petPayload);
      if (result.success) {
        toast({
          title: 'Mascota agregada',
          description: 'La mascota se ha registrado correctamente',
        });
        
        // Refresco forzado antes de la redirección
        router.refresh();
        
        // Redirigir al admin de mascotas en lugar de al cliente específico
        setTimeout(() => {
          router.push('/admin/mascotas');
        }, 100);
      } else {
        throw new Error(result.error || 'Error al registrar la mascota');
      }
    } catch (error) {
      console.error('Error al agregar mascota:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ocurrió un error al intentar registrar la mascota',
        variant: 'destructive',
      });
    } finally {
      clearTimeout(timeout);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      router.push('/admin/mascotas');
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.name) return user.name;
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Usuario sin nombre';
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-6 sm:py-10">
        <div className="space-y-6">
          {!selectedUserId ? (
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar cliente por nombre o email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  <Button variant="outline" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  {isPending ? (
                    <div className="text-center py-4">Buscando usuarios...</div>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center space-x-4"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{getUserDisplayName(user)}</p>
                          <div className="text-sm text-gray-500 space-x-2">
                            {user.email && <span>{user.email}</span>}
                            {user.phone && <span>· {user.phone}</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : searchQuery.length >= 3 ? (
                    <div className="text-center py-4 text-gray-500">
                      No se encontraron usuarios
                    </div>
                  ) : searchQuery.length > 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Ingresa al menos 3 caracteres para buscar
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : (
            <UnifiedPetForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              userId={selectedUserId}
              isSubmitting={isSubmitting}
              showInternalId={true}
              showMedicalHistory={true}
              showDeceasedToggle={true}
              showAsCard={true}
              title="Agregar Nueva Mascota"
              submitButtonText="Registrar Mascota"
              cancelButtonText="Cancelar"
              className="max-w-4xl"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NuevaMascotaPage;