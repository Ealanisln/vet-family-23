// app/admin/clientes/nueva-mascota/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AddPetForm from "@/components/Pet/AddPetForm";
import { addPet } from "@/app/actions/add-edit-pet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  UserPlus,
  Search,
  Users,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  kindeId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  preferredContactMethod: string | null;
}

interface NewUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  preferredContactMethod: string;
}

interface PetDataForSubmit {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber?: string;
  medicalHistory?: string;
  isNeutered: boolean;
}

const NuevaMascota: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userOption, setUserOption] = useState<"existing" | "new">("existing");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newUserData, setNewUserData] = useState<NewUserData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    preferredContactMethod: "phone",
  });

  const hasValidContact = () => {
    return Boolean(newUserData.email.trim() || newUserData.phone.trim());
  };

  const isFormValid = () => {
    return (
      newUserData.firstName.trim() !== "" &&
      newUserData.lastName.trim() !== "" &&
      hasValidContact() &&
      !isLoading
    );
  };

  const handleUserSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      setSearchLoading(true);
      try {
        const response = await fetch(`/api/users/search?q=${query}`);
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        } else {
          toast({
            title: "Error al buscar usuarios",
            description:
              data.error || "Ha ocurrido un error al buscar usuarios",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error searching users:", error);
        toast({
          title: "Error",
          description: "No se pudo completar la búsqueda de usuarios",
          variant: "destructive",
        });
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleNewUserSubmit = async () => {
    if (!hasValidContact()) {
      toast({
        title: "Error de validación",
        description: "Debes proporcionar al menos un email o un teléfono",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const identities = [];

      if (newUserData.phone.trim()) {
        identities.push({
          type: "phone",
          details: {
            phone: newUserData.phone.trim(),
          },
        });
      }

      if (newUserData.email.trim()) {
        identities.push({
          type: "email",
          details: {
            email: newUserData.email.trim(),
          },
        });
      }

      const userData = {
        profile: {
          given_name: newUserData.firstName,
          family_name: newUserData.lastName,
        },
        identities: identities,
        roles: ["user"],
        send_invite: newUserData.email.trim() ? true : false,
        address: newUserData.address,
        preferredContactMethod: newUserData.preferredContactMethod,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el usuario");
      }

      setSelectedUserId(data.dbUser.id);
      toast({
        title: "Usuario creado con éxito",
        description: newUserData.email.trim()
          ? "Se ha enviado un correo de invitación al usuario."
          : "Usuario registrado correctamente.",
      });
      setStep(3);
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error al crear el usuario",
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (userId: string, petData: PetDataForSubmit) => {
    try {
      const result = await addPet(userId, petData);
      if (result.success) {
        router.push(`/admin/clientes/${userId}`);
        toast({
          title: "Mascota agregada",
          description: "La mascota se ha registrado correctamente",
        });
      } else {
        console.error(result.error);
        toast({
          title: "Error",
          description: "No se pudo registrar la mascota",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al agregar mascota:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar registrar la mascota",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push("/admin/clientes");
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Seleccionar Usuario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={userOption}
          onValueChange={(value: "existing" | "new") => setUserOption(value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing">Usuario Existente</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new">Nuevo Usuario</Label>
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setStep(userOption === "existing" ? 2 : 3)}>
          Continuar <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Buscar Usuario Existente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" disabled={searchLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {searchLoading ? (
            <div className="text-center py-4">Buscando usuarios...</div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedUserId === user.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-gray-500">{user.phone}</p>
                )}
              </div>
            ))
          ) : searchQuery.length >= 3 ? (
            <div className="text-center py-4">No se encontraron usuarios</div>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Atrás
        </Button>
        <Button onClick={() => setStep(3)} disabled={!selectedUserId}>
          Continuar <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStep3 = () =>
    userOption === "new" ? (
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={newUserData.firstName}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Apellidos <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={newUserData.lastName}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="email">Email</Label>
              {!newUserData.phone && !newUserData.email && (
                <span className="text-sm text-amber-600">
                  Se requiere al menos email o teléfono
                </span>
              )}
            </div>
            <Input
              id="email"
              type="email"
              value={newUserData.email}
              onChange={(e) =>
                setNewUserData({ ...newUserData, email: e.target.value })
              }
              className={!hasValidContact() ? "border-amber-500" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={newUserData.phone}
              onChange={(e) =>
                setNewUserData({ ...newUserData, phone: e.target.value })
              }
              className={!hasValidContact() ? "border-amber-500" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={newUserData.address}
              onChange={(e) =>
                setNewUserData({ ...newUserData, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredContactMethod">
              Método de contacto preferido
            </Label>
            <Select
              value={newUserData.preferredContactMethod}
              onValueChange={(value) =>
                setNewUserData({
                  ...newUserData,
                  preferredContactMethod: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método de contacto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Teléfono</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Atrás
          </Button>
          <Button onClick={handleNewUserSubmit} disabled={!isFormValid()}>
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⌛</span> Procesando
              </span>
            ) : (
              <>
                Continuar <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    ) : (
      <AddPetForm
        onSubmit={handleSubmit}
        onCancel={() => setStep(2)}
        userId={selectedUserId}
      />
    );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {step === 1 && "Seleccionar Tipo de Usuario"}
            {step === 2 && "Buscar Usuario"}
            {step === 3 &&
              (userOption === "new"
                ? "Crear Nuevo Usuario"
                : "Agregar Mascota")}
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div
              className={`flex items-center ${step >= 1 ? "text-primary" : ""}`}
            >
              <Users className="h-4 w-4 mr-1" />
              <span>Usuario</span>
            </div>
            <span>→</span>

            <div
              className={`flex items-center ${step >= 3 ? "text-primary" : ""}`}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              <span>Mascota</span>
            </div>
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default NuevaMascota;
