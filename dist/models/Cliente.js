import mongoose, { Schema } from 'mongoose';
const ClienteSchema = new Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    direccion: { type: String, required: true },
    metodoContactoPreferido: {
        type: String,
        enum: ['email', 'telefono', 'mensaje'],
        required: true
    },
    visitas: { type: Number, default: 0 },
    proximaVisitaGratis: { type: Boolean, default: false },
    ultimaVisita: { type: Date, default: Date.now },
    historialVisitas: [{
            fecha: { type: Date, default: Date.now },
            costo: { type: Number, required: true },
            esGratis: { type: Boolean, default: false }
        }]
}, { timestamps: true });
const MascotaSchema = new Schema({
    clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
    nombre: { type: String, required: true },
    especie: { type: String, required: true },
    raza: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    sexo: { type: String, enum: ['macho', 'hembra'], required: true },
    peso: { type: Number, required: true },
    numeroMicrochip: { type: String }
});
const HistorialMedicoSchema = new Schema({
    mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota', required: true },
    fechaVisita: { type: Date, required: true },
    motivoVisita: { type: String, required: true },
    diagnostico: { type: String, required: true },
    tratamiento: { type: String, required: true },
    recetas: [{ type: String }],
    notas: { type: String }
});
const VacunacionSchema = new Schema({
    mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota', required: true },
    tipoVacuna: { type: String, required: true },
    fechaAdministracion: { type: Date, required: true },
    fechaProximaDosis: { type: Date, required: true }
});
const CitaSchema = new Schema({
    clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
    mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota', required: true },
    fechaHora: { type: Date, required: true },
    motivo: { type: String, required: true },
    estado: { type: String, enum: ['programada', 'completada', 'cancelada'], required: true }
});
const FacturacionSchema = new Schema({
    clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
    mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota' },
    fecha: { type: Date, required: true },
    servicios: [{ type: String }],
    costo: { type: Number, required: true },
    estadoPago: { type: String, enum: ['pagado', 'pendiente', 'atrasado'], required: true }
});
const RecordatorioSchema = new Schema({
    clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
    mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota', required: true },
    tipoRecordatorio: { type: String, required: true },
    fechaVencimiento: { type: Date, required: true },
    estado: { type: String, enum: ['enviado', 'pendiente', 'completado'], required: true }
});
const PersonalSchema = new Schema({
    nombre: { type: String, required: true },
    cargo: { type: String, required: true },
    informacionContacto: { type: String, required: true }
});
// Crear modelos
export const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema);
export const Mascota = mongoose.models.Mascota || mongoose.model('Mascota', MascotaSchema);
export const HistorialMedico = mongoose.models.HistorialMedico || mongoose.model('HistorialMedico', HistorialMedicoSchema);
export const Vacunacion = mongoose.models.Vacunacion || mongoose.model('Vacunacion', VacunacionSchema);
export const Cita = mongoose.models.Cita || mongoose.model('Cita', CitaSchema);
export const Facturacion = mongoose.models.Facturacion || mongoose.model('Facturacion', FacturacionSchema);
export const Recordatorio = mongoose.models.Recordatorio || mongoose.model('Recordatorio', RecordatorioSchema);
export const Personal = mongoose.models.Personal || mongoose.model('Personal', PersonalSchema);
// Índices
ClienteSchema.index({ email: 1 });
MascotaSchema.index({ clienteId: 1 });
HistorialMedicoSchema.index({ mascotaId: 1 });
VacunacionSchema.index({ mascotaId: 1 });
CitaSchema.index({ clienteId: 1, fechaHora: 1 });
FacturacionSchema.index({ clienteId: 1, fecha: 1 });
RecordatorioSchema.index({ clienteId: 1, fechaVencimiento: 1 });
