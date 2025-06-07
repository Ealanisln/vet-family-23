// app/(admin)/admin/AddMedicalRecordDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addMedicalHistory,
  updateMedicalHistory,
  getPetsForMedicalRecord,
  PetForMedicalRecord,
} from "@/app/actions/add-medical-record";
import { useToast } from "@/components/ui/use-toast";
import { EditIcon, PlusCircle, Search, X, Loader2 } from "lucide-react";
import { searchInventory } from "@/app/actions/pos/inventory";
import { prisma } from "@/lib/prismaDB";
type InventoryCategory = "MEDICATION" | "FOOD" | "ACCESSORIES" | "HYGIENE" | "TOYS" | "SUPPLEMENTS" | "EQUIPMENT" | "CONSUMABLES" | "OTHER";
type InventoryStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";

interface MedicalHistory {
  id?: string;
  petId: string;
  userId: string;
  visitDate: string;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes?: string;
}

interface SelectedProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

// Adjust date types to match the actual data returned by the action
interface InventorySearchResultAdjusted {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  presentation: string | null;
  category: InventoryCategory;
  status: InventoryStatus;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  measure?: string | null;
}

interface ProductSection {
  isOpen: boolean;
  selectedProducts: SelectedProduct[];
  searchValue: string;
  searchResults: InventorySearchResultAdjusted[]; // Use the adjusted type
}

interface MedicalRecordDialogProps {
  existingRecord?: MedicalHistory;
  petId?: string;
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MedicalRecordDialog: React.FC<MedicalRecordDialogProps> = ({
  existingRecord,
  petId,
  triggerButton,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [localOpen, setLocalOpen] = useState(false);
  const [pets, setPets] = useState<PetForMedicalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [record, setRecord] = useState<MedicalHistory>({
    id: existingRecord?.id || undefined,
    petId: existingRecord?.petId || petId || "",
    userId: existingRecord?.userId || "",
    visitDate: existingRecord?.visitDate || "",
    reasonForVisit: existingRecord?.reasonForVisit || "",
    diagnosis: existingRecord?.diagnosis || "",
    treatment: existingRecord?.treatment || "",
    prescriptions: existingRecord?.prescriptions || [],
    notes: existingRecord?.notes || "",
  });

  const [productsSection, setProductsSection] = useState<ProductSection>({
    isOpen: false,
    selectedProducts: [],
    searchValue: "",
    searchResults: [],
  });

  // Usar el estado controlado si se proporcionan las props, de lo contrario usar el estado local
  const isOpen = open !== undefined ? open : localOpen;
  const setIsOpen = onOpenChange || setLocalOpen;

  useEffect(() => {
    const fetchPets = async () => {
      // Solo hacer la llamada si el diálogo está abierto
      if (!isOpen) return;

      if (!petId && !existingRecord) {
        // Fetch all pets when no specific petId is given and not editing
        const result = await getPetsForMedicalRecord();
        if (result.success) {
          const alivePets = result.pets.filter((pet) => !pet.isDeceased);
          setPets(alivePets);
          setError(null);
        } else {
          console.error("Error fetching pets:", (result as any).error);
          setError(
            "No se pudieron cargar las mascotas. Por favor, intente de nuevo más tarde."
          );
        }
      } else {
        // Fetch all pets even if petId or existingRecord is present, to get the userId
        const result = await getPetsForMedicalRecord();
        if (result.success) {
          const targetPetId = petId || existingRecord?.petId;
          const targetPet = result.pets.find(pet => pet.id === targetPetId);
          if (targetPet) {
            // Set the list to only the target pet for display/selection if needed
            // setPets([targetPet]); 
            // Keep all pets available if the dropdown might be used in other contexts
            setPets(result.pets.filter((p) => !p.isDeceased));
            
            // If adding a new record (no existingRecord) and we have a petId,
            // set the userId in the record state.
            if (!existingRecord && petId && targetPet.userId) {
              setRecord(prev => ({ ...prev, userId: targetPet.userId }));
            }
            setError(null);
          } else {
             // Handle case where the provided petId doesn't match any fetched pet
             console.error("Target pet not found with ID:", targetPetId);
             setError("La mascota especificada no fue encontrada.");
             // Optionally clear the petId in the record state
             // setRecord(prev => ({ ...prev, petId: '', userId: '' })); 
          }
        } else {
          console.error("Error fetching pets:", (result as any).error);
          setError(
            "No se pudieron cargar los datos de las mascotas. Por favor, intente de nuevo más tarde."
          );
        }
      }
    };
    fetchPets();
  }, [petId, existingRecord, isOpen]); // Removed setRecord from dependency array to avoid potential loops

  // Efecto para búsqueda automática mientras se escribe
  useEffect(() => {
    let isSubscribed = true;

    const searchProducts = async () => {
      const searchTerm = productsSection.searchValue.trim();
      
      if (searchTerm.length < 3) {
        return;
      }

      try {
        console.log('Iniciando búsqueda para:', searchTerm);
        const results = await searchInventory({
          searchTerm,
          limit: 10,
        });
        
        console.log('Resultados de búsqueda:', results);
        
        if (!isSubscribed) {
          console.log('Componente desmontado, ignorando resultados');
          return;
        }

        // Adaptar los resultados a nuestro tipo
        const safeResults: InventorySearchResultAdjusted[] = results.map((item: any) => ({
          ...item,
          price: typeof item.price === 'number' ? item.price : 0
        }));
        
        console.log('Resultados procesados:', safeResults);
        
        if (isSubscribed) {
          setProductsSection(prev => ({
            ...prev,
            searchResults: safeResults
          }));
        }
      } catch (error) {
        console.error('Error en la búsqueda:', error);
        if (isSubscribed) {
          setProductsSection(prev => ({
            ...prev,
            searchResults: []
          }));
        }
      }
    };

    const timeoutId = setTimeout(searchProducts, 500);

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
    };
  }, [productsSection.searchValue]);

  // Inicializar productos seleccionados (si existen) cuando se edita un registro
  useEffect(() => {
    if (existingRecord && existingRecord.prescriptions) {
      // Filtrar las prescripciones que parecen ser productos (formato: "Nombre - Cantidad: X")
      const productPrescriptions = existingRecord.prescriptions
        .filter(p => p.includes(" - Cantidad: "))
        .map(p => {
          const [name, quantityPart] = p.split(" - Cantidad: ");
          const quantity = parseInt(quantityPart) || 1;
          
          return {
            id: name + "-" + Math.random().toString(36).substring(2, 9), // ID único generado
            name,
            quantity,
            unitPrice: 0 // No tenemos el precio, así que ponemos 0
          };
        });
      
      // Establecer productos seleccionados
      if (productPrescriptions.length > 0) {
        setProductsSection(prev => ({
          ...prev,
          selectedProducts: productPrescriptions
        }));
        
        // Filtrar las prescripciones que no son productos
        const regularPrescriptions = existingRecord.prescriptions
          .filter(p => !p.includes(" - Cantidad: "));
        
        // Actualizar el record con solo las prescripciones regulares
        setRecord(prev => ({
          ...prev,
          prescriptions: regularPrescriptions
        }));
      }
    }
  }, [existingRecord]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRecord((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    const selectedPet = pets.find(pet => pet.id === value);
    setRecord((prevState) => ({ 
      ...prevState, 
      petId: value,
      userId: selectedPet?.userId || ""
    }));
  };

  const handlePrescriptionsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const prescriptions = e.target.value
      .split("\n")
      .filter((p) => p.trim() !== "");
    setRecord((prevState) => ({ ...prevState, prescriptions }));
  };

  const handleAddProduct = (product: InventorySearchResultAdjusted) => {
    // Construir el nombre completo con presentación y medida (si existen)
    let fullName = product.name;
    
    if (product.presentation) {
      fullName += ` ${product.presentation}`;
    }
    
    // Agregar la medida si existe (este campo podría ser measure, o estar dentro de presentation)
    if (product.measure) {
      fullName += ` - ${product.measure}`;
    }

    setProductsSection((prev) => ({
      ...prev,
      selectedProducts: [
        ...prev.selectedProducts,
        {
          id: product.id,
          name: fullName,
          quantity: 1,
          unitPrice: product.price || 0
        },
      ],
      searchValue: "",
      searchResults: [],
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    setProductsSection((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(
        (p) => p.id !== productId
      ),
    }));
  };

  const handleQuantityChange = (productId: string, value: number) => {
    setProductsSection((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) =>
        p.id === productId
          ? { ...p, quantity: Math.max(1, value) }
          : p
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!record.petId || !record.userId) {
        throw new Error("Se requiere seleccionar una mascota");
      }

      if (!record.visitDate) {
        throw new Error("Se requiere la fecha de visita");
      }

      if (!record.reasonForVisit) {
        throw new Error("Se requiere la razón de la visita");
      }

      // Convertir productos seleccionados a prescripciones
      let updatedPrescriptions = [...record.prescriptions];
      
      // Añadir los productos seleccionados a las prescripciones
      if (productsSection.selectedProducts.length > 0) {
        const productsPrescriptions = productsSection.selectedProducts.map(
          product => `${product.name} - Cantidad: ${product.quantity}`
        );
        
        // Agregar las prescripciones de productos al array existente
        updatedPrescriptions = [...productsPrescriptions, ...updatedPrescriptions];
      }

      // Luego crear o actualizar el historial médico
      const action = record.id ? updateMedicalHistory : addMedicalHistory;
      const result = await action(record.petId, {
        id: record.id,
        visitDate: new Date(record.visitDate),
        reasonForVisit: record.reasonForVisit,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        prescriptions: updatedPrescriptions, // Usando el array actualizado
        notes: record.notes,
      });

      if (result.success) {
        toast({
          title: "Éxito",
          description: record.id
            ? "El historial médico ha sido actualizado correctamente."
            : "El nuevo historial médico ha sido agregado correctamente.",
        });
        
        setIsOpen(false);
      } else {
        throw new Error((result as any).error);
      }
    } catch (error) {
      console.error("Error al procesar el historial médico:", error);
      let errorMessage = "No se pudo procesar el historial médico. Por favor, intente de nuevo.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DialogTrigger asChild>
        {triggerButton ? (
          triggerButton
        ) : existingRecord ? (
          <Button variant="ghost" size="icon">
            <EditIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Historial Médico
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {existingRecord
              ? "Editar Historial Médico"
              : "Agregar Nuevo Historial Médico"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {existingRecord
              ? "Modifique los detalles del historial médico. Haga clic en guardar cuando haya terminado."
              : "Ingrese los detalles del nuevo historial médico. Haga clic en guardar cuando haya terminado."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-red-500 mb-4 text-sm sm:text-base">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            {!petId && !existingRecord && (
              <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="pet" className="sm:text-right text-sm sm:text-base">
                  Mascota
                </Label>
                <div className="sm:col-span-3">
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between"
                        type="button"
                      >
                        {record.petId
                          ? pets.find((pet) => pet.id === record.petId)?.name
                          : "Seleccione una mascota"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      align="start"
                      side="bottom"
                      sideOffset={4}
                    >
                      <Command>
                        <CommandInput
                          placeholder="Buscar mascota..."
                          value={searchValue}
                          onValueChange={setSearchValue}
                          className="border-0"
                        />
                        <CommandEmpty className="p-2">
                          No se encontraron mascotas.
                        </CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                          {pets
                            .filter(
                              (pet) =>
                                pet.name
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase()) ||
                                pet.ownerName
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase()) ||
                                pet.species
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase())
                            )
                            .map((pet) => (
                              <CommandItem
                                key={pet.id}
                                value={pet.id}
                                onSelect={(value) => {
                                  handleSelectChange(value);
                                  setOpenCombobox(false);
                                  setSearchValue("");
                                }}
                                className="cursor-pointer"
                              >
                                {pet.name} ({pet.species}) - Dueño: {pet.ownerName}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label
                htmlFor="visitDate"
                className="sm:text-right text-sm sm:text-base"
              >
                Fecha de Visita
              </Label>
              <Input
                id="visitDate"
                name="visitDate"
                type="date"
                value={record.visitDate}
                onChange={handleInputChange}
                className="sm:col-span-3"
                required
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label
                htmlFor="reasonForVisit"
                className="sm:text-right text-sm sm:text-base"
              >
                Razón de Visita
              </Label>
              <Input
                id="reasonForVisit"
                name="reasonForVisit"
                value={record.reasonForVisit}
                onChange={handleInputChange}
                className="sm:col-span-3"
                required
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label
                htmlFor="diagnosis"
                className="sm:text-right text-sm sm:text-base pt-2"
              >
                Diagnóstico
              </Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={record.diagnosis}
                onChange={handleInputChange}
                className="sm:col-span-3"
                rows={3}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label
                htmlFor="treatment"
                className="sm:text-right text-sm sm:text-base pt-2"
              >
                Tratamiento
              </Label>
              <Textarea
                id="treatment"
                name="treatment"
                value={record.treatment}
                onChange={handleInputChange}
                className="sm:col-span-3"
                rows={3}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label
                htmlFor="prescriptions"
                className="sm:text-right text-sm sm:text-base pt-2"
              >
                Medicamentos y Prescripciones
              </Label>
              <div className="sm:col-span-3 space-y-6">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Buscar medicamento..."
                          value={productsSection.searchValue}
                          onChange={(e) => {
                            console.log('Search input changed:', e.target.value);
                            setProductsSection(prev => ({ 
                              ...prev, 
                              searchValue: e.target.value,
                              searchResults: e.target.value.length < 3 ? [] : prev.searchResults 
                            }));
                          }}
                          className="w-full pl-9"
                        />
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

                    {productsSection.searchValue.length > 0 && productsSection.searchValue.length < 3 && (
                      <div className="text-sm text-gray-500">
                        Ingrese al menos 3 caracteres para buscar
                      </div>
                    )}

                    {productsSection.searchResults.length > 0 && (
                      <div className="border rounded-md bg-white shadow-sm">
                        <Command>
                          <CommandGroup>
                            {productsSection.searchResults.map((product) => (
                              <CommandItem
                                key={product.id}
                                onSelect={() => handleAddProduct(product)}
                                className="cursor-pointer hover:bg-gray-50"
                              >
                                <div className="flex items-center justify-between w-full py-1">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{product.name}</span>
                                    <span className="text-sm text-gray-500">
                                      {product.presentation ? `${product.presentation}` : ''}
                                      {product.measure ? ` - ${product.measure}` : ''}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    Stock: {product.quantity}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </div>
                    )}

                    {productsSection.searchValue.length >= 3 && productsSection.searchResults.length === 0 && (
                      <div className="text-sm text-gray-500">
                        No se encontraron medicamentos
                      </div>
                    )}

                    {productsSection.selectedProducts.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Productos Seleccionados</div>
                        <div className="rounded-lg border bg-gray-50 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-100">
                                <TableHead>Producto</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {productsSection.selectedProducts.map((product) => (
                                <TableRow key={product.id}>
                                  <TableCell>{product.name}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={product.quantity}
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          product.id,
                                          parseInt(e.target.value)
                                        )
                                      }
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveProduct(product.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Prescripciones e Instrucciones Adicionales</Label>
                    <span className="text-sm text-gray-500">Opcional</span>
                  </div>
                  <Textarea
                    id="prescriptions"
                    name="prescriptions"
                    value={record.prescriptions.join("\n")}
                    onChange={handlePrescriptionsChange}
                    placeholder="Ingrese instrucciones específicas o medicamentos que no estén en el inventario..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label
                htmlFor="notes"
                className="sm:text-right text-sm sm:text-base pt-2"
              >
                Notas Internas
              </Label>
              <div className="sm:col-span-3 space-y-2">
                <span className="text-sm text-gray-500 block">Notas adicionales para el expediente (opcional)</span>
                <Textarea
                  id="notes"
                  name="notes"
                  value={record.notes}
                  onChange={handleInputChange}
                  placeholder="Ingrese notas internas que no aparecerán en la receta..."
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {existingRecord ? "Actualizando..." : "Guardando..."}
                </>
              ) : (
                existingRecord ? "Actualizar Historial Médico" : "Guardar Historial Médico"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
