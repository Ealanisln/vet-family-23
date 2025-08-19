// src/app/(admin)/admin/clientes/[id]/mascota/agregar/page.tsx

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UnifiedPetForm, { PetFormData } from "@/components/ui/UnifiedPetForm";
import { addPet } from "@/app/actions/add-edit-pet";

export default function AddPetView() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (petData: PetFormData) => {
    const userId = params.id as string;
    setIsSubmitting(true);

    try {
      // Convert to the format expected by addPet action
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
        // FIX: Simplificar - el usuario ya está en contexto admin
        // No necesitamos verificar nuevamente, solo redirigir
        console.log('✅ [PET-FORM] Pet added successfully, redirecting to client details');
        
        // Usar replace para evitar problemas de historial del navegador
        // Esto también evita el race condition con la verificación de admin
        router.replace(`/admin/clientes/${userId}`);
      } else {
        console.error(result.error);
        // TODO: Show error toast/message to user
      }
    } catch (error) {
      console.error("Error al agregar mascota:", error);
      // TODO: Show error toast/message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const userId = params.id as string;
    router.push(`/admin/clientes/${userId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <UnifiedPetForm
        userId={params.id as string}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        showInternalId={true}
        showMedicalHistory={false}
        showDeceasedToggle={false}
        showAsCard={true}
        title="Agregar Nueva Mascota"
        submitButtonText="Agregar Mascota"
        cancelButtonText="Volver"
        className="max-w-4xl mx-auto"
      />
    </div>
  );
}
