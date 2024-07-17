"use client";

import { useState, useEffect, useCallback } from "react";
import { ICliente } from "@/types";
import { File, ListFilter, MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { getClientes } from "@/app/actions/Clientes/get-all-clientes";
import { editCliente } from "@/app/actions/Clientes/edit-cliente";
import { format } from "date-fns";

import Navbar from "./Navbar";
import Header from "./Header";
import { EditClienteModal } from "./EditClienteModal";
import { addCliente } from "@/app/actions/Clientes/add-cliente";
import { AddClienteModal } from "./AddClientModal";
import { Badge } from "../ui/badge";
import { getClienteById } from "@/app/actions/Clientes/get-cliente";

export default function Dashboard() {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCliente, setEditingCliente] = useState<ICliente | null>(null);
  const [isAddingCliente, setIsAddingCliente] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const COSTO_NORMAL = 100; // Replace with your actual cost

  const { toast } = useToast();

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getClientes();
      setClientes(result.data);
    } catch (error) {
      console.error("Error al cargar los clientes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleOpenEditModal = (cliente: ICliente) => {
    setEditingCliente(cliente);
  };

  const handleEdit = useCallback(
    async (clienteId: string, updatedData: Partial<ICliente>) => {
      try {
        const result = await editCliente(clienteId, updatedData);
        if (result.success) {
          toast({
            title: "Éxito",
            description: "Cliente actualizado correctamente",
          });
          setEditingCliente(null);
          fetchClientes(); // Refresh the list
        }
      } catch (error) {
        console.error("Error al editar cliente:", error);
        toast({
          title: "Error",
          description: "No se pudo editar el cliente",
          variant: "destructive",
        });
      }
    },
    [toast, fetchClientes]
  );

  const handleAddCliente = useCallback(
    async (newCliente: Omit<ICliente, "_id">) => {
      try {
        const result = await addCliente(newCliente);
        if (result.success) {
          toast({
            title: "Éxito",
            description: "Cliente agregado correctamente",
          });
          setIsAddingCliente(false);
          fetchClientes(); // Refresh the list
        }
      } catch (error) {
        console.error("Error al agregar cliente:", error);
        toast({
          title: "Error",
          description: "No se pudo agregar el cliente",
          variant: "destructive",
        });
      }
    },
    [toast, fetchClientes]
  );

  const registrarVisita = useCallback(
    async (clienteId: string) => {
      try {
        const result = await getClienteById(clienteId);
        if (!result.success || !result.data) {
          throw new Error("No se pudo obtener el cliente");
        }

        const cliente = result.data;
        const updatedData: Partial<ICliente> = {
          visitas: (cliente.visitas || 0) + 1,
          visitasDesdeUltimaGratis: (cliente.visitasDesdeUltimaGratis || 0) + 1,
          ultimaVisita: new Date().toISOString(),
        };

        const esGratis = updatedData.visitasDesdeUltimaGratis === 6;

        updatedData.historialVisitas = [
          ...(cliente.historialVisitas || []),
          {
            fecha: updatedData.ultimaVisita,
            costo: esGratis ? 0 : COSTO_NORMAL,
            esGratis,
          },
        ];

        if (esGratis) {
          updatedData.visitasDesdeUltimaGratis = 0;
        }

        await editCliente(clienteId, updatedData);

        toast({
          title: esGratis ? "Visita Gratis" : "Visita Registrada",
          description: `Visita registrada para ${cliente.mascota}`,
        });

        fetchClientes(); // Refresh the list
      } catch (error) {
        console.error("Error al registrar visita:", error);
        toast({
          title: "Error",
          description: "No se pudo registrar la visita",
          variant: "destructive",
        });
      }
    },
    [toast, fetchClientes, COSTO_NORMAL]
  );

  const handleCloseEditModal = () => {
    setEditingCliente(null);
    setOpenMenuId(null);
  };

  const handleCloseAddModal = () => {
    setIsAddingCliente(false);
    setOpenMenuId(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Navbar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Administra las visitas de los clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => setIsAddingCliente(true)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Agregar cliente</span>
                  </Button>
                </div>
              </div>
              {loading ? (
                <p>Cargando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre del cliente</TableHead>
                      <TableHead>Nombre de la mascota</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Visitas totales
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Última visita
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow key={cliente._id}>
                        <TableCell className="font-medium">
                          {cliente.nombre}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {cliente.mascota}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {cliente.visitas || 0}
                        </TableCell>
                        {/* <TableCell>
                          {cliente.visitasDesdeUltimaGratis === 5 && (
                            <Badge variant="default">
                              Próxima visita gratis!
                            </Badge>
                          )}
                        </TableCell> */}
                        <TableCell className="hidden md:table-cell">
                          {cliente.ultimaVisita
                            ? format(
                                new Date(cliente.ultimaVisita),
                                "dd/MM/yyyy HH:mm"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu
                            open={openMenuId === cliente._id}
                            onOpenChange={(open) =>
                              setOpenMenuId(open ? cliente._id : null)
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem
                                onSelect={() => {
                                  handleOpenEditModal(cliente);
                                  setOpenMenuId(null);
                                }}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  registrarVisita(cliente._id);
                                  setOpenMenuId(null);
                                }}
                              >
                                Registrar Visita
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  // Handle delete action
                                  setOpenMenuId(null);
                                }}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>1-{clientes.length}</strong> de{" "}
                <strong>{clientes.length}</strong> Clientes
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
      {editingCliente && (
        <EditClienteModal
          cliente={editingCliente}
          onClose={handleCloseEditModal}
          onSave={(updatedData) => {
            if (editingCliente && typeof editingCliente._id === "string") {
              handleEdit(editingCliente._id, updatedData);
            } else {
              console.error("Invalid cliente ID");
            }
          }}
        />
      )}

      {isAddingCliente && (
        <AddClienteModal
          onClose={handleCloseAddModal}
          onSave={handleAddCliente}
        />
      )}
    </div>
  );
}
