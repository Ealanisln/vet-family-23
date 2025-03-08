// src/app/(admin)/admin/pos/servicios/nuevo/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Clock, DollarSign } from "lucide-react";
import { createService } from "@/app/actions/pos/services";
import { translateServiceCategory } from "@/utils/pos-helpers";
import { userHasPOSPermission } from "@/utils/pos-helpers";

export const metadata: Metadata = {
  title: "Nuevo Servicio | POS",
  description: "Crear un nuevo servicio para el sistema POS"
};

export default async function NewServicePage() {
  // Verificar que el usuario tiene permisos para el POS
  const session = await getServerSession();
  
  if (!session) {
    return redirect("/login");
  }
  
  const hasPermission = await userHasPOSPermission(session.user?.id);
  
  if (!hasPermission) {
    return redirect("/admin");
  }

  const serviceCategories = [
    "CONSULTATION",
    "SURGERY",
    "VACCINATION",
    "GROOMING",
    "DENTAL",
    "LABORATORY",
    "IMAGING",
    "HOSPITALIZATION",
    "OTHER"
  ];
  
  async function handleCreateService(formData: FormData) {
    "use server";
    
    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const category = formData.get("category") as string;
      const price = parseFloat(formData.get("price") as string);
      const duration = formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined;
      
      if (!name || !category || isNaN(price)) {
        throw new Error("Faltan campos obligatorios o el precio no es válido");
      }
      
      const result = await createService({
        name,
        description,
        category,
        price,
        duration,
      });
      
      if (result.success) {
        redirect("/admin/pos/servicios");
      } else {
        throw new Error(result.error || "Error al crear el servicio");
      }
    } catch (error) {
      console.error("Error al crear el servicio:", error);
      // En un caso real, aquí manejarías el error de creación
    }
  }
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link
          href="/admin/pos/servicios"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a servicios
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Nuevo Servicio</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Información del servicio</CardTitle>
          <CardDescription>Ingresa los detalles del nuevo servicio</CardDescription>
        </CardHeader>
        <form action={handleCreateService}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="required">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Consulta médica general"
                  required
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="required">Categoría</Label>
                <Select name="category" required defaultValue={serviceCategories[0]}>
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/pos/servicios">Cancelar</Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Guardar Servicio
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}