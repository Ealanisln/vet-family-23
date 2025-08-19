import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeftIcon, PlusIcon, Edit, PawPrint } from "lucide-react";
import { addPet, updatePet } from "@/app/actions/add-edit-pet";
import { Switch } from "@/components/ui/switch";

interface PetFormProps {
  isEditing?: boolean;
  initialPet?: Pet | null;
  onClose?: () => void;
}

interface Pet {
  id?: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  gender: string;
  weight: string;
  isNeutered: boolean;
  microchipNumber?: string;
}

const ClientePetForm: React.FC<PetFormProps> = ({
  isEditing = false,
  initialPet = null,
  onClose,
}) => {
  const params = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet>({
    name: "",
    species: "",
    breed: "",
    dateOfBirth: "",
    weight: "",
    gender: "",
    isNeutered: false,
    microchipNumber: "",
  });

  useEffect(() => {
    if (isEditing && initialPet) {
      setPet(initialPet);
    }
  }, [isEditing, initialPet]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setPet((prevState) => ({ ...prevState, isNeutered: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = params.id as string;
    const petData = {
      ...pet,
      dateOfBirth: new Date(pet.dateOfBirth),
      weight: parseFloat(pet.weight),
      isNeutered: pet.isNeutered,
    };

    let result;
    if (isEditing && pet.id) {
      result = await updatePet(userId, pet.id, petData);
    } else {
      result = await addPet(userId, petData);
    }

    if (result.success) {
      if (onClose) onClose();
      
      // Verificar el estado de autenticación real antes de redirigir
      try {
        const authResponse = await fetch('/api/admin-check');
        const authData = await authResponse.json();
        
        console.log('Auth check result:', authData);
        
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin/') && authData.isAdmin) {
          // Si estamos en contexto de admin Y es admin, ir a admin/mascotas
          router.push('/admin/mascotas');
        } else if (currentPath.includes('/admin/')) {
          // Si estamos en admin pero no es admin, ir al cliente específico
          router.push(`/admin/clientes/${userId}`);
        } else {
          // Si estamos en contexto de cliente, ir al perfil del cliente
          router.push('/cliente');
        }
      } catch (error) {
        console.error('Error verificando estado de admin:', error);
        // Fallback seguro basado en el path
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin/')) {
          router.push(`/admin/clientes/${userId}`);
        } else {
          router.push('/cliente');
        }
      }
    } else {
      console.error(result.error);
    }
  };

  const formContent = (
    <>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={pet.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="species">Especie</Label>
            <Select
              name="species"
              onValueChange={(value) => handleSelectChange(value, "species")}
              value={pet.species}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar especie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="canino">Canino</SelectItem>
                <SelectItem value="felino">Felino</SelectItem>
                <SelectItem value="ave">Ave</SelectItem>
                <SelectItem value="huron">Hurón</SelectItem>
                <SelectItem value="conejo">Conejo</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="breed">Raza</Label>
            <Input
              id="breed"
              name="breed"
              value={pet.breed}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={pet.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              value={pet.weight}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select
              name="gender"
              onValueChange={(value) => handleSelectChange(value, "gender")}
              value={pet.gender}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="macho">Macho</SelectItem>
                <SelectItem value="hembra">Hembra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="microchipNumber">Número de Microchip</Label>
            <Input
              id="microchipNumber"
              name="microchipNumber"
              value={pet.microchipNumber || ""}
              onChange={handleInputChange}
              maxLength={15}
              inputMode="numeric"
              pattern="\d*"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isNeutered"
              checked={pet.isNeutered}
              onCheckedChange={(checked) => handleSwitchChange(checked as boolean)}
            />
            <Label htmlFor="isNeutered">Esterilizado/Castrado</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onClose || (() => router.back())}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Button type="submit">
          {isEditing ? (
            <>
              <Edit className="mr-2 h-4 w-4" /> Actualizar Mascota
            </>
          ) : (
            <>
              <PlusIcon className="mr-2 h-4 w-4" /> Agregar Mascota
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );

  if (isEditing) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Editar Mascota</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <PawPrint className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Editar Mascota
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Realiza cambios en la información de la mascota aquí
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit}>{formContent}</form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? "Editar Mascota" : "Agregar Nueva Mascota"}
      </h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información de la Mascota</CardTitle>
          </CardHeader>
          {formContent}
        </form>
      </Card>
    </div>
  );
};

export default ClientePetForm;