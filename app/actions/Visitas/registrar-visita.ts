
import { editCliente } from '../Clientes/edit-cliente';

import { getClienteById } from '@/app/actions/Clientes/get-cliente';
import { COSTO_NORMAL } from '@/constants/prices';
import { ICliente } from '@/types';

async function registrarVisita(clienteId: string) {
  const clienteResponse = await getClienteById(clienteId);
  if (!clienteResponse.success) {
      throw new Error("Failed to get client");
  }
  let cliente = clienteResponse.data;

  cliente.visitas++;
  cliente.visitasDesdeUltimaGratis++;
  const esGratis = cliente.visitasDesdeUltimaGratis === 6;
  
  const nuevaVisita = {
    fecha: new Date().toISOString(),
    costo: esGratis ? 0 : COSTO_NORMAL,
    esGratis,
  };

  if (esGratis) {
    cliente.visitasDesdeUltimaGratis = 0;
  }

  const updatedData: Partial<ICliente> = {
    visitas: cliente.visitas,
    visitasDesdeUltimaGratis: cliente.visitasDesdeUltimaGratis,
    historialVisitas: [...cliente.historialVisitas, nuevaVisita],
    ultimaVisita: new Date().toISOString()
  };

  const result = await editCliente(clienteId, updatedData);
  if (!result.success) {
      throw new Error("Failed to update client");
  }

  return esGratis;
}