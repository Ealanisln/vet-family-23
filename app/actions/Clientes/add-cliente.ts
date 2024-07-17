// app/actions/Clientes/add-cliente.ts
import { ICliente } from "@/types";

export async function addCliente(newCliente: Omit<ICliente, '_id'>): Promise<{ success: boolean; data?: ICliente }> {
  try {
    // Implement your API call here
    const response = await fetch('/api/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCliente),
    });

    if (!response.ok) {
      throw new Error('Failed to add client');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error adding client:', error);
    return { success: false };
  }
}