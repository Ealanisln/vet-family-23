import { Document } from 'mongoose';

export interface ICliente extends Document {
  nombre: string;
  mascota: string;
  visitas: number;
  ultimaVisita: Date;
  cuponDisponible: boolean;
}