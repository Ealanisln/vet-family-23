"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getUsers } from "@/app/actions/get-customers"; // Asegúrate que esta acción exista y funcione

export interface Client {
  id: string;
  name?: string | null; // Combina firstName y lastName o usa un campo 'name' si existe
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface ClientSearchProps {
  onSelect: (client: Client | null) => void;
  selectedClient?: Client | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputId?: string; // Prop para asociar con Label
}

export function ClientSearch({
  onSelect,
  selectedClient,
  placeholder = "Buscar cliente...",
  disabled = false,
  className,
  inputId, // Recibir la prop inputId
}: ClientSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allClients, setAllClients] = useState<Client[]>([]); // Estado para TODOS los clientes
  const [displayedClients, setDisplayedClients] = useState<Client[]>([]); // Estado para clientes mostrados/filtrados

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Formatear nombre del cliente para mostrar
  const getDisplayName = (client: Client | null): string => {
    if (!client) return "";
    if (client.name) return client.name; // Si tienes un campo 'name' combinado
    if (client.firstName || client.lastName) {
      return [client.firstName, client.lastName]
        .filter(Boolean) // Filtra null o undefined
        .join(" ");
    }
    return client.email || client.id || "Cliente sin nombre"; // Fallback a email o ID
  };

  // Función para cargar todos los clientes (asume que getUsers devuelve todos)
  const loadClients = useCallback(async () => {
    if (isLoading) return; // Evitar cargas múltiples
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers(); // Asume que esto devuelve los usuarios/clientes
      // Mapear al formato de Client si es necesario
      const formattedClients = fetchedUsers.map(user => ({
        id: user.id,
        name: user.name, // O construirlo: `${user.firstName || ''} ${user.lastName || ''}`.trim()
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      }));
      setAllClients(formattedClients);
      setDisplayedClients(formattedClients); // Inicialmente mostrar todos
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      // Considera mostrar un mensaje de error al usuario
      setAllClients([]);
      setDisplayedClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]); // Dependencia de isLoading para evitar cargas paralelas

  // Efecto para cargar clientes al abrir si no se han cargado
  useEffect(() => {
    if (open && allClients.length === 0) {
      loadClients();
    }
    // Si se cierra, opcionalmente limpiar búsqueda
    // if (!open) {
    //   setSearchTerm("");
    // }
  }, [open, allClients.length, loadClients]);

  // Función para filtrar clientes localmente
  const filterClients = useCallback((term: string) => {
    if (!term || term.trim().length < 1) { // Mostrar todos si no hay término o es muy corto
        setDisplayedClients(allClients);
        return;
    }

    const termLower = term.toLowerCase();
    const filtered = allClients.filter(client => {
      const fullName = getDisplayName(client).toLowerCase();
      const email = (client.email || "").toLowerCase();
      const phone = (client.phone || "").toLowerCase();

      return fullName.includes(termLower) ||
             email.includes(termLower) ||
             phone.includes(termLower);
    });

    // Opcional: Ordenar resultados por relevancia o alfabéticamente
    filtered.sort((a, b) => {
      const aName = getDisplayName(a).toLowerCase();
      const bName = getDisplayName(b).toLowerCase();
      const aStartsWith = aName.startsWith(termLower);
      const bStartsWith = bName.startsWith(termLower);

      if (aStartsWith && !bStartsWith) return -1; // Priorizar los que empiezan con el término
      if (!aStartsWith && bStartsWith) return 1;
      return aName.localeCompare(bName); // Orden alfabético como fallback
    });

    setDisplayedClients(filtered);

  }, [allClients]); // Depende de la lista completa de clientes

  // Efecto para debounce y filtrar
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!open) return; // No hacer nada si está cerrado

    // Debounce la búsqueda
    searchTimeoutRef.current = setTimeout(() => {
      filterClients(searchTerm);
    }, 300); // Ajusta el tiempo de debounce según necesidad

    // Limpieza al desmontar o cambiar dependencias
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, open, filterClients]); // Depende de searchTerm, open y la función estable filterClients

  const handleSelectClient = (client: Client) => {
    onSelect(client);
    setSearchTerm(""); // Limpiar búsqueda al seleccionar
    setOpen(false);
    // setDisplayedClients(allClients); // Opcional: Resetear lista mostrada
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el botón principal abra el popover
    onSelect(null);
    setSearchTerm("");
    // setDisplayedClients(allClients); // Opcional: Resetear lista mostrada
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {selectedClient ? (
             // Botón cuando hay un cliente seleccionado
            <Button
              variant="outline"
              disabled={disabled}
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto py-2 px-3" // Ajusta padding si es necesario
              title={getDisplayName(selectedClient)} // Tooltip para nombres largos
            >
              <div className="flex items-center gap-2 truncate mr-2"> {/* Añadido mr-2 */}
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{getDisplayName(selectedClient)}</span>
                {selectedClient.phone && (
                  <Badge variant="secondary" className="ml-1 text-xs font-normal flex-shrink-0">
                    {selectedClient.phone}
                  </Badge>
                )}
              </div>
              {!disabled && ( // Solo mostrar X si no está deshabilitado
                  <X
                    className="h-4 w-4 opacity-50 hover:opacity-100 ml-auto flex-shrink-0" // ml-auto para empujar a la derecha
                    onClick={clearSelection}
                    aria-label="Limpiar selección de cliente"
                  />
              )}
            </Button>
          ) : (
             // Botón cuando NO hay cliente seleccionado
             <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                className="w-full justify-start pl-3 pr-3 h-10" // Altura fija h-10
                onClick={() => !disabled && setOpen(true)} // Abrir solo si no está deshabilitado
             >
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <span className={cn(placeholder ? "text-muted-foreground" : "")}>
                    {placeholder}
                </span>
             </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start"> {/* Usa ancho del trigger */}
          <Command shouldFilter={false}> {/* Desactivar filtrado interno de Command */}
            <CommandInput
              id={inputId} // Usar el inputId aquí
              placeholder={placeholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
              disabled={isLoading} // Deshabilitar mientras carga
              className="h-9"
              aria-label="Campo de búsqueda de cliente" // Label para accesibilidad
            />
            <CommandList>
              {isLoading && allClients.length === 0 ? ( // Mostrar loader solo en carga inicial
                 <div className="flex items-center justify-center p-4">
                   <Loader2 className="h-4 w-4 animate-spin mr-2" />
                   <span className="text-sm text-muted-foreground">Cargando clientes...</span>
                 </div>
              ) : (
                <>
                  <CommandEmpty>
                    {displayedClients.length === 0 && searchTerm.length > 0 ?
                      "No se encontraron clientes." :
                      "Escribe para buscar..." // Mensaje inicial o si no hay término
                    }
                  </CommandEmpty>
                  <CommandGroup heading={displayedClients.length > 0 ? "Resultados" : undefined}> {/* Heading opcional */}
                    {displayedClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        // value debe ser único y descriptivo para Command
                        value={`${getDisplayName(client)}-${client.id}`}
                        onSelect={() => handleSelectClient(client)}
                        className="flex flex-col items-start cursor-pointer py-2 px-3" // Ajustar padding
                      >
                        <div className="font-medium text-sm w-full truncate" title={getDisplayName(client)}>
                          {getDisplayName(client)}
                        </div>
                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground w-full truncate">
                          {client.email && <span className="truncate" title={client.email}>{client.email}</span>}
                          {client.email && client.phone && <span>•</span>}
                          {client.phone && <span className="truncate" title={client.phone}>{client.phone}</span>}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}