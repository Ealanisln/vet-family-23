'use client';

import { useState } from 'react';

interface ClienteFormProps {
  onClienteAdded: () => void;
}

export default function ClienteForm({ onClienteAdded }: ClienteFormProps) {
  const [nombre, setNombre] = useState('');
  const [mascota, setMascota] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, mascota }),
      });

      if (!response.ok) {
        throw new Error('Error al agregar cliente');
      }

      setNombre('');
      setMascota('');
      onClienteAdded();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar cliente');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del cliente"
        required
      />
      <input
        type="text"
        value={mascota}
        onChange={(e) => setMascota(e.target.value)}
        placeholder="Nombre de la mascota"
        required
      />
      <button type="submit">Agregar Cliente</button>
    </form>
  );
}