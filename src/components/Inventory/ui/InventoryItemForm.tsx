// components/Inventory/ui/InventoryItemForm.tsx

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InventoryFormProps,
  InventoryItemFormData,
  FormErrors,
  InventoryCategory,
} from "@/types/inventory";

const INITIAL_FORM_STATE: InventoryItemFormData = {
  name: "",
  category: "MEDICINE",
  description: null,
  activeCompound: null,
  presentation: null,
  measure: null,
  brand: null,
  quantity: 0,
  minStock: 0,
  location: null,
  expirationDate: null,
  batchNumber: null,
  specialNotes: null,
};

const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  MEDICINE: "Medicina",
  SURGICAL_MATERIAL: "Material Quirúrgico",
  VACCINE: "Vacuna",
  FOOD: "Alimento",
  ACCESSORY: "Accesorio",
  CONSUMABLE: "Consumible",
};

const InventoryItemForm: React.FC<InventoryFormProps> = ({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] =
    React.useState<InventoryItemFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = React.useState<FormErrors>({});

  React.useEffect(() => {
    if (initialData) {
      const formatted: InventoryItemFormData = {
        name: initialData.name,
        category: initialData.category,
        description: initialData.description,
        activeCompound: initialData.activeCompound,
        presentation: initialData.presentation,
        measure: initialData.measure,
        brand: initialData.brand,
        quantity: initialData.quantity,
        minStock: initialData.minStock ?? 0,
        location: initialData.location,
        expirationDate: initialData.expirationDate
          ? new Date(initialData.expirationDate).toISOString().split("T")[0]
          : null,
        batchNumber: initialData.batchNumber,
        specialNotes: initialData.specialNotes,
      };
      setFormData(formatted);
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.category) {
      newErrors.category = "La categoría es requerida";
    }

    if (typeof formData.quantity !== "number" || formData.quantity < 0) {
      newErrors.quantity = "La cantidad no puede ser negativa";
    }

    if (typeof formData.minStock !== "number" || formData.minStock < 0) {
      newErrors.minStock = "El stock mínimo no puede ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData: InventoryItemFormData = {
      ...formData,
      quantity: Number(formData.quantity),
      minStock: Number(formData.minStock),
      expirationDate: formData.expirationDate || null,
    };

    await onSubmit(submitData);
  };

  const handleChange = (
    name: keyof InventoryItemFormData,
    value: string | number
  ) => {
    setFormData((prev: InventoryItemFormData) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Item" : "Nuevo Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Información básica */}
            <div className="col-span-2 space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">{errors.name}</span>
                )}
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: InventoryCategory) =>
                    handleChange("category", value)
                  }
                >
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as InventoryCategory[]).map(
                      (category) => (
                        <SelectItem key={category} value={category}>
                          {CATEGORY_LABELS[category]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <span className="text-sm text-red-500">
                    {errors.category}
                  </span>
                )}
              </div>
            </div>

            {/* Cantidades */}
            <div>
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity.toString()}
                onChange={(e) =>
                  handleChange("quantity", parseInt(e.target.value) || 0)
                }
                min="0"
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <span className="text-sm text-red-500">{errors.quantity}</span>
              )}
            </div>

            <div>
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                value={(formData.minStock ?? 0).toString()}
                onChange={(e) =>
                  handleChange("minStock", parseInt(e.target.value) || 0)
                }
                min="0"
                className={errors.minStock ? "border-red-500" : ""}
              />
              {errors.minStock && (
                <span className="text-sm text-red-500">{errors.minStock}</span>
              )}
            </div>

            {/* Detalles del producto */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="presentation">Presentación</Label>
                <Input
                  id="presentation"
                  value={formData.presentation || ""}
                  onChange={(e) => handleChange("presentation", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="measure">Medida</Label>
                <Input
                  id="measure"
                  value={formData.measure || ""}
                  onChange={(e) => handleChange("measure", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand || ""}
                  onChange={(e) => handleChange("brand", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
            </div>

            {/* Fechas y lote */}
            <div>
              <Label htmlFor="expirationDate">Fecha de Expiración</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate || ""}
                onChange={(e) => handleChange("expirationDate", e.target.value)}
                className={errors.expirationDate ? "border-red-500" : ""}
              />
              {errors.expirationDate && (
                <span className="text-sm text-red-500">
                  {errors.expirationDate}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="batchNumber">Número de Lote</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber || ""}
                onChange={(e) => handleChange("batchNumber", e.target.value)}
              />
            </div>

            {/* Campos adicionales */}
            <div className="col-span-2">
              <Label htmlFor="activeCompound">Compuesto Activo</Label>
              <Input
                id="activeCompound"
                value={formData.activeCompound || ""}
                onChange={(e) => handleChange("activeCompound", e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="specialNotes">Notas Especiales</Label>
              <Textarea
                id="specialNotes"
                value={formData.specialNotes || ""}
                onChange={(e) => handleChange("specialNotes", e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Por favor corrige los errores antes de continuar
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#47b3b6] hover:bg-[#47b3b6]/90 text-white"
            >
              {isSubmitting
                ? "Guardando..."
                : initialData
                  ? "Guardar Cambios"
                  : "Crear Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemForm;
