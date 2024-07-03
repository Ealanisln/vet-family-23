"use client";

import { useState, useEffect } from "react";
import ClienteForm from "@/components/ClienteForm";
import LogoutButton from "@/components/ClienteForm/LogOutButton";

import router from "next/router";

interface Cliente {
  _id: string;
  nombre: string;
  mascota: string;
  visitas: number;
  proximaVisitaGratis: boolean;
}

export default function Home() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setClientes(data.data);
    } catch (error) {
      console.error("Error al cargar los clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const registrarVisita = async (clienteId: string) => {
    try {
      const res = await fetch(`/api/clientes/${clienteId}/visita`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      fetchClientes(); // Actualizar la lista después de registrar la visita
    } catch (error) {
      console.error("Error al registrar visita:", error);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  const handleLogout = () => {
    document.cookie =
      "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  return (
    <main>
      <h1>Programa de Lealtad Veterinaria</h1>
      <ClienteForm onClienteAdded={fetchClientes} />
      <h2>Clientes</h2>
      {clientes.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <ul>
          {clientes.map((cliente) => (
            <li key={cliente._id}>
              {cliente.nombre} - {cliente.mascota} - Visitas: {cliente.visitas}
              {cliente.proximaVisitaGratis && (
                <span> (Próxima visita gratis!)</span>
              )}
              <button onClick={() => registrarVisita(cliente._id)}>
                Registrar Visita
              </button>
            </li>
          ))}
        </ul>
      )}
      <LogoutButton />
    </main>
  );
}
