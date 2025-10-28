"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UnifiedPetForm, { PetFormData } from "@/components/ui/UnifiedPetForm";

export default function AddPetView() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Intentar obtener el email del usuario actual
    // Esto es solo para logging, no para autenticación
    const getUserEmail = async () => {
      try {
        const response = await fetch('/api/admin-check');
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.userEmail || "");
        }
      } catch (e) {
        console.log("Could not get user email");
      }
    };
    getUserEmail();
  }, []);

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

      console.log('🚀 [PET-FORM-FIXED] Submitting pet data...');

      // Usar el nuevo endpoint con manejo de sesión
      const response = await fetch('/api/pets/add-with-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          petData: petPayload,
          userEmail // Enviar el email para logging
        }),
        credentials: 'include' // Importante para cookies
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PET-FORM-FIXED] Pet added successfully');
        
        // Guardar el token temporal en sessionStorage como backup
        if (result.tempToken) {
          sessionStorage.setItem('vet-temp-token', result.tempToken);
          sessionStorage.setItem('vet-temp-token-time', Date.now().toString());
        }
        
        // Usar la URL de redirección
        const redirectUrl = result.redirectUrl || `/admin/clientes/${userId}`;
        
        // Pequeño delay para asegurar que la cookie se establezca
        setTimeout(() => {
          console.log('🔄 [PET-FORM-FIXED] Redirecting to:', redirectUrl);
          // Usar replace para evitar problemas de historial
          router.replace(redirectUrl);
        }, 500);
        
      } else {
        console.error('❌ [PET-FORM-FIXED] Error from API:', result.error);
        alert(`Error: ${result.error}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("❌ [PET-FORM-FIXED] Error calling API:", error);
      alert('Error al agregar mascota. Por favor intenta de nuevo.');
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
