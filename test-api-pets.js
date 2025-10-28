// Test file para verificar las nuevas API Routes de mascotas
// Ejecutar con: node test-api-pets.js

const testPetData = {
  userId: "test-user-id",
  petData: {
    name: "Test Pet",
    species: "Perro",
    breed: "Labrador",
    dateOfBirth: new Date().toISOString(),
    gender: "Macho",
    weight: 25.5,
    microchipNumber: "123456789",
    medicalHistory: "Mascota de prueba",
    isNeutered: false,
    isDeceased: false,
    internalId: "TEST001"
  }
};

async function testAddPetAPI() {
  try {
    console.log('🧪 Probando API de agregar mascota...');
    
    const response = await fetch('http://localhost:3000/api/pets/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPetData),
      credentials: 'include'
    });
    
    const result = await response.json();
    console.log('📊 Respuesta de la API:', result);
    
    if (result.success) {
      console.log('✅ API funcionando correctamente');
      console.log('🆔 ID de mascota creada:', result.pet.id);
      console.log('🔗 URL de redirección:', result.redirectUrl);
    } else {
      console.log('❌ Error en la API:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Error al probar la API:', error.message);
  }
}

// Ejecutar la prueba
testAddPetAPI();
