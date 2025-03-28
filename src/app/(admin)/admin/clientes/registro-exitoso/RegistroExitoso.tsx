"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddPetForm from "@/components/Pet/AddPetForm";
import { addPet } from "@/app/actions/add-edit-pet";

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

const RegistroExitoso: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Añadimos este estado

  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    if (userIdParam) {
      setUserId(userIdParam);
    } else {
      console.error("No se proporcionó userId");
    }
  }, [searchParams]);

  const handleSubmit = async (petData: PetDataForSubmit) => {
    if (!userId) {
      console.error("No se proporcionó userId");
      return;
    }
    
    setIsSubmitting(true); // Activamos el estado de carga
    try {
      const result = await addPet(userId, petData);
      if (result.success) {
        router.push(`/admin/clientes/${userId}`);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error al agregar mascota:", error);
    } finally {
      setIsSubmitting(false); // Desactivamos el estado de carga
    }
  };

  const handleCancel = () => {
    router.push("/admin/clientes");
  };

  if (!userId) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-6 sm:py-10">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-6 sm:py-10">
        <h1 className="text-2xl font-bold mb-5 text-center sm:text-left">
          Registro exitoso
        </h1>
        <p className="mb-4">
          ¡El usuario ha sido registrado con éxito! Ahora puedes agregar una mascota.
        </p>
        <AddPetForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          userId={userId}
          isSubmitting={isSubmitting} // Pasamos el estado de carga
        />
      </div>
    </div>
  );
};

export default RegistroExitoso;