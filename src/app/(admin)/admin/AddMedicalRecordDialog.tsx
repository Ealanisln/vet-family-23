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
import { searchInventory, getProductById } from "@/app/actions/pos/inventory";
import { useToast } from "@/components/ui/use-toast";
import { EditIcon, PlusCircle, Search, X } from "lucide-react";
import { InventoryItemWithPrice } from "@/lib/type-adapters";
import { createMedicalOrder } from "@/app/actions/medical-orders";

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
  medicalOrderId?: string;
}

interface SelectedProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ProductSection {
  isOpen: boolean;
  selectedProducts: SelectedProduct[];
  searchValue: string;
  searchResults: InventoryItemWithPrice[];
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
        const result = await getPetsForMedicalRecord();
        if (result.success) {
          // Filter out deceased pets
          const alivePets = result.pets.filter((pet) => !pet.isDeceased);
          setPets(alivePets);
          setError(null);
        } else {
          console.error("Error fetching pets:", result.error);
          setError(
            "No se pudieron cargar las mascotas. Por favor, intente de nuevo más tarde."
          );
        }
      } else {
        // Si tenemos un petId o existingRecord, cargar solo esa mascota
        const result = await getPetsForMedicalRecord();
        if (result.success) {
          const targetPetId = petId || existingRecord?.petId;
          const targetPet = result.pets.find(pet => pet.id === targetPetId);
          if (targetPet) {
            setPets([targetPet]);
            setError(null);
          }
        }
      }
    };
    fetchPets();
  }, [petId, existingRecord, isOpen]);

  // Efecto para búsqueda automática mientras se escribe
  useEffect(() => {
    const searchProducts = async () => {
      if (productsSection.searchValue.trim().length > 2) {
        const results = await searchInventory({
          searchTerm: productsSection.searchValue,
          limit: 5,
        });
        setProductsSection(prev => ({ ...prev, searchResults: results }));
      } else {
        setProductsSection(prev => ({ ...prev, searchResults: [] }));
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [productsSection.searchValue]);

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

  const handleAddProduct = (product: InventoryItemWithPrice) => {
    setProductsSection((prev) => ({
      ...prev,
      selectedProducts: [
        ...prev.selectedProducts,
        {
          id: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.price || 0,
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

  const handleQuantityChange = (productId: string, quantity: number) => {
    setProductsSection((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) =>
        p.id === productId
          ? { ...p, quantity: Math.max(1, quantity) }
          : p
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar stock antes de crear la orden
      for (const product of productsSection.selectedProducts) {
        const stockResult = await getProductById(product.id);
        
        if (!stockResult || stockResult.quantity < product.quantity) {
          toast({
            title: "Error de Stock",
            description: `No hay suficiente stock de ${product.name}. Stock disponible: ${stockResult?.quantity || 0}`,
            variant: "destructive",
          });
          return;
        }
      }
      
      // Si no hay userId pero tenemos petId, obtener el userId de la mascota seleccionada
      let userId = record.userId;
      if (!userId && record.petId) {
        const selectedPet = pets.find(pet => pet.id === record.petId);
        userId = selectedPet?.userId || "";
      }

      if (!userId) {
        toast({
          title: "Error",
          description: "No se pudo identificar al dueño de la mascota",
          variant: "destructive",
        });
        return;
      }
      
      // Primero crear la orden médica si hay productos seleccionados
      let medicalOrderId: string | undefined;
      
      if (productsSection.selectedProducts.length > 0) {
        const orderData = {
          petId: record.petId,
          userId: userId,
          visitDate: new Date(record.visitDate),
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          prescriptions: record.prescriptions,
          notes: record.notes,
          products: productsSection.selectedProducts.map(product => ({
            productId: product.id,
            quantity: product.quantity,
            unitPrice: product.unitPrice
          }))
        };

        const orderResult = await createMedicalOrder(orderData);
        
        if (!orderResult.success) {
          toast({
            title: "Error",
            description: orderResult.error || "No se pudo crear la orden médica",
            variant: "destructive",
          });
          return;
        }

        medicalOrderId = orderResult.order?.id;
        
        // Mostrar toast con instrucciones claras
        toast({
          title: "Orden Médica Creada",
          description: "La orden médica se ha creado correctamente. Serás redirigido al POS para procesar el pago.",
          duration: 5000,
        });
      }

      // Luego crear o actualizar el historial médico
      const action = record.id ? updateMedicalHistory : addMedicalHistory;
      const result = await action(record.petId, {
        id: record.id,
        visitDate: new Date(record.visitDate),
        reasonForVisit: record.reasonForVisit,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        prescriptions: record.prescriptions,
        notes: record.notes,
        medicalOrderId
      });

      if (result.success) {
        toast({
          title: "Éxito",
          description: record.id
            ? "El historial médico ha sido actualizado correctamente."
            : "El nuevo historial médico ha sido agregado correctamente.",
        });
        
        // Si hay una orden médica, redirigir al POS después de un breve delay
        if (medicalOrderId) {
          setTimeout(() => {
            window.location.href = `/admin/pos/ventas/nueva?orderId=${medicalOrderId}`;
          }, 2000);
        } else {
          setIsOpen(false);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error al procesar el historial médico:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el historial médico. Por favor, intente de nuevo.",
        variant: "destructive",
      });
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
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="text-base font-medium">Productos del Inventario</h4>
                      <span className="text-sm text-gray-500">Seleccione los productos a dispensar</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Buscar medicamento o producto..."
                          value={productsSection.searchValue}
                          onChange={(e) => setProductsSection(prev => ({ ...prev, searchValue: e.target.value }))}
                          className="w-full pl-9"
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (productsSection.searchValue.trim().length > 0) {
                                const results = await searchInventory({
                                  searchTerm: productsSection.searchValue,
                                  limit: 5,
                                });
                                setProductsSection(prev => ({ ...prev, searchResults: results }));
                              }
                            }
                          }}
                        />
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

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
                                      {product.presentation || 'N/A'} • Stock: {product.quantity || 0}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium">
                                    ${product.price}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
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
                                <TableHead>Precio Unit.</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {productsSection.selectedProducts.map((product) => (
                                <TableRow key={product.id}>
                                  <TableCell className="font-medium">{product.name}</TableCell>
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
                                  <TableCell>${product.unitPrice}</TableCell>
                                  <TableCell className="font-medium">
                                    ${(product.quantity * product.unitPrice).toFixed(2)}
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
                              <TableRow className="bg-gray-100">
                                <TableCell colSpan={3} className="text-right font-medium">
                                  Total a Cobrar:
                                </TableCell>
                                <TableCell className="font-medium text-lg">
                                  $
                                  {productsSection.selectedProducts.reduce(
                                    (acc, product) =>
                                      acc + product.quantity * product.unitPrice,
                                    0
                                  ).toFixed(2)}
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>
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
            <Button type="submit" className="w-full sm:w-auto">
              {existingRecord
                ? "Actualizar Historial Médico"
                : "Guardar Historial Médico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
