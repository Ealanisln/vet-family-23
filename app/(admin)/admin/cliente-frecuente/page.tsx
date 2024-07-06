"use client";

import { useState, useEffect } from "react";
import ClienteForm from "@/components/ClienteForm";
import LogoutButton from "@/components/ClienteForm/LogoutButton";

import router from "next/router";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Cliente {
  _id: string;
  nombre: string;
  mascota: string;
  visitas: number;
  proximaVisitaGratis: boolean;
}

export default function AdminPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      toast({
        title: "Visita registrada",
        description: "La visita se ha registrado exitosamente",
      });
    } catch (error) {
      console.error("Error al registrar visita:", error);
      toast({
        title: "Error",
        description: "Ocurrio un error al registrar visita",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Cargando...
      </div>
    );
  }

  const handleLogout = () => {
    document.cookie =
      "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  const handleClienteAdded = () => {
    console.log("Cliente added");
    // Any additional logic you need when a client is added
  };

  return (
    <section id="admin" className="overflow-hidden py-12">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:px-8">
            <div
              className="wow fadeInUp mb-6 rounded-sm bg-white px-8 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5"
              data-wow-delay=".15s
              "
            >
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                Bienvenido a la administración de Vet Family
              </h2>
              <p className="mb-12 text-base font-medium text-body-color">
                Desde aquí puedes administrar las visitas de nuestros clientes.
              </p>
              <ClienteForm onClienteAdded={fetchClientes} />
              <h2 className="text-2xl font-semibold mt-8 mb-4">Clientes</h2>
              {clientes.length === 0 ? (
                <p className="text-gray-600 italic">
                  No hay clientes registrados.
                </p>
              ) : (
                <ul className="space-y-4">
                  {clientes.map((cliente) => (
                    <li
                      key={cliente._id}
                      className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold">{cliente.nombre}</span>{" "}
                        - {cliente.mascota}
                        <p className="text-sm text-gray-600">
                          Visitas: {cliente.visitas}
                        </p>
                        {cliente.proximaVisitaGratis && (
                          <span className="text-green-500 text-sm font-medium">
                            {" "}
                            (Próxima visita gratis!)
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => registrarVisita(cliente._id)}
                        className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                      >
                        Registrar Visita
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 text-center">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
