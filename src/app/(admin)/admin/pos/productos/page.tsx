import { Metadata } from "next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { DataTable } from "../../../../../components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Gestión de Productos | POS",
  description: "Administra los precios y costos de los productos"
};

export default async function ProductosPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    return redirect("/auth-callback");
  }

  // Obtener todos los productos activos con sus detalles relevantes
  const products = await prisma.inventoryItem.findMany({
    where: {
      status: "ACTIVE"
    },
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      price: true,
      cost: true,
      quantity: true,
      measure: true,
      presentation: true,
      brand: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Formatear los datos para la tabla
  const formattedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description || 'Sin descripción',
    price: product.price || 0,
    cost: product.cost || 0,
    quantity: product.quantity,
    measure: product.measure || 'N/A',
    presentation: product.presentation || 'N/A',
    brand: product.brand || 'N/A',
    margin: product.price && product.cost ? 
      ((product.price - product.cost) / product.cost * 100).toFixed(2) + '%' : 
      'N/A'
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Gestión de Productos</h1>
        <p className="mt-2 text-gray-600">
          Administra los precios, costos y márgenes de los productos del inventario
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable 
          columns={columns} 
          data={formattedProducts}
          searchKey="name"
        />
      </div>
    </div>
  );
} 