import React from "react";
import { AlertTriangle, Package, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Card } from "@/components/ui/card";
import {
  InventoryFormProps,
  InventoryItemFormData,
  FormErrors,
  InventoryCategory,
} from "@/types/inventory";
import { ORDERED_CATEGORY_TRANSLATIONS  } from "@/utils/category-translations";


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

const InventoryItemForm: React.FC<InventoryFormProps> = ({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = React.useState<InventoryItemFormData>(INITIAL_FORM_STATE);
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
    value: string | number | InventoryCategory
  ) => {
    setFormData((prev) => ({
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
      <DialogContent className="max-w-4xl w-full h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {initialData ? "Editar Item de Inventario" : "Nuevo Item de Inventario"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {initialData 
                  ? "Modifica los detalles del item seleccionado" 
                  : "Ingresa los detalles del nuevo item de inventario"
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección Superior - Información Principal */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full">
                <Label htmlFor="name" className="text-gray-500">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <span className="text-sm text-red-500 mt-1">{errors.name}</span>
                )}
              </div>
              
              <div className="col-span-full">
                <Label htmlFor="category" className="text-gray-500">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: InventoryCategory) => handleChange("category", value)}
                >
                  <SelectTrigger className={`mt-1 ${errors.category ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDERED_CATEGORY_TRANSLATIONS ).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <span className="text-sm text-red-500 mt-1">{errors.category}</span>
                )}
              </div>
            </div>
          </Card>

          {/* Cantidades y Stock */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Existencias</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="quantity" className="text-gray-500">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity.toString()}
                  onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                  min="0"
                  className={`mt-1 ${errors.quantity ? "border-red-500" : ""}`}
                />
                {errors.quantity && (
                  <span className="text-sm text-red-500 mt-1">{errors.quantity}</span>
                )}
              </div>

              <div>
                <Label htmlFor="minStock" className="text-gray-500">Stock Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={(formData.minStock ?? 0).toString()}
                  onChange={(e) => handleChange("minStock", parseInt(e.target.value) || 0)}
                  min="0"
                  className={`mt-1 ${errors.minStock ? "border-red-500" : ""}`}
                />
                {errors.minStock && (
                  <span className="text-sm text-red-500 mt-1">{errors.minStock}</span>
                )}
              </div>
            </div>
          </Card>

          {/* Detalles del Producto */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Producto</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="presentation" className="text-gray-500">Presentación</Label>
                <Input
                  id="presentation"
                  value={formData.presentation || ""}
                  onChange={(e) => handleChange("presentation", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="measure" className="text-gray-500">Medida</Label>
                <Input
                  id="measure"
                  value={formData.measure || ""}
                  onChange={(e) => handleChange("measure", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="brand" className="text-gray-500">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand || ""}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Fechas y Lote */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="expirationDate" className="text-gray-500">Fecha de Expiración</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate || ""}
                  onChange={(e) => handleChange("expirationDate", e.target.value)}
                  className={`mt-1 ${errors.expirationDate ? "border-red-500" : ""}`}
                />
                {errors.expirationDate && (
                  <span className="text-sm text-red-500 mt-1">{errors.expirationDate}</span>
                )}
              </div>

              <div>
                <Label htmlFor="batchNumber" className="text-gray-500">Número de Lote</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber || ""}
                  onChange={(e) => handleChange("batchNumber", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="col-span-full">
                <Label htmlFor="activeCompound" className="text-gray-500">Compuesto Activo</Label>
                <Input
                  id="activeCompound"
                  value={formData.activeCompound || ""}
                  onChange={(e) => handleChange("activeCompound", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Descripción y Notas */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Descripción y Notas</h4>
            <div className="space-y-6">
              <div>
                <Label htmlFor="description" className="text-gray-500">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="specialNotes" className="text-gray-500">Notas Especiales</Label>
                <Textarea
                  id="specialNotes"
                  value={formData.specialNotes || ""}
                  onChange={(e) => handleChange("specialNotes", e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </Card>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Por favor corrige los errores antes de continuar
              </AlertDescription>
            </Alert>
          )}

<DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </div>
              ) : initialData ? (
                "Guardar Cambios"
              ) : (
                "Crear Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemForm;