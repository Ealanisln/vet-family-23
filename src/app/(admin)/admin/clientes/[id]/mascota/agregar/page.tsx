// src/app/(admin)/admin/clientes/[id]/mascota/agregar/page.tsx

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UnifiedPetForm, { PetFormData } from "@/components/ui/UnifiedPetForm";

export default function AddPetView() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (petData: PetFormData) => {
    const userId = params.id as string;
    setIsSubmitting(true);

    try {
      // Preparar payload
      const petPayload = {
        ...petData,
        dateOfBirth: petData.dateOfBirth instanceof Date 
          ? petData.dateOfBirth.toISOString()
          : new Date(petData.dateOfBirth).toISOString(),
        weight: typeof petData.weight === 'string' 
          ? parseFloat(petData.weight) 
          : petData.weight,
      };

      // Llamar a la API Route en lugar del Server Action
      const response = await fetch('/api/pets/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          petData: petPayload
        }),
        // Importante: incluir credenciales para mantener la sesión
        credentials: 'include'
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PET-FORM] Pet added successfully via API');
        
        // Usar la URL de redirección de la respuesta
        const redirectUrl = result.redirectUrl || `/admin/clientes/${userId}`;
        
        // Pequeño delay para asegurar que todo se procese
        setTimeout(() => {
          // Usar window.location para una navegación completa
          // Esto asegura que las cookies de Kinde se mantengan
          window.location.href = redirectUrl;
        }, 100);
        
      } else {
        console.error('❌ [PET-FORM] Error from API:', result.error);
        // TODO: Mostrar error al usuario con toast
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ [PET-FORM] Error calling API:", error);
      alert('Error al agregar mascota. Por favor intenta de nuevo.');
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
