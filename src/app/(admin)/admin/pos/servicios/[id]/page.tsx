import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getServiceById } from "@/app/actions/pos/services";
import { userHasPOSPermission } from "@/utils/pos-helpers";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/pos-helpers";

export const metadata: Metadata = {
  title: "Detalle de Servicio | POS",
  description: "Detalles del servicio veterinario"
};

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  // Verificar que el usuario tiene permisos para el POS
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return redirect("/api/auth/login");
  }
  
  const user = await getUser();
  
  const hasPermission = await userHasPOSPermission(user.id);
  
  if (!hasPermission) {
    return redirect("/admin");
  }
  
  // Obtener los detalles del servicio
  const service = await getServiceById(params.id);
  
  if (!service) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Detalle de Servicio</h1>
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Servicio no encontrado</AlertTitle>
          <AlertDescription>
            No se encontró el servicio solicitado. Puede haber sido eliminado o no existe.
          </AlertDescription>
        </Alert>
        
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/admin/pos/servicios">Volver a Servicios</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detalle de Servicio</h1>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/admin/pos/servicios">Volver a Servicios</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/pos/servicios/${service.id}/editar`}>Editar Servicio</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd className="mt-1 text-lg font-semibold">{service.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                <dd className="mt-1">{service.description || "Sin descripción"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Precio</dt>
                <dd className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(service.price)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Categoría</dt>
                <dd className="mt-1">{service.category || "Sin categoría"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Duración Aproximada</dt>
                <dd className="mt-1">{service.duration ? `${service.duration} minutos` : "No especificada"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {service.active ? "Activo" : "Inactivo"}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Productos Asociados</CardTitle>
          </CardHeader>
          <CardContent>
            {service.products && service.products.length > 0 ? (
              <div className="space-y-4">
                {service.products.map((product: { id: string; name: string; quantity: number; price: number }) => (
                  <div key={product.id} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {product.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p>{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Este servicio no tiene productos asociados.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            {service.sales && service.sales.length > 0 ? (
              <div className="space-y-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {service.sales.map((sale: { 
                        id: string; 
                        date: string | Date; 
                        customer?: { name?: string } | null; 
                        price: number;
                        saleId: string;
                      }) => (
                      <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(sale.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {sale.customer?.name || "Cliente no registrado"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCurrency(sale.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/pos/ventas/${sale.saleId}`}>Ver Venta</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Este servicio no ha sido vendido aún.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}