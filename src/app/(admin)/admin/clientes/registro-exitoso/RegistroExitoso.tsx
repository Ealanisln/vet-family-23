"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import UnifiedPetForm, { PetFormData } from "@/components/ui/UnifiedPetForm";
import { addPet } from "@/app/actions/add-edit-pet";

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

  const handleSubmit = async (petData: PetFormData) => {
    if (!userId) {
      console.error("No se proporcionó userId");
      return;
    }
    
    setIsSubmitting(true); // Activamos el estado de carga
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

      const result = await addPet(userId, petPayload);
      if (result.success) {
        // Verificar si realmente es admin antes de redirigir
        try {
          const authResponse = await fetch('/api/auth-status');
          const authData = await authResponse.json();
          
          if (authData.isAdmin) {
            router.push('/admin/mascotas');
          } else {
            // Si no es admin, redirigir al cliente específico
            router.push(`/admin/clientes/${userId}`);
          }
        } catch (error) {
          console.error('Error verificando estado de admin:', error);
          // Fallback seguro: redirigir al cliente específico
          router.push(`/admin/clientes/${userId}`);
        }
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
        <UnifiedPetForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          userId={userId}
          isSubmitting={isSubmitting}
          showInternalId={true}
          showMedicalHistory={true}
          showDeceasedToggle={false}
          showAsCard={true}
          title="Agregar Primera Mascota"
          submitButtonText="Guardar Mascota"
          cancelButtonText="Ir a Clientes"
          className="max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
};

export default RegistroExitoso;