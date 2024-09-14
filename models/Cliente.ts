import mongoose, { Schema, Document } from 'mongoose';

// Cliente (Customer)
interface ICliente extends Document {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  metodoContactoPreferido: 'email' | 'telefono' | 'mensaje';
  visitas: number;
  proximaVisitaGratis: boolean;
  ultimaVisita: Date;
  historialVisitas: Array<{
    fecha: Date;
    costo: number;
    esGratis: boolean;
  }>;
}

const ClienteSchema: Schema = new Schema({
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

// Mascota (Pet)
interface IMascota extends Document {
  clienteId: Schema.Types.ObjectId;
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: Date;
  sexo: 'macho' | 'hembra';
  peso: number;
  numeroMicrochip?: string;
}

const MascotaSchema: Schema = new Schema({
  clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  nombre: { type: String, required: true },
  especie: { type: String, required: true },
  raza: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  sexo: { type: String, enum: ['macho', 'hembra'], required: true },
  peso: { type: Number, required: true },
  numeroMicrochip: { type: String }
});

// HistorialMedico (Medical Record)
interface IHistorialMedico extends Document {
  mascotaId: Schema.Types.ObjectId;
  fechaVisita: Date;
  motivoVisita: string;
  diagnostico: string;
  tratamiento: string;
  recetas: string[];
  notas: string;
}

const HistorialMedicoSchema: Schema = new Schema({
  mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota', required: true },
  fechaVisita: { type: Date, required: true },
  motivoVisita: { type: String, required: true },
  diagnostico: { type: String, required: true },
  tratamiento: { type: String, required: true },
  recetas: [{ type: String }],
  notas: { type: String }
});

// Vacunacion (Vaccination)
interface IVacunacion extends Document {
  mascotaId: Schema.Types.ObjectId;
  tipoVacuna: string;
  fechaAdministracion: Date;
  fechaProximaDosis: Date;
}

const VacunacionSchema: Schema = new Schema({
  mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota', required: true },
  tipoVacuna: { type: String, required: true },
  fechaAdministracion: { type: Date, required: true },
  fechaProximaDosis: { type: Date, required: true }
});

// Cita (Appointment)
interface ICita extends Document {
  clienteId: Schema.Types.ObjectId;
  mascotaId: Schema.Types.ObjectId;
  fechaHora: Date;
  motivo: string;
  estado: 'programada' | 'completada' | 'cancelada';
}

const CitaSchema: Schema = new Schema({
  clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota', required: true },
  fechaHora: { type: Date, required: true },
  motivo: { type: String, required: true },
  estado: { type: String, enum: ['programada', 'completada', 'cancelada'], required: true }
});

// Facturacion (Billing)
interface IFacturacion extends Document {
  clienteId: Schema.Types.ObjectId;
  mascotaId?: Schema.Types.ObjectId;
  fecha: Date;
  servicios: string[];
  costo: number;
  estadoPago: 'pagado' | 'pendiente' | 'atrasado';
}

const FacturacionSchema: Schema = new Schema({
  clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota' },
  fecha: { type: Date, required: true },
  servicios: [{ type: String }],
  costo: { type: Number, required: true },
  estadoPago: { type: String, enum: ['pagado', 'pendiente', 'atrasado'], required: true }
});

// Recordatorio (Reminder)
interface IRecordatorio extends Document {
  clienteId: Schema.Types.ObjectId;
  mascotaId: Schema.Types.ObjectId;
  tipoRecordatorio: string;
  fechaVencimiento: Date;
  estado: 'enviado' | 'pendiente' | 'completado';
}

const RecordatorioSchema: Schema = new Schema({
  clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  mascotaId: { type: Schema.Types.ObjectId, ref: 'Mascota', required: true },
  tipoRecordatorio: { type: String, required: true },
  fechaVencimiento: { type: Date, required: true },
  estado: { type: String, enum: ['enviado', 'pendiente', 'completado'], required: true }
});

// Personal (Staff)
interface IPersonal extends Document {
  nombre: string;
  cargo: string;
  informacionContacto: string;
}

const PersonalSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  cargo: { type: String, required: true },
  informacionContacto: { type: String, required: true }
});

// Crear modelos
export const Cliente = mongoose.models.Cliente || mongoose.model<ICliente>('Cliente', ClienteSchema);
export const Mascota = mongoose.models.Mascota || mongoose.model<IMascota>('Mascota', MascotaSchema);
export const HistorialMedico = mongoose.models.HistorialMedico || mongoose.model<IHistorialMedico>('HistorialMedico', HistorialMedicoSchema);
export const Vacunacion = mongoose.models.Vacunacion || mongoose.model<IVacunacion>('Vacunacion', VacunacionSchema);
export const Cita = mongoose.models.Cita || mongoose.model<ICita>('Cita', CitaSchema);
export const Facturacion = mongoose.models.Facturacion || mongoose.model<IFacturacion>('Facturacion', FacturacionSchema);
export const Recordatorio = mongoose.models.Recordatorio || mongoose.model<IRecordatorio>('Recordatorio', RecordatorioSchema);
export const Personal = mongoose.models.Personal || mongoose.model<IPersonal>('Personal', PersonalSchema);

// Índices
ClienteSchema.index({ email: 1 });
MascotaSchema.index({ clienteId: 1 });
HistorialMedicoSchema.index({ mascotaId: 1 });
VacunacionSchema.index({ mascotaId: 1 });
CitaSchema.index({ clienteId: 1, fechaHora: 1 });
FacturacionSchema.index({ clienteId: 1, fecha: 1 });
RecordatorioSchema.index({ clienteId: 1, fechaVencimiento: 1 });