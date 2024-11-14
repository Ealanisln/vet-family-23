// app/(main)/cliente/editar/page.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { getUserById, updateUser } from '@/app/actions/get-customers';
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  visits: number;
  nextVisitFree: boolean;
};

export default function EditUserProfile({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    visits: 0,
    nextVisitFree: false
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        setUser({
          id: userData.id,
          firstName: userData.firstName ?? '',
          lastName: userData.lastName ?? '',
          email: userData.email ?? '',
          phone: userData.phone ?? '',
          address: userData.address ?? '',
          visits: userData.visits ?? 0,
          nextVisitFree: userData.nextVisitFree ?? false
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar tu información.",
          variant: "destructive",
        });
      }
    };

    fetchUser();
  }, [userId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Solo enviamos los campos que el usuario puede editar
      const { visits, nextVisitFree, ...editableUserData } = user;
      await updateUser(editableUserData);
      toast({
        title: "Perfil actualizado",
        description: "Tus datos se han guardado correctamente.",
        action: (
          <ToastAction altText="Cerrar">Cerrar</ToastAction>
        ),
      });
      router.refresh();
      router.push('/cliente');
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar tu información.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Editar Mi Perfil</h1>
      <Card className="w-full">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-xl">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={user.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={user.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={user.phone}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={user.address}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              <SaveIcon className="mr-2 h-4 w-4" /> Guardar Cambios
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}