// src/components/Clientes/PetSearch.tsx

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react"; // Import useCallback
import { Search, X, Loader2, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button"; // Asume que usas Button también para el trigger seleccionado
import { Input } from "@/components/ui/input"; // Necesario para el trigger cuando no hay selección
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPetsByUserId } from "@/app/actions/get-pets"; // Asume que tienes una acción para obtener mascotas por User ID
import type { Pet } from "@/types/pet";

interface PetSearchProps {
  onSelect: (pet: Pet | null) => void;
  selectedPet?: Pet | null;
  userId?: string | null; // ID del cliente seleccionado
  placeholder?: string;
  disabled?: boolean; // Deshabilitar todo el componente
  className?: string;
  inputId?: string; // Prop para asociar con Label
}

export function PetSearch({
  onSelect,
  selectedPet,
  userId,
  placeholder = "Buscar mascota...",
  disabled = false, // Deshabilitar general
  className,
  inputId, // Recibir la prop inputId
}: PetSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]); // Mascotas del cliente actual

  // Estado para controlar si se debe deshabilitar (más específico)
  const isDisabled = disabled || !userId; // Deshabilitado si prop `disabled` es true O no hay `userId`

  // Cargar mascotas cuando cambia el userId y el popover está abierto o se abre
  const loadPets = useCallback(async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    setPets([]);
    try {
      const result = await getPetsByUserId(userId);

      if (result.success && result.pets) {
        // *** INICIO DE LA CORRECCIÓN ***
        const completePets: Pet[] = result.pets.map((p) => {
          // Determina la fecha de nacimiento, asegurando que SIEMPRE sea Date
          let validDateOfBirth: Date;
          if (p.dateOfBirth) {
            try {
              validDateOfBirth = new Date(p.dateOfBirth);
              // Opcional: Verificar si la fecha es válida después de la conversión
              if (isNaN(validDateOfBirth.getTime())) {
                console.warn(
                  `Fecha de nacimiento inválida para pet ${p.id}: ${p.dateOfBirth}. Usando fecha actual.`
                );
                validDateOfBirth = new Date(); // Fallback si la conversión falla
              }
            } catch (e) {
              console.warn(
                `Error al convertir fecha de nacimiento para pet ${p.id}: ${p.dateOfBirth}. Usando fecha actual.`,
                e
              );
              validDateOfBirth = new Date(); // Fallback en caso de error
            }
          } else {
            console.warn(
              `Fecha de nacimiento faltante para pet ${p.id}. Usando fecha actual.`
            );
            validDateOfBirth = new Date(); // Fallback si la fecha falta
          }

          return {
            ...p, // Copia las propiedades existentes que vienen de la acción

            // --- Asigna directamente los valores por defecto ---
            MedicalHistory: [], // Asigna directamente un array vacío
            Vaccination: [], // Asigna directamente un array vacío

            // --- Asigna los valores por defecto o los de 'p' si existen ---
            // (Usando ?? por si vienen como null desde la DB/acción)
            isNeutered: p.isNeutered ?? false,
            microchipNumber: p.microchipNumber ?? null,
            isDeceased: p.isDeceased ?? false,
            // Asegúrate que 'weight' también tenga un fallback si es requerido como 'number' y no 'number | null'
            // según tu tipo Pet (en types/pet.ts es 'number', así que necesita fallback)
            weight: p.weight ?? 0, // Usamos 0 como fallback si es null/undefined

            // --- Usa la fecha de nacimiento validada ---
            dateOfBirth: validDateOfBirth,

            // Asegúrate que el resto de propiedades de 'p' coincidan o sean adaptadas
            // (id, userId, internalId, name, species, breed, gender ya deberían venir de ...p)
            // Verifica que los tipos coincidan (ej. gender: string)
            gender: p.gender ?? "Unknown", // Fallback si gender puede faltar y es string

            // Incluye explícitamente TODAS las propiedades de la interfaz Pet de types/pet.ts
            // si no están cubiertas por ...p o los defaults anteriores.
            // En este caso, parece que todas están cubiertas.
          };
        });
        // *** FIN DE LA CORRECCIÓN ***

        setPets(completePets);
      } else {
        setPets([]);
        // ... (manejo de error si no hay success)
      }
    } catch (error) {
      console.error("Error al cargar mascotas (catch):", error);
      setPets([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // REMOVE isLoading from dependencies

  // Efecto para cargar mascotas cuando cambia el cliente o se abre el popover
  useEffect(() => {
    if (userId && open) {
      // Cargar si hay userId y está abierto
      loadPets();
    }
    if (!userId) {
      // Limpiar si se quita el cliente
      setPets([]);
      setSearchTerm(""); // Limpiar búsqueda también
      if (selectedPet) {
        // Deseleccionar mascota si ya no pertenece al cliente (o si no hay cliente)
        onSelect(null);
      }
    }
  }, [userId, open, loadPets, selectedPet, onSelect]); // Añadir selectedPet y onSelect como dependencias

  // Filtrar mascotas localmente (ya que `pets` solo contiene las del cliente actual)
  const filteredPets = useMemo(() => {
    if (!searchTerm) return pets; // Devuelve todas si no hay término

    const termLower = searchTerm.toLowerCase();
    return pets.filter((pet) => {
      return (
        pet.name.toLowerCase().includes(termLower) ||
        (pet.species && pet.species.toLowerCase().includes(termLower)) ||
        (pet.breed && pet.breed.toLowerCase().includes(termLower))
        // Puedes añadir más campos al filtro si es necesario
      );
    });
  }, [pets, searchTerm]);

  const handleSelectPet = (pet: Pet) => {
    onSelect(pet);
    setSearchTerm(""); // Limpiar búsqueda
    setOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchTerm("");
  };

  // Texto combinado de especie/raza
  const getPetDetailsText = (pet: Pet) => {
    return [pet.species, pet.breed].filter(Boolean).join(" • ");
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {selectedPet ? (
            // Botón cuando hay mascota seleccionada
            <Button
              variant="outline"
              disabled={isDisabled} // Usar estado calculado isDisabled
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto py-2 px-3"
              title={`${selectedPet.name} (${getPetDetailsText(selectedPet)})`}
            >
              <div className="flex items-center gap-2 truncate mr-2">
                <PawPrint className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{selectedPet.name}</span>
                {(selectedPet.species || selectedPet.breed) && (
                  <Badge
                    variant="secondary"
                    className="ml-1 text-xs font-normal flex-shrink-0"
                  >
                    {getPetDetailsText(selectedPet)}
                  </Badge>
                )}
              </div>
              {!isDisabled && ( // Mostrar X solo si NO está deshabilitado
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100 ml-auto flex-shrink-0"
                  onClick={clearSelection}
                  aria-label="Limpiar selección de mascota"
                />
              )}
            </Button>
          ) : (
            // Input 'falso' cuando no hay mascota seleccionada (funciona como trigger)
            <div className="relative">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                  isDisabled
                    ? "text-muted-foreground/50"
                    : "text-muted-foreground" // Atenuar icono si está deshabilitado
                )}
              />
              <Input
                placeholder={!userId ? "Selecciona un cliente" : placeholder}
                className={cn(
                  "pl-10 w-full",
                  isDisabled
                    ? "cursor-not-allowed bg-muted/50"
                    : "cursor-pointer"
                )} // Estilo deshabilitado
                onClick={() => !isDisabled && setOpen(true)} // Abrir popover al hacer clic si no está deshabilitado
                readOnly // Importante para que funcione como trigger
                disabled={isDisabled} // Propiedad disabled del input
                aria-haspopup="listbox" // Accesibilidad
                aria-expanded={open}
              />
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[--radix-popover-trigger-width]"
          align="start"
        >
          <Command shouldFilter={false}>
            {" "}
            {/* Filtrado manual */}
            <CommandInput
              id={inputId} // Usar inputId aquí
              placeholder="Buscar por nombre, especie, raza..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              disabled={isLoading || isDisabled} // Deshabilitar si carga o está deshabilitado general
              className="h-9"
              aria-label="Campo de búsqueda de mascota"
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Cargando mascotas...
                  </span>
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    {!userId
                      ? "Selecciona un cliente para ver sus mascotas."
                      : pets.length === 0
                        ? "Este cliente no tiene mascotas registradas."
                        : "No se encontraron mascotas con ese término."}
                  </CommandEmpty>
                  <CommandGroup
                    heading={
                      filteredPets.length > 0
                        ? "Mascotas encontradas"
                        : undefined
                    }
                  >
                    {filteredPets.map((pet) => (
                      <CommandItem
                        key={pet.id}
                        value={`${pet.name}-${pet.id}`} // Valor único para Command
                        onSelect={() => handleSelectPet(pet)}
                        className="flex flex-col items-start cursor-pointer py-2 px-3"
                      >
                        <div
                          className="font-medium text-sm w-full truncate"
                          title={pet.name}
                        >
                          {pet.name}
                        </div>
                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground w-full truncate">
                          {getPetDetailsText(pet)}
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
