"use client";

import { useState, useEffect, useCallback } from "react";
import router from "next/router";

import LogoutButton from "@/components/ClienteForm/LogoutButton";

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
import { format } from "date-fns";

import Navbar from "./Navbar";
import Header from "./Header";

interface Cliente {
  _id: string;
  nombre: string;
  mascota: string;
  visitas: number;
  proximaVisitaGratis: boolean;
  ultimaVisita?: string;
}

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
  }, [clientes]);

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
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </Button>
                  <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add cliente</span>
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
                          {cliente.visitas}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {cliente.ultimaVisita
                            ? format(
                                new Date(cliente.ultimaVisita),
                                "dd/MM/yyyy HH:mm"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
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
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Eliminar</DropdownMenuItem>
                              {/* <DropdownMenuItem onClick={() => registrarVisita(cliente._id)}>
                                Registrar Visita
                              </DropdownMenuItem> */}
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
    </div>
  );
}
