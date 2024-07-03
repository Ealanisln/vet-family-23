import mongoose, { Schema } from 'mongoose';

const ClienteSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  mascota: { type: String, required: true },
  visitas: { type: Number, default: 0 },
  proximaVisitaGratis: { type: Boolean, default: false },
  ultimaVisita: { type: Date, default: Date.now }
});

export default mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema);