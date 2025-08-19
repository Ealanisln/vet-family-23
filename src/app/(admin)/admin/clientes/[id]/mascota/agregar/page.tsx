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
        // Verificar si realmente es admin antes de redirigir
        console.log('🔄 [PET-FORM] Starting admin verification...');
        try {
          const authResponse = await fetch('/api/admin-check');
          const authData = await authResponse.json();
          
          console.log('✅ [PET-FORM] Auth check result:', authData);
          console.log('🔍 [PET-FORM] Debug info:', authData.debug);
          
          if (authData.isAdmin) {
            console.log('✅ [PET-FORM] User is admin, redirecting to /admin/mascotas');
            router.push('/admin/mascotas');
          } else {
            console.log('❌ [PET-FORM] User is NOT admin, redirecting to client specific page');
            console.log('🔍 [PET-FORM] Redirect target:', `/admin/clientes/${userId}`);
            router.push(`/admin/clientes/${userId}`);
          }
        } catch (error) {
          console.error('❌ [PET-FORM] Error verificando estado de admin:', error);
          console.log('🔄 [PET-FORM] Using fallback redirect to client specific page');
          // Fallback seguro: redirigir al cliente específico
          router.push(`/admin/clientes/${userId}`);
        }
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
