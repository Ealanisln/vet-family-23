// src/app/(admin)/admin/pos/servicios/[id]/page.tsx
import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { getServiceById } from "@/app/actions/pos/services";
import { formatCurrency, translateServiceCategory } from "@/utils/pos-helpers";
import { userHasPOSPermission } from "@/utils/pos-helpers";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const service = await getServiceById(params.id);
    return {
      title: service ? `${service.name} | Servicios POS` : "Servicio no encontrado",
      description: service?.description || "Detalle del servicio"
    };
  } catch (error) {
    return {
      title: "Servicio | POS",
      description: "Detalle del servicio"
    };
  }
}

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  // Verificar que el usuario tiene permisos para el POS
  const session = await getServerSession();
  
  if (!session) {
    return redirect("/login");
  }
  
  const hasPermission = await userHasPOSPermission(session.user?.id);
  
  if (!hasPermission) {
    return redirect("/admin");
  }
  
  // Obtener el servicio
  const service = await getServiceById(params.id);
  
  if (!service) {
    return notFound();
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
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{service.name}</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {translateServiceCategory(service.category)}
            </Badge>
            {service.isActive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Activo
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Inactivo
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/pos/servicios/${service.id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" asChild>
            <Link href={`/admin/pos/servicios/${service.id}/eliminar`}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Información principal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información del servicio</CardTitle>
            <CardDescription>Detalles del servicio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {service.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Descripción
                </h3>
                <p className="text-gray-700">{service.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Categoría
                </h3>
                <p className="text-gray-700">
                  {translateServiceCategory(service.category)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Precio
                </h3>
                <p className="text-gray-700 font-semibold">
                  {formatCurrency(service.price)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Duración
                </h3>
                <p className="text-gray-700 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {service.duration ? `${service.duration} minutos` : 'No especificada'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Estado
                </h3>
                <p className="text-gray-700">
                  {service.isActive ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Información sobre el uso del servicio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">Ventas totales</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">Ingresos generados</span>
                <span className="font-medium">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">Última venta</span>
                <span className="font-medium">N/A</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Próximas citas</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/pos/ventas/nueva">
                <Calendar className="h-4 w-4 mr-2" />
                Nueva venta con este servicio
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}