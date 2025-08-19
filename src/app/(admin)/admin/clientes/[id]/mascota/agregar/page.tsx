// src/app/(admin)/admin/clientes/[id]/mascota/agregar/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UnifiedPetForm, { PetFormData } from "@/components/ui/UnifiedPetForm";
import { addPet } from "@/app/actions/add-edit-pet"; // Volver al Server Action

export default function AddPetView() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (petData: PetFormData) => {
    const userId = params.id as string;
    setIsSubmitting(true);

    try {
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
        console.log('✅ [PET-FORM] Pet added successfully');
        
        // FIX CLAVE: Usar navegación completa del navegador
        // Esto fuerza a recargar todo el contexto de autenticación
        if (isClient) {
          // Esperar un momento para que se complete la transacción
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Navegación completa del navegador
          window.location.href = `/admin/clientes/${userId}`;
        }
      } else {
        console.error('❌ [PET-FORM] Error:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ [PET-FORM] Error:", error);
      alert('Error al agregar mascota');
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
