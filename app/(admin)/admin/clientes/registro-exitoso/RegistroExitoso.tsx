// app/(admin)/admin/clientes/registro-exitoso/page.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddPetForm from "@/components/Pet/AddPetForm";
import { addPet } from "@/app/actions/add-edit-pet";

const RegistroExitoso: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    if (userIdParam) {
      setUserId(userIdParam);
    } else {
      console.error("No se proporcionó userId");
      // Puedes redirigir a una página de error o manejar de otra manera
    }
  }, [searchParams]);

  const handleSubmit = async (
    userId: string,
    petData: {
      name: string;
      species: string;
      breed: string;
      dateOfBirth: Date;
      gender: string;
      weight: number;
      microchipNumber?: string;
      medicalHistory?: string;
    }
  ) => {
    if (!userId) {
      console.error("No se proporcionó userId");
      return;
    }
    const result = await addPet(userId, petData);
    if (result.success) {
      router.push(`/admin/clientes/${userId}`);
    } else {
      console.error(result.error);
      // Manejar error, tal vez mostrar un mensaje de error al usuario
    }
  };

  const handleCancel = () => {
    router.push("/admin/clientes"); // O a donde quieras que vaya si cancela
  };

  if (!userId) {
    return <div className="w-full px-4 sm:px-6 lg:px-8">Cargando...</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-6 sm:py-10">
        <h1 className="text-2xl font-bold mb-5 text-center sm:text-left">
          Clientes de la Registro exitoso
        </h1>{" "}
        <p className="mb-4">
          ¡El usuario ha sido registrado con éxito! Ahora puedes agregar una
          mascota.
        </p>
        <AddPetForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          userId={userId}
        />
      </div>{" "}
    </div>
  );
};

export default RegistroExitoso;
