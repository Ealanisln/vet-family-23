export interface ICliente {
  _id: string;
  nombre: string;
  mascota: string;
  visitas: number;
  visitasDesdeUltimaGratis: number;
  ultimaVisita?: string;
  historialVisitas: {
    fecha: string;
    costo: number;
    esGratis: boolean;
  }[];
}