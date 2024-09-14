// reset-database.ts
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Cliente, Mascota, HistorialMedico, Vacunacion, Cita, Facturacion, Recordatorio, Personal } from '../models/Cliente.js';
// Cargar variables de entorno
dotenv.config();
async function resetDatabase() {
    try {
        // Verificar que la variable de entorno esté definida
        const mongodbUri = process.env.MONGODB_URI;
        if (!mongodbUri) {
            throw new Error('La variable de entorno MONGODB_URI no está definida');
        }
        // Conectar a la base de datos usando la variable de entorno
        await mongoose.connect(mongodbUri);
        // Eliminar todas las colecciones existentes
        const collections = Object.values(mongoose.connection.collections);
        for (const collection of collections) {
            await collection.deleteMany({});
        }
        console.log('Todas las colecciones han sido vaciadas.');
        // Crear nuevos índices
        await Cliente.createIndexes();
        await Mascota.createIndexes();
        await HistorialMedico.createIndexes();
        await Vacunacion.createIndexes();
        await Cita.createIndexes();
        await Facturacion.createIndexes();
        await Recordatorio.createIndexes();
        await Personal.createIndexes();
        console.log('Nuevos índices creados.');
        // Opcional: Crear algunos datos de prueba
        // await createSampleData();
        console.log('La base de datos ha sido reiniciada exitosamente con el nuevo esquema.');
    }
    catch (error) {
        console.error('Error al reiniciar la base de datos:', error);
    }
    finally {
        await mongoose.disconnect();
    }
}
// Función opcional para crear datos de prueba
async function createSampleData() {
    // Aquí puedes agregar código para crear algunos datos de prueba
    // Por ejemplo:
    const cliente = new Cliente({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        telefono: '1234567890',
        direccion: 'Calle Principal 123',
        metodoContactoPreferido: 'email'
    });
    await cliente.save();
    console.log('Datos de prueba creados.');
}
// Ejecutar la función principal
resetDatabase().catch(error => {
    console.error('Error al ejecutar el script:', error);
    process.exit(1);
});
