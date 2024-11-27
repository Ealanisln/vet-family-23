import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addDeworming,
  updateDeworming,
  getAvailableProducts,
} from "@/app/actions/deworming";

interface Product {
  id: string;
  name: string;
  quantity: number;
  presentation: string | null;
  measure: string | null;
  brand: string | null;
}

interface ProductsResponse {
  success: boolean;
  products?: Product[];
  error?: string;
}

const dewormingSchema = z.object({
  applicationDate: z.string().min(1, "La fecha de aplicación es requerida"),
  nextApplication: z
    .string()
    .min(1, "La fecha de próxima aplicación es requerida"),
  weight: z.string().min(1, "El peso es requerido"),
  dose: z.string().min(1, "La dosis es requerida"),
  lotNumber: z.string().optional(),
  veterinarianName: z.string().optional(),
  effectiveness: z.string().optional(),
  sideEffects: z.string().optional(),
  notes: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0").optional(),
});

interface DewormingFormProps {
  petId: string;
  type: "INTERNAL" | "EXTERNAL";
  existingRecord?: any; // Tipo más específico según tu implementación
  onSuccess: () => void;
}

export function DewormingForm({
  petId,
  type,
  existingRecord,
  onSuccess,
}: DewormingFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await getAvailableProducts(type);
        if (result.success && result.products) {
          setProducts(result.products);
        } else {
          // Si no hay productos o hay un error, establecemos un array vacío
          setProducts([]);
          console.error("Error loading products:", result.error);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [type]);

  const form = useForm<z.infer<typeof dewormingSchema>>({
    resolver: zodResolver(dewormingSchema),
    defaultValues: {
      applicationDate: existingRecord
        ? existingRecord.applicationDate.toISOString().split("T")[0]
        : "",
      nextApplication: existingRecord
        ? existingRecord.nextApplication.toISOString().split("T")[0]
        : "",
      weight: existingRecord ? String(existingRecord.weight) : "",
      dose: existingRecord?.dose || "",
      lotNumber: existingRecord?.lotNumber || "",
      veterinarianName: existingRecord?.veterinarianName || "",
      effectiveness: existingRecord?.effectiveness || "",
      sideEffects: existingRecord?.sideEffects || "",
      notes: existingRecord?.notes || "",
      productId: existingRecord?.productId || "",
      quantity: existingRecord?.quantity || 1,
    },
  });

  async function onSubmit(values: z.infer<typeof dewormingSchema>) {
    try {
      const action = existingRecord
        ? await updateDeworming(existingRecord.id, values)
        : await addDeworming(petId, type, values);

      if (!action.success) {
        console.error(action.error);
        // Aquí podrías agregar una notificación de error
        return;
      }

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el registro:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="applicationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Aplicación</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextApplication"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Próxima Aplicación</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosis</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto</FormLabel>
                <Select
                  disabled={loading}
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                        {product.presentation && ` - ${product.presentation}`}
                        {` (${product.quantity} disponibles)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad utilizada</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lotNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Lote</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="veterinarianName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veterinario</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="effectiveness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Efectividad</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sideEffects"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Efectos Secundarios</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Adicionales</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit">
            {existingRecord ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
