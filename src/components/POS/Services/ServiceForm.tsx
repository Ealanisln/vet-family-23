// src/components/POS/Services/ServiceForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Save, DollarSign, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { createService, updateService } from "@/app/actions/pos/services";
import { translateServiceCategory } from "@/utils/pos-helpers";
import type { Service } from "@/types/pos";

interface ServiceFormProps {
  service?: Service;
  isEditing?: boolean;
}

export default function ServiceForm({
  service,
  isEditing = false,
}: ServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valores iniciales
  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [category, setCategory] = useState(service?.category || "CONSULTATION");
  const [price, setPrice] = useState(service?.price?.toString() || "");
  const [duration, setDuration] = useState(service?.duration?.toString() || "");
  const [isActive, setIsActive] = useState(service?.isActive !== false);

  const serviceCategories = [
    "CONSULTATION",
    "SURGERY",
    "VACCINATION",
    "GROOMING",
    "DENTAL",
    "LABORATORY",
    "IMAGING",
    "HOSPITALIZATION",
    "OTHER",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !category || !price || isNaN(parseFloat(price))) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && service) {
        // Actualizar servicio existente
        const result = await updateService(service.id, {
          name,
          description,
          category,
          price: parseFloat(price),
          duration: duration ? parseInt(duration) : undefined,
          isActive,
        });

        if (result.success) {
          toast({
            title: "Servicio actualizado",
            description: "El servicio ha sido actualizado correctamente.",
          });

          router.push(`/admin/pos/servicios/${service.id}`);
          router.refresh();
        } else {
          throw new Error(result.error || "Error al actualizar el servicio");
        }
      } else {
        // Crear nuevo servicio
        const result = await createService({
          name,
          description,
          category,
          price: parseFloat(price),
          duration: duration ? parseInt(duration) : undefined,
        });

        if (result.success) {
          toast({
            title: "Servicio creado",
            description: "El servicio ha sido creado correctamente.",
          });

          router.push("/admin/pos/servicios");
          router.refresh();
        } else {
          throw new Error(result.error || "Error al crear el servicio");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al procesar el servicio",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar servicio" : "Nuevo servicio"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la información del servicio existente"
            : "Ingresa los detalles del nuevo servicio"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="required">
                Nombre
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Consulta médica general"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="required">
                Categoría
              </Label>
              <Select
                value={category}
                onValueChange={(value: string) => {
                  setCategory(value as typeof category);
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {translateServiceCategory(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="required">
                Precio
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el servicio y lo que incluye..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {isEditing && (
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSubmitting}
              />
              <Label htmlFor="active">Servicio activo</Label>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Actualizar servicio" : "Guardar servicio"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
