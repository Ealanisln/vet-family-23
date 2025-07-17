"use client";

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Save, Clock, DollarSign, Loader2, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createService } from "@/app/actions/pos/services"; // Adjust path if needed
import { translateServiceCategory } from "@/utils/pos-helpers"; // Adjust path if needed
// Manual type definition due to Prisma client export issues
type ServiceCategory = 'CONSULTATION' | 'SURGERY' | 'VACCINATION' | 'GROOMING' | 'DENTAL' | 'LABORATORY' | 'IMAGING' | 'HOSPITALIZATION' | 'OTHER';
import { cn } from "@/lib/utils"; // Import the cn utility

interface NewServiceFormProps {
  serviceCategories: ServiceCategory[];
}

export function NewServiceForm({ serviceCategories }: NewServiceFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setMessageType(null);

    const formData = new FormData(event.currentTarget);

    try {
      const name = formData.get("name") as string;
      const category = formData.get("category") as ServiceCategory;
      const priceStr = formData.get("price") as string;

      if (!name || !category || !priceStr) {
        throw new Error("Faltan campos obligatorios.");
      }
      const price = parseFloat(priceStr);
      if (isNaN(price)) {
        throw new Error("El precio no es un número válido.");
      }

      const description = formData.get("description") as string;
      const durationStr = formData.get("duration") as string;
      const duration = durationStr ? parseInt(durationStr) : undefined;
      if (durationStr && isNaN(duration as number)) {
        throw new Error("La duración no es un número válido.");
      }

      const result = await createService({
        name,
        description,
        category,
        price,
        duration,
      });

      if (result.success) {
        setMessage("Servicio creado exitosamente.");
        setMessageType('success');
        formRef.current?.reset();
      } else {
        throw new Error(result.error || "Error desconocido al crear el servicio.");
      }
    } catch (error) {
      console.error("Error al crear el servicio:", error);
      setMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del servicio</CardTitle>
        <CardDescription>Ingresa los detalles del nuevo servicio</CardDescription>
      </CardHeader>
      <form ref={formRef} onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {message && (
            <Alert
              variant={messageType === 'error' ? 'destructive' : undefined}
              className={cn(
                "relative w-full rounded-lg border p-4 [&:has(svg)]:pl-14 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
                messageType === 'success' && "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950",
                messageType !== 'error' && messageType !== 'success' && "border-gray-200 bg-background"
              )}
            >
              <Terminal className={cn(
                "h-4 w-4",
                messageType === 'success' && "text-green-700 dark:text-green-400"
              )} />
              <AlertTitle className={cn(
                messageType === 'success' && "text-green-900 dark:text-green-200"
              )}>
                {messageType === 'success' ? 'Éxito' : 'Error'}
              </AlertTitle>
              <AlertDescription className={cn(
                messageType === 'success' && "text-green-700 dark:text-green-400"
              )}>
                {message}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="required">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Consulta médica general"
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="required">Categoría</Label>
              <Select name="category" required defaultValue={serviceCategories[0]} disabled={isLoading}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {translateServiceCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="required">Precio</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="30"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe el servicio y lo que incluye..."
              rows={4}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/admin/pos/servicios">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Guardando..." : "Guardar Servicio"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 